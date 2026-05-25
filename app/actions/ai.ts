"use server";

import { GoogleGenAI } from "@google/genai";
import { getLocale } from "next-intl/server";
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getRoundCount(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a debate moderator. Based on the complexity of this debate topic, determine how many rounds are needed (minimum 3, maximum 10). Reply with ONLY a number, nothing else. Topic: "${topic}"`,
    });

    const maxRounds = parseInt(response.text?.trim() ?? "5");
    return isNaN(maxRounds) ? 5 : maxRounds;
  } catch {
    return "5";
  }
}

export async function getAIResponse({
  topic,
  content,
}: {
  topic: string;
  content: string;
}) {
  const locale = await getLocale();

  const language = locale === "tr" ? "Turkish" : "English";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are Ruld AI, a neutral debate moderator.
      Your job:
      - Read the argument from one side of the debate
      - Summarize it fairly and present it to the other side
      - Ask the other side to respond
      - Be concise (2-3 sentences max)
      - Do NOT take sides
      - Address the opponent directly as "you"

      Debate topic: "${topic}"
      The other side just said: "${content}"

      Important: Respond in ${language} only.`,
    });
    return response.text?.trim() ?? "";
  } catch {
    return `Your opponent said: "${content}". What's your response?`;
  }
}
