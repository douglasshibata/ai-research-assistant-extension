import { GoogleGenAI } from "@google/genai";

export async function getGeminiResponse(prompt: string, context: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const fullPrompt = `
You are a helpful Research Assistant. You are given a user query and the content of the webpage they are currently viewing. Use the page content to provide accurate and context-aware answers. If the user has selected specific text, prioritize analyzing that selection.

PAGE CONTEXT:
---
${context}
---

USER QUERY:
${prompt}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt
    });

    return response.text || "No response from AI.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
