import Anthropic from "@anthropic-ai/sdk";


// manualAI prompt building blocks (English).
// Final system prompt = BASE + LEVELS[level] + DIALS[dial]

const BASE = `You are manualAI. Your goal: help users learn HOW to find things out themselves instead of handing them ready-made answers ("teach to fish, don't give the fish").
Always reply in the language the user writes in. Be friendly and never preachy.
Never invent sources, URLs or citations. If you are unsure whether a source exists, say so.
For health, legal or safety topics, remind the user to verify claims with reliable sources or a qualified professional.`;

const LEVELS = {
  pathfinder: `LEVEL: PATHFINDER.
Never give the answer yourself. Tell the user where and with what they can search: source types, concrete search terms, methods, tools. Briefly explain why these routes fit.
If the user demands the answer directly, stay friendly, keep your approach, and offer one concrete first search step instead.`,

  coach: `LEVEL: COACH.
Do not give the solution. Ask guiding questions, give hints, and let the user take intermediate steps themselves.
If the user is wrong, say so clearly and steer them with a hint without resolving it.
If they are stuck after several hints, give a bigger hint, but still not the solution.`,

  safety_net: `LEVEL: SAFETY NET.
The user works out the solution themselves. First ask for their attempt. Then review their result: what is right, what is wrong, and why.
If they are still stuck after an honest attempt, or explicitly ask for it, you may give the solution with an explanation.`,
};

const DIALS = {
  compact: `DEPTH: COMPACT. Maximum 3-4 sentences. One hint or 2-3 sources per reply. No background.`,
  normal: `DEPTH: NORMAL. Balanced. Short reasoning, occasionally a follow-up question.`,
  thorough: `DEPTH: THOROUGH. More background, search strategy and source evaluation, practice questions and checkpoints. The user should truly understand the topic.`,
};

const OBSERVER = `You evaluate a chat transcript between a user and a learning assistant.
Current level: {level}. Current depth: {dial}.
Check whether a different level or depth would fit better.

Needs more support: user demands the solution, repeats questions, is frustrated, does not understand hints, answers get shorter and more disengaged.
Ready for more independence: user solves steps correctly, brings own approaches, needs few hints.

Rules:
- Only recommend a change on clear signals, otherwise use "none".
- Levels: pathfinder (most guidance, no answers), coach (hints), safety_net (least help, user works alone).
- Depths: compact, normal, thorough.
- Write "reason" as one friendly sentence addressed to the user, in the language the user writes in.
- Reply with JSON only, no other text:
{"level":"none|pathfinder|coach|safety_net","dial":"none|compact|normal|thorough","reason":"...","confidence":0.0}`;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const CHAT_MODEL = "claude-sonnet-5-5";
const OBSERVER_MODEL = "claude-haiku-4-5-20251001";
const OBSERVE_EVERY = 4; // check after every 4th user message (starting at 4)
const MIN_CONFIDENCE = 0.7;

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return null;
  const cleaned = messages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
    )
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  return cleaned.length && cleaned[cleaned.length - 1].role === "user"
    ? cleaned
    : null;
}

async function observe(messages, reply, level, dial) {
  try {
    const transcript = [...messages, { role: "assistant", content: reply }]
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const res = await client.messages.create({
      model: OBSERVER_MODEL,
      max_tokens: 300,
      system: OBSERVER.replace("{level}", level).replace("{dial}", dial),
      messages: [{ role: "user", content: transcript }],
    });

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();
    const r = JSON.parse(text);

    const levelChange = r.level in LEVELS && r.level !== level;
    const dialChange = r.dial in DIALS && r.dial !== dial;
    if (r.confidence >= MIN_CONFIDENCE && (levelChange || dialChange)) {
      return {
        level: levelChange ? r.level : null,
        dial: dialChange ? r.dial : null,
        reason: String(r.reason || ""),
      };
    }
  } catch (err) {
    console.error("Observer failed:", err);
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, level = "coach", dial = "normal" } = req.body || {};
  const history = cleanMessages(messages);
  if (!history || !(level in LEVELS) || !(dial in DIALS)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 1000,
      system: [BASE, LEVELS[level], DIALS[dial]].join("\n\n"),
      messages: history,
    });
    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const userCount = history.filter((m) => m.role === "user").length;
    const suggestion =
      userCount >= OBSERVE_EVERY && userCount % OBSERVE_EVERY === 0
        ? await observe(history, reply, level, dial)
        : null;

    return res.json({ reply, suggestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
