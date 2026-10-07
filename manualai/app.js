const form = document.querySelector("#composition-form");
const input = document.querySelector("#idea");
const button = document.querySelector("#compose");
const errorBox = document.querySelector("#error");
const result = document.querySelector("#result");
const resultBody = document.querySelector("#result-body");
const buttonText = button.querySelector("span");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const idea = input.value.trim();
  if (idea.length < 3) return;

  errorBox.classList.remove("visible");
  result.classList.remove("visible");
  resultBody.textContent = "";
  button.disabled = true;
  buttonText.textContent = "Kloper hört zu …";

  const statusTimer = window.setTimeout(() => {
    buttonText.textContent = "Orpheus komponiert …";
  }, 3500);

  try {
    const response = await fetch("/api/manualai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) throw new Error("Das tägliche Kompositionskontingent ist erreicht. Bitte versuche es morgen erneut.");
      throw new Error(data.error || "Die Komposition ist fehlgeschlagen. Bitte versuche es erneut.");
    }
    resultBody.textContent = data.work;
    result.classList.add("visible");
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    errorBox.textContent = err.message || "Verbindung fehlgeschlagen. Bitte prüfe deine Verbindung und versuche es erneut.";
    errorBox.classList.add("visible");
  } finally {
    window.clearTimeout(statusTimer);
    button.disabled = false;
    buttonText.textContent = "Werk entstehen lassen";
  }
});
