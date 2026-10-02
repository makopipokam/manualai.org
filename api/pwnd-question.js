import Anthropic from "@anthropic-ai/sdk";
import { allowed, textOf, parseJson } from "./_lib.js";
import { createHash } from "node:crypto";
import staticQuestions from "../pwnd/pwnd-ai-questions.json" with { type: "json" };

const client = new Anthropic();
const MODEL = "claude-haiku-4-5-20251001";
const SKILLS = ["recall", "pattern", "causal", "logic", "source", "risk"];
const TOPICS = {
  nature: { name: "Natur & Erde", skills: ["recall", "causal"] },
  patterns: { name: "Muster & Zahlen", skills: ["pattern", "logic"] },
  sources: { name: "Quellen & Medien", skills: ["source", "causal"] },
  decisions: { name: "Risiko & Entscheidungen", skills: ["risk", "logic"] },
  world: { name: "Weltwissen", skills: ["recall", "source"] },
  reasoning: { name: "Klar denken", skills: ["logic", "causal"] },
};
const TYPES = ["recall", "pattern", "causal", "logic", "source", "risk"];
const VISITOR_LIMIT = Number(process.env.PWND_QUESTION_DAILY_LIMIT) || 40;
const GLOBAL_LIMIT = Number(process.env.PWND_QUESTION_GLOBAL_LIMIT) || 1000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function cleanExclusions(value, maxLength) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).slice(0, maxLength).map((item) => item.trim().slice(0, 240))
    : [];
}

function normalizedPrompt(prompt) {
  return String(prompt || "").trim().toLocaleLowerCase("de");
}

function validQuestion(value, topic) {
  if (!value || typeof value !== "object") return false;
  if (typeof value.prompt !== "string" || value.prompt.trim().length < 18 || value.prompt.length > 260) return false;
  if (!SKILLS.includes(value.skill) || !topic.skills.includes(value.skill)) return false;
  if (!TYPES.includes(value.type) || value.type !== value.skill) return false;
  if (!Array.isArray(value.options) || value.options.length !== 4) return false;
  if (value.options.some((option) => typeof option !== "string" || option.trim().length < 1 || option.length > 180)) return false;
  if (new Set(value.options.map((option) => option.trim().toLocaleLowerCase("de"))).size !== 4) return false;
  if (!Number.isInteger(value.answer) || value.answer < 0 || value.answer > 3) return false;
  if (typeof value.explanation !== "string" || value.explanation.trim().length < 12 || value.explanation.length > 500) return false;
  return true;
}

function questionId(prompt) {
  return "ai-" + createHash("sha256").update(normalizedPrompt(prompt)).digest("hex").slice(0, 16);
}

function chooseStaticQuestion({ topicId, weakestSkill, targetDifficulty, excludedIds, excludedPrompts }) {
  const excludedPromptSet = new Set(excludedPrompts.map(normalizedPrompt));
  const unused = staticQuestions.filter((question) =>
    question.topicId === topicId &&
    !excludedIds.includes(question.id) &&
    !excludedPromptSet.has(normalizedPrompt(question.prompt))
  );
  const skillPool = unused.filter((question) => question.skill === weakestSkill);
  const candidates = skillPool.length ? skillPool : unused;
  return [...candidates].sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty))[0] || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const topic = TOPICS[body.topicId];
  const skills = body.skills && typeof body.skills === "object" ? body.skills : {};
  const weakestSkill = typeof body.weakestSkill === "string" ? body.weakestSkill : "";
  if (!topic || !topic.skills.includes(weakestSkill)) return res.status(400).json({ error: "Invalid topic or skill" });

  const excludedIds = cleanExclusions(body.excludeIds, 16);
  const excludedPrompts = cleanExclusions(body.excludePrompts, 16);
  const targetDifficulty = clamp(Number(body.targetDifficulty), .2, .95);
  const gate = await allowed(req, "pwnd-question", VISITOR_LIMIT, GLOBAL_LIMIT);
  if (!gate.ok) return res.status(429).json({ error: "limit", scope: gate.scope });

  const staticFallback = chooseStaticQuestion({ topicId: body.topicId, weakestSkill, targetDifficulty, excludedIds, excludedPrompts });
  const skillSnapshot = topic.skills.map((skill) => `${skill}: ${clamp(Number(skills[skill]), 0, 1).toFixed(2)}`).join(", ");
  const excluded = excludedPrompts.length ? `Bereits verwendete Fragen, die du weder wiederholen noch eng paraphrasieren darfst:\n${excludedPrompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")}` : "Es gibt noch keine verwendeten Fragen.";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: `Du bist die Schatten-Eule eines deutschen Lernquiz. Erzeuge genau eine neue, faire Wissensfrage mit vier Antwortmöglichkeiten.
Thema: ${topic.name}. Zielkompetenz: ${weakestSkill}. Kompetenzwerte des Spielers im Thema: ${skillSnapshot}. Zielschwierigkeit: ${targetDifficulty.toFixed(2)} auf einer Skala von 0 bis 1.
Passe die Schwierigkeit an: niedrige Kompetenzwerte bekommen klare, lösbare Fragen; hohe Werte bekommen mehrschrittige oder nuanciertere Fragen. Bleibe bei überprüfbaren Fakten oder sauberer Logik. Keine politischen Überzeugungsfragen, keine medizinischen Diagnosen, keine aktuellen Detailbehauptungen und keine mehrdeutigen Antworten.
Die vier Optionen müssen kurz, eindeutig und plausibel sein; genau eine Option ist richtig. Schreibe auf Deutsch. Antworte ausschließlich als JSON ohne Markdown:
{"type":"${weakestSkill}","skill":"${weakestSkill}","difficulty":0.0,"prompt":"...","options":["...","...","...","..."],"answer":0,"explanation":"Kurze Begründung."}
${excluded}`,
      messages: [{ role: "user", content: "Erzeuge jetzt die nächste neue Frage." }],
    });
    const question = parseJson(textOf(response));
    if (!validQuestion(question, topic)) throw new Error("Invalid generated question");
    const id = questionId(question.prompt);
    if (excludedIds.includes(id) || excludedPrompts.some((prompt) => normalizedPrompt(prompt) === normalizedPrompt(question.prompt))) throw new Error("Repeated generated question");
    return res.json({ question: { ...question, id, source: "ai", difficulty: clamp(Number(question.difficulty), .2, .95), time: 12000 } });
  } catch (error) {
    console.error("pwnd question generation failed, serving static AI fallback:", error);
    if (staticFallback) return res.json({ question: staticFallback, fallback: true });
    return res.status(503).json({ error: "Question generation unavailable" });
  }
}
