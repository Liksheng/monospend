import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY or VITE_GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const Category = {
    Food: 'Food',
    Transport: 'Transport',
    Utilities: 'Utilities',
    Shopping: 'Shopping',
    Entertainment: 'Entertainment',
    Health: 'Health',
    Tech: 'Tech',
    Other: 'Other'
};

app.post('/api/gemini/parse', async (req, res) => {
    try {
        const { input, dateContext } = req.body;
        const modelId = "gemini-2.5-flash";
        const today = new Date().toISOString().split('T')[0];

        const dateInstruction = dateContext
            ? `USER_OVERRIDE_DATE: ${dateContext}.`
            : `SYSTEM_DATE: ${today}.`;

        const prompt = `
            SYSTEM_INPUT_ANALYSIS: "${input}".
            ${dateInstruction}

            TASK: Analyze input and extract one or more items.
            The input might contain multiple distinct expenses or wishlist items separated by commas, 'and', or spaces.

            CLASSIFY EACH ITEM: EXPENSE or WISHLIST.

            EXAMPLES:
            "Taxi RM45" -> [{type: expense, amount: 45, description: Taxi...}]
            "Save for CyberDeck 1200" -> [{type: wishlist, amount: 1200, description: CyberDeck}]
            "KFC 200, Taxi 50" -> [{type: expense, amount: 200, description: KFC}, {type: expense, amount: 50, description: Taxi}]
            "Lunch 15 and Wishlist Bike 500" -> [{type: expense, amount: 15}, {type: wishlist, amount: 500}]
            "Ate KFC whole week for 70" -> Return 7 separate expense objects, each with amount: 10, description: "KFC", and consecutive dates ending on SYSTEM_DATE.

            EXTRACT: amount, description for EACH item.
            IF EXPENSE: extract category, date.
            IF WISHLIST: set type='wishlist'.

            RULES:
            - "Wishlist" keyword implies type='wishlist'.
            - Default currency is user's local currency (assume RM amount).
            - CATEGORIES: Food, Transport, Utilities, Shopping, Entertainment, Health, Tech, Other.
            - DURATION RULE: If the input implies a duration (e.g., "whole week", "past 3 days"), you MUST divide the total amount evenly by the number of days. Output a separate JSON object for EACH individual day, calculating the correct dates going backward from SYSTEM_DATE.

            RETURN JSON ARRAY of objects.
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ["expense", "wishlist"] },
                        amount: { type: Type.NUMBER },
                        category: { type: Type.STRING, enum: Object.values(Category), nullable: true },
                        description: { type: Type.STRING },
                        date: { type: Type.STRING, description: "ISO 8601 date string YYYY-MM-DD", nullable: true },
                    },
                    required: ["type", "amount", "description"],
                }
                },
            },
        });

        if (!response.text) {
             return res.status(500).json({ error: "Empty response from Gemini" });
        }

        const result = JSON.parse(response.text);
        res.json(result);
    } catch (error: any) {
        console.error("Error parsing input with Gemini:", error);
        if (error?.status === 429) {
            res.status(429).json({ error: "API_RATE_LIMIT_EXCEEDED" });
        } else if (error?.status === 503 || error?.message?.includes("fetch") || error?.message?.includes("network")) {
            res.status(503).json({ error: "NETWORK_DISCONNECTED" });
        } else {
            res.status(500).json({ error: "SYSTEM FAILURE", details: error.message });
        }
    }
});

app.post('/api/gemini/parse-receipt', async (req, res) => {
    try {
        const { base64Image } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: "Analyze this receipt. Extract the total amount, a brief description (e.g., Store Name), and categorize it (Food, Tech, Transport, etc). Return JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ["expense"] },
                        amount: { type: Type.NUMBER },
                        category: { type: Type.STRING, enum: Object.values(Category) },
                        description: { type: Type.STRING },
                        date: { type: Type.STRING, description: "ISO 8601 date" }
                    },
                    required: ["amount", "description", "category"]
                }
            }
        });

        if (!response.text) {
            return res.status(500).json({ error: "Empty response from Gemini" });
        }
        res.json(JSON.parse(response.text));
     } catch (error: any) {
        console.error("Optical Ingest Failed", error);
        if (error?.status === 429) {
            res.status(429).json({ error: "API_RATE_LIMIT_EXCEEDED" });
        } else if (error?.status === 503 || error?.message?.includes("fetch") || error?.message?.includes("network")) {
            res.status(503).json({ error: "NETWORK_DISCONNECTED" });
        } else {
             res.status(500).json({ error: "SYSTEM FAILURE", details: error.message });
        }
    }
});

app.post('/api/gemini/insights', async (req, res) => {
    try {
        const { expenses, totalBudget, totalIncome } = req.body;
        const activeExpenses = expenses.filter((e: any) => !e.excludeFromStats);

        if (activeExpenses.length === 0) {
            return res.json({ insight: "SYSTEM ONLINE. AWAITING DATA STREAM." });
        }

        const summary = activeExpenses.slice(0, 20).map((e: any) => `${e.date}: ${e.description} ($${e.amount})`).join("\\n");

        const prompt = `
            IDENTITY: You are "Overseer_AI", a ruthless, efficient cyberpunk system administrator.

            DATA:
            Total Budget: ${totalBudget}
            Total Income: ${totalIncome}
            Recent Logs:
            ${summary}

            TASK: Judge the user's spending.

            TONE: Cold, robotic, judgmental, minimalist.
            - Good spending? "EFFICIENCY WITHIN ACCEPTABLE PARAMETERS."
            - Bad spending? "WASTEFUL RESOURCE ALLOCATION DETECTED. DISAPPOINTMENT IMMEASURABLE."
            - Dangerous levels? "HULL INTEGRITY CRITICAL. ABANDON SHIP OR CEASE SPENDING."

            CONSTRAINT: Under 15 words. No preamble.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.json({ insight: response.text || "CALCULATING EFFICIENCY..." });
    } catch (error) {
        console.error("Error getting insights:", error);
        res.status(500).json({ insight: "ERR: OVERSEER MODULE OFFLINE." });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
