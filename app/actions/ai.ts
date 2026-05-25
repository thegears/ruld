"use server";

import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getRoundCount(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a debate moderator. Based on the complexity of this debate topic, determine how many rounds are needed (minimum 3, maximum 10). Reply with ONLY a number, nothing else. Topic: "${topic}"`,
  });

  const maxRounds = parseInt(response.text?.trim() ?? "5");
  return isNaN(maxRounds) ? 5 : maxRounds;
}
