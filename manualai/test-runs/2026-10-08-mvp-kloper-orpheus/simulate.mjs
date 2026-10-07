import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Offline simulation: replace all network access before importing the real API handler.
process.env.ANTHROPIC_API_KEY = "offline-simulation-only";
for (const key of ["KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) {
  delete process.env[key];
}

const prompts = [
  "Eine verlassene Bahnhofsuhr beginnt jeden Morgen eine Minute früher zu gehen. Schreibe noch keine fertige Geschichte; finde heraus, welches menschliche Motiv darin steckt.",
  "Ein Garten wächst durch die Risse eines verlassenen Parkhauses. Entwickle daraus eine überraschende Spannung zwischen Fürsorge und Kontrolle.",
  "Eine Bibliothek sammelt Bücher, die noch niemand geschrieben hat. Was könnte in ihrem ersten Band stehen?",
];

const fixtures = [
  {
    kloper: "Zentrales Motiv: Zeit als Erinnerung, die sich nicht mehr an den gemeinsamen Takt hält. Spannung: Die Uhr misst nicht den Bahnhof, sondern die Sehnsucht einer Person nach jemandem, der nicht zurückkehrt. Richtungen für Orpheus: eine wartende Reinigungskraft entdeckt die Abweichung; oder jede verlorene Minute wird zu einem kleinen, unerzählten Abschied.",
    orpheus: "Jeden Morgen ging die Bahnhofsuhr eine Minute vor. Mara bemerkte es zuerst, weil sie immer zu früh kam. Sie stellte die Uhr zurück, doch am nächsten Tag war sie wieder voraus.\n\nNach einer Woche hörte sie auf, sie zu korrigieren. In dieser einen Minute begann der Bahnsteig zu atmen: ein Koffer wurde abgestellt, ein Abschied noch einmal ausgesprochen, ein Zug blieb einen Augenblick länger im Licht.\n\nMara verstand, dass die Uhr nicht die Zeit verlor. Sie hielt etwas fest, das längst abgefahren war.",
  },
  {
    kloper: "Zentrales Motiv: Leben findet einen Weg durch die Infrastruktur, die es ordnen sollte. Spannung: Pflege lässt wachsen, Kontrolle will Wachstum in Grenzen halten. Richtungen für Orpheus: eine Hausmeisterin beginnt heimlich Beete anzulegen; oder der Garten bildet die vergessene Karte einer Stadt unter dem Beton.",
    orpheus: "Zuerst war es nur ein Blatt, das durch den Riss neben Stellplatz 18 drückte. Dann kam Regen. Dann kamen Kinder mit Samen in ihren Jackentaschen.\n\nDer Hausmeister zog Kreidelinien um jedes neue Beet. Er wollte wissen, wo der Garten endete. Die Pflanzen hielten sich nicht an seine Karte. Sie wuchsen unter den Pfeilen hindurch und legten sich an die Wände, als lauschten sie dort einer verborgenen Quelle.\n\nEines Morgens ließ er die Kreide liegen. Zum ersten Mal sah der Beton nicht aus wie eine Grenze, sondern wie ein Dach, das jemand für das Leben gebaut hatte.",
  },
  {
    kloper: "Zentrales Motiv: Ungeschriebene Möglichkeiten werden gesammelt, bevor sie Wirklichkeit werden. Spannung: Wem gehört eine Geschichte, die noch niemand erzählt hat? Richtungen für Orpheus: ein leeres Buch beginnt, Leserinnen und Leser zu beschreiben; oder die Bibliothekarin findet darin die Geschichte, die sie selbst nie zu schreiben wagte.",
    orpheus: "Der erste Band war leer, bis auf den Titel: „Für später“.\n\nDie Bibliothekarin stellte ihn ins oberste Regal. Jeden Abend war eine neue Seite darin. Keine Worte, nur feine Druckstellen, als hätte jemand auf einem Blatt darüber geschrieben. Sie legte Papier daneben und rieb mit dem Bleistift darüber.\n\nSo erschienen die Umrisse einer Tür, ein halber Satz und schließlich eine Frage: „Was würdest du erzählen, wenn du nicht wüsstest, wer es liest?“\n\nAm Morgen nahm sie den Bleistift mit nach Hause.",
  },
];

const trace = [];
let calls = 0;
let runIndex = -1;
let expectedStage = "Kloper";

globalThis.fetch = async (_input, init = {}) => {
  calls += 1;
  const payload = JSON.parse(init.body);
  const system = String(payload.system || "");
  const stage = system.includes("Du bist Kloper") ? "Kloper" : system.includes("Du bist Orpheus") ? "Orpheus" : "unbekannt";
  if (stage !== expectedStage) throw new Error(`Falsche Reihenfolge: erwartet ${expectedStage}, erhalten ${stage}`);

  if (stage === "Kloper") {
    runIndex += 1;
    if (runIndex >= fixtures.length) throw new Error("Unerwarteter zusätzlicher Kloper-Aufruf");
    expectedStage = "Orpheus";
  } else {
    const promptText = String(payload.messages?.[0]?.content || "");
    if (!promptText.includes(fixtures[runIndex].kloper)) throw new Error("Orpheus erhielt Klopers Partitur nicht");
    if (!promptText.includes(prompts[runIndex])) throw new Error("Orpheus erhielt die Originalidee nicht");
    expectedStage = "Kloper";
  }

  trace.push({
    number: calls,
    stage,
    model: payload.model,
    maxTokens: payload.max_tokens,
    inputHasOriginal: JSON.stringify(payload.messages).includes(prompts[Math.max(runIndex, 0)]),
  });
  const text = stage === "Kloper" ? fixtures[runIndex].kloper : fixtures[runIndex].orpheus;
  return new Response(JSON.stringify({
    id: `offline_sim_${calls}`,
    type: "message",
    role: "assistant",
    model: payload.model,
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 80, output_tokens: 120 },
  }), { status: 200, headers: { "content-type": "application/json" } });
};

