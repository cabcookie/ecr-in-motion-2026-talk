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
 * Die Datei liegt nicht im Repository. Fehlt sie, zeigt die Folie kein Logo
 * statt eines kaputten Bildes.
 */
export function Logo({ large = false }: { large?: boolean }) {
  const [fehlt, setFehlt] = useState(false);
  if (fehlt) return null;

  return (
    <img
      src="/brand/aws-logo.svg"
      alt="Amazon Web Services"
      onError={() => setFehlt(true)}
      className={
        large
          ? "absolute top-[50px] left-[96px] h-[121px] w-[202px]"
          : "absolute bottom-[47px] left-[96px] h-[35px] w-[58px]"
      }
    />
  );
}
