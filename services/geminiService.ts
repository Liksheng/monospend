
import { GoogleGenAI, Type } from "@google/genai";
import { SmartParseResult, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageExpense = async (input: string, dateContext?: string): Promise<SmartParseResult[] | null> => {
  try {
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
      "Taxi $45" -> [{type: expense, amount: 45, description: Taxi...}]
      "Save for CyberDeck 1200" -> [{type: wishlist, amount: 1200, description: CyberDeck}]
      "KFC 200, Taxi 50" -> [{type: expense, amount: 200, description: KFC}, {type: expense, amount: 50, description: Taxi}]
      "Lunch 15 and Wishlist Bike 500" -> [{type: expense, amount: 15}, {type: wishlist, amount: 500}]

      EXTRACT: amount, description for EACH item. 
      IF EXPENSE: extract category, date.
      IF WISHLIST: set type='wishlist'.
      
      RULES:
      - "Wishlist" keyword implies type='wishlist'.
      - Default currency is user's local currency (assume dollar amount).
      - CATEGORIES: Food, Transport, Utilities, Shopping, Entertainment, Health, Tech, Other.
      
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

    if (!response.text) return null;

    const result = JSON.parse(response.text) as SmartParseResult[];
    return result;
  } catch (error) {
    console.error("Error parsing input with Gemini:", error);
    return null;
  }
};

export const parseReceiptImage = async (base64Image: string): Promise<SmartParseResult | null> => {
    try {
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

        if (!response.text) return null;
        return JSON.parse(response.text) as SmartParseResult;

    } catch (error) {
        console.error("Optical Ingest Failed", error);
        return null;
    }
}

export const getSpendingInsights = async (expenses: any[], totalBudget: number, totalIncome: number): Promise<string> => {
  try {
    const activeExpenses = expenses.filter(e => !e.excludeFromStats);

    if (activeExpenses.length === 0) return "SYSTEM ONLINE. AWAITING DATA STREAM.";

    const summary = activeExpenses.slice(0, 20).map(e => `${e.date}: ${e.description} ($${e.amount})`).join("\n");

    // The "Overseer" Personality
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

    return response.text || "CALCULATING EFFICIENCY...";
  } catch (error) {
    console.error("Error getting insights:", error);
    return "ERR: OVERSEER MODULE OFFLINE.";
  }
};
