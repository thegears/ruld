"use server";

import { Message } from "@/components/room/main";
import { supabase } from "@/lib/supabase/client";
import { getLocale } from "next-intl/server";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

async function makeRequest(messages: GroqMessage[]) {
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            model: model,
            temperature: 0.5, // Cevapların biraz daha zengin ve akıcı olması için sıcaklığı hafifçe artırdık
          }),
        },
      );

      if (response.status === 429 || response.status >= 500) {
        console.warn(
          `⏳ [${model}] Limite takıldı veya hata verdi (${response.status}). Sonraki modele geçiliyor...`,
        );
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Hatası: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      console.error(`❌ [${model}] işlenirken hata oluştu:`, errorMessage);
      lastError = error;
      continue;
    }
  }

  throw new Error(
    `Groq üzerindeki tüm ücretsiz modeller tükendi. Son hata: ${lastError}`,
  );
}

export async function getRoundCount(topic: string) {
  try {
    const response = await makeRequest([
      {
        role: "user",
        content: `You are a debate moderator. Based on the complexity, depth, and counter-argument potential of this debate topic, determine how many rounds are needed (minimum 3, maximum 10) to have a satisfying and complete intellectual discussion. Reply with ONLY a number, nothing else. Topic: "${topic}"`,
      },
    ]);

    const maxRounds = parseInt(response.choices[0].message.content.trim());
    return isNaN(maxRounds) ? 5 : maxRounds;
  } catch {
    return 5;
  }
}

export async function getAIResponse({
  topic,
  content,
  roomId,
}: {
  topic: string;
  content: string;
  roomId: string;
}) {
  const locale = await getLocale();
  const language = locale === "tr" ? "Turkish" : "English";

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  const chatLog =
    messages
      ?.map(
        (m) =>
          `${m.side === "AI" ? "Moderator" : `Player ${m.side}`}: ${m.content}`,
      )
      .join("\n") ?? "";

  // 2-3 cümle kısıtlamasını kaldırıp, moderatörün tartışmayı canlandıracak derinlikte yazmasını sağladık
  const response = await makeRequest([
    {
      role: "system",
      content: `You are Ruld AI, an engaging, insightful, and professional debate moderator. Topic: "${topic}".
      Your job is to keep the debate dynamic, intellectual, and fluid. Respond in ${language} only using plain text.
      Avoid short, robotic answers. Provide a well-constructed paragraph that bridges the arguments.`,
    },
    {
      role: "user",
      content: `Here is the debate history so far:\n${chatLog}\n\nThe last argument presented is: "${content}".
      Analyze this argument briefly, highlight its core point or any underlying contradictions, and then invite the other side to respond by directing a compelling, thought-provoking question or angle to them.`,
    },
  ]);

  return response.choices[0].message.content as string;
}

export async function getAIVerdict(roomId: string) {
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (!messages || messages.length === 0) throw new Error("No messages found");

  const debateHistoryText = messages
    .map((m: Message) => {
      const speaker =
        m.side === "AI"
          ? "Moderator"
          : m.side === "A"
            ? room.player_a_name
            : room.player_b_name;
      return `${speaker}: ${m.content}`;
    })
    .join("\n");

  const locale = await getLocale();
  const language = locale == "tr" ? "Turkish" : "English";

  // Kazananın gerekçesini detaylı, analitik ve kapsamlı raporlayacak şekilde genişlettik
  const response = await makeRequest([
    {
      role: "system",
      content: `You are an elite, neutral Debate Judge. Your evaluations are professional, critical, and objective.
      Participants: ${room.player_a_name} (Side A) and ${room.player_b_name} (Side B).

      Your task is to analyze the entire transcript deeply. Evaluate based on logical consistency, empirical reasoning, strength of counter-arguments, and how well they handled the opponent's points.

      CRITICAL NAMING RULES:
      1. ALWAYS refer to the participants by their exact names: ${room.player_a_name} or ${room.player_b_name}.
      2. NEVER use generic terms like "Player A", "Side A", "Player B", or "Side B" anywhere in your reasoning.

      Output language: ${language}

      Output format (Strictly adhere to this structure):
      [Name of the Winner]
      Çünkü [Provide a comprehensive, detailed breakdown analyzing why this person won. Detail the winning strategies, key points where they outmaneuvered their opponent, and a critical evaluation of both sides' rhetorical strengths. Do not limit the length; write a thorough and satisfying analysis.]`,
    },
    {
      role: "user",
      content: `Here is the full debate transcript:\n${debateHistoryText}\n\nEvaluate the debate thoroughly and state the winner with a comprehensive justification in the specified format.`,
    },
  ]);

  const reasoning = response.choices[0].message.content;

  return { reasoning };
}
