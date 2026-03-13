import { SmartParseResult } from "../types";

export const parseNaturalLanguageExpense = async (input: string, dateContext?: string): Promise<SmartParseResult[] | null> => {
  try {
    const response = await fetch('/api/gemini/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, dateContext }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "SYSTEM FAILURE");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error parsing input:", error);
    if (error?.message === "API_RATE_LIMIT_EXCEEDED" || error?.message === "NETWORK_DISCONNECTED") {
        throw error;
    }
    // Simulate network disconnect if fetch completely fails
    if (error instanceof TypeError && error.message.includes('fetch')) {
         throw new Error("NETWORK_DISCONNECTED");
    }
    throw error;
  }
};

export const parseReceiptImage = async (base64Image: string): Promise<SmartParseResult | null> => {
    try {
        const response = await fetch('/api/gemini/parse-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ base64Image }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "SYSTEM FAILURE");
        }

        return await response.json();
     } catch (error: any) {
        console.error("Optical Ingest Failed:", error);
        if (error?.message === "API_RATE_LIMIT_EXCEEDED" || error?.message === "NETWORK_DISCONNECTED") {
            throw error;
        }
        // Simulate network disconnect if fetch completely fails
        if (error instanceof TypeError && error.message.includes('fetch')) {
             throw new Error("NETWORK_DISCONNECTED");
        }
        throw error;
    }
}

export const getSpendingInsights = async (expenses: any[], totalBudget: number, totalIncome: number): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses, totalBudget, totalIncome }),
    });

    if (!response.ok) {
        throw new Error("Failed to get insights");
    }

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error("Error getting insights:", error);
    return "ERR: OVERSEER MODULE OFFLINE.";
  }
};
