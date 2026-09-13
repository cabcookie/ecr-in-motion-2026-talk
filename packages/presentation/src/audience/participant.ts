const KEY = "ecr-participant-id";

/**
 * Kennung des Geräts. Die Teilnehmer melden sich nicht an — diese Kennung ist
 * der einzige Weg, jemandem beim Zurückkommen seine Antworten wiederzugeben.
 * Bleibt im localStorage, überlebt also das Sperren des Handys.
 */
export function participantId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = `p-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Privater Modus oder blockierter Speicher: dann eben nur für diese Sitzung
    return `p-fluechtig-${Math.random().toString(36).slice(2, 10)}`;
  }
}
