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
 * Es sind zwei Logos, nicht eines, das umzieht. Das große blendet aus, das
 * kleine an seinem eigenen Platz ein. Ein wanderndes Logo zieht den Blick auf
 * sich, obwohl gerade der Abschnitt wechselt — und genau dorthin soll niemand
 * schauen.
 *
 * Beide liegen auf der Bühne, nicht im Abschnitt: Abschnitte wandern beim
 * Weiterklicken aus dem Bild, das Logo bleibt stehen.
 *
 * Die Datei liegt nicht im Repository. Fehlt sie, zeigt die Folie kein Logo
 * statt eines kaputten Bildes.
 */
export function Logo({ large = false, animated = true }: { large?: boolean; animated?: boolean }) {
  const [fehlt, setFehlt] = useState(false);
  if (fehlt) return null;

  const gemeinsam = `absolute z-10 ${animated ? "transition-opacity duration-[420ms] ease-linear" : ""}`;

  return (
    <>
      <img
        src="/brand/aws-logo.svg"
        alt="Amazon Web Services"
        onError={() => setFehlt(true)}
        aria-hidden={!large}
        className={gemeinsam}
        style={{ top: 50, left: 96, width: 202, height: 121, opacity: large ? 1 : 0 }}
      />
      <img
        src="/brand/aws-logo.svg"
        alt=""
        aria-hidden={large}
        className={gemeinsam}
        style={{ top: 998, left: 96, width: 58, height: 35, opacity: large ? 0 : 1 }}
      />
    </>
  );
}
