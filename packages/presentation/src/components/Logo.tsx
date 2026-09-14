import { useState } from "react";

/**
 * Das AWS-Logo.
 *
 * Maße und Ränder stammen aus der PowerPoint-Vorlage von AWS, umgerechnet von
 * EMU auf die Bühnengröße 1920 × 1080: auf der Titelfolie oben links 202 × 121
 * Pixel, auf allen weiteren unten links 58 × 35. Die Dokumentation nennt die
 * obere und die untere linke Ecke als die beiden zulässigen Ankerpunkte und
 * fordert mindestens 50 Pixel Breite — beide Größen liegen darüber.
 *
 * Das Logo sitzt auf der Bühne, nicht im Abschnitt. Abschnitte wandern beim
 * Weiterklicken nach oben aus dem Bild; das Logo bleibt stehen und wandert
 * beim Verlassen der Titelfolie einmal von oben links nach unten links.
 *
 * Die Datei liegt nicht im Repository. Fehlt sie, zeigt die Folie kein Logo
 * statt eines kaputten Bildes.
 */
export function Logo({ large = false, animated = true }: { large?: boolean; animated?: boolean }) {
  const [fehlt, setFehlt] = useState(false);
  if (fehlt) return null;

  /** Oben verankert, damit der Wechsel eine Bewegung ist und kein Sprung. */
  const platz = large
    ? { top: 50, left: 96, width: 202, height: 121 }
    : { top: 998, left: 96, width: 58, height: 35 };

  return (
    <img
      src="/brand/aws-logo.svg"
      alt="Amazon Web Services"
      onError={() => setFehlt(true)}
      className={`absolute z-10 ${
        animated ? "transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
      }`}
      style={platz}
    />
  );
}