const { default: handler } = await import("../../../api/manualai.js");
function responseStub() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

const records = [];
for (const [index, idea] of prompts.entries()) {
  const response = responseStub();
  await handler({ method: "POST", body: { idea }, headers: { "x-forwarded-for": `127.0.0.${index + 1}` } }, response);
  if (response.statusCode !== 200 || !response.body?.work || response.body.roles.join(" → ") !== "Kloper → Orpheus") {
    throw new Error(`Simulation ${index + 1} fehlgeschlagen: HTTP ${response.statusCode}`);
  }
  records.push({ idea, kloper: fixtures[index].kloper, orpheus: response.body.work });
}
if (calls !== prompts.length * 2 || expectedStage !== "Kloper") {
  throw new Error(`Unerwartetes Ende: ${calls} Provideraufrufe, nächste Stimme ${expectedStage}`);
}

const date = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const report = [
  "# Simulationsprotokoll – ManualAI Studio MVP",
  "",
  `**Datum:** ${date}`,
  "**Modus:** Offline-Mock; keine echte Anthropic- oder andere Provideranfrage.",
  "**Umfang:** 3 Testideen, jeweils Kloper → Orpheus; insgesamt 6 abgefangene Modellaufrufe.",
  "**Modell:** Die API-Konfiguration wurde aus dem Anwendungscode gelesen; Providerantworten waren festgelegte Test-Fixtures. Die Ausgaben unten sind keine echten Modellantworten.",
  "",
  "## Technische Beobachtungen",
  "",
  "- Alle drei simulierten Requests endeten mit HTTP 200.",
  "- Die Reihenfolge Kloper vor Orpheus wurde für jeden Lauf geprüft.",
  "- Für jeden Orpheus-Aufruf wurden sowohl die Originalidee als auch Klopers Partitur im Request nachgewiesen.",
  "- Die API lieferte die erwartete Rollenfolge `Kloper → Orpheus`.",
  "- Aufrufreihenfolge: `" + trace.map((entry) => entry.stage).join(" → ") + "`.",
  "- Netzwerkzugriff und Redis-Limiter wurden in diesem Prozess ersetzt/deaktiviert; es wurden keine Provider-, Redis-, Konto-, Wallet- oder Zahlungsdienste angesprochen.",
  "- Diese Simulation prüft Ablauf und Übergabe, nicht Live-Verfügbarkeit, kreative Qualität, tatsächliche Laufzeit, Tokenverbrauch, Kosten oder Deployment-Secrets.",
  "",
  "## Simulierte Durchläufe",
  "",
  ...records.flatMap((record, index) => [
    `### Lauf ${index + 1}`,
    "",
    `**Ausgangsidee:** ${record.idea}`,
    "",
    "**Kloper – Partitur (Fixture):**",
    "",
    record.kloper,
    "",
    "**Orpheus – Werk (Fixture):**",
    "",
    record.orpheus,
    "",
  ]),
  "## Ergebnis und nächster Schritt",
  "",
  "**Offline-Ablauf: bestanden.** Für einen echten MVP-Live-Test muss eine berechtigte Person zunächst die serverseitige Anthropic-Konfiguration der Zielumgebung prüfen. Anschließend sind dieselben drei Ideen einmal mit dem echten Provider auszuführen und die tatsächliche Laufzeit, Provider-Metadaten, Fehler und Qualität getrennt zu protokollieren. Die optionalen Musiker sind in diesem MVP-Lauf nicht beteiligt.",
  "",
].join("\n");

const here = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(here, "SIMULATION.md");
await fs.writeFile(outputPath, report, "utf8");
console.log(JSON.stringify({ outputPath, runs: records.length, interceptedProviderCalls: calls, roles: "Kloper → Orpheus", externalRequests: 0 }, null, 2));
