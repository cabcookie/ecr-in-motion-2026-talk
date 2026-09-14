import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { BioMock, MailThreadMock, QrMock, RevealMock } from "@/slides/types";
import { MailMockView } from "./MailMock";

/** Eingehende Mail links, Antwort rechts — die Antwort erst beim zweiten Klick. */
export function MailThreadView({ m, step }: { m: MailThreadMock; step: number }) {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-[40px]">
      <MailMockView m={m.incoming} />
      <div
        className={`transition-opacity duration-500 ${step >= 1 ? "opacity-100" : "opacity-0"}`}
        aria-hidden={step < 1}
      >
        <MailMockView m={m.reply} />
      </div>
    </div>
  );
}

/** Baut sich mit jedem Klick auf: Schritt n zeigt die Elemente 0 bis n. */
export function RevealView({ m, step }: { m: RevealMock; step: number }) {
  return (
    <div className="grid w-full gap-[44px] text-center">
      {m.items.map((item, i) => (
        <div
          key={i}
          className={`transition-opacity duration-500 ${i <= step ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i > step}
        >
          <p
            className={`m-0 font-display text-[76px] leading-[1.1] font-extrabold tracking-[-0.022em] text-balance ${
              item.accent ? "text-[color:var(--accent)]" : "text-fg"
            }`}
          >
            {item.text}
          </p>
          {item.sub && (
            <p className="m-0 mt-[22px] font-sans text-[34px] font-normal text-fg-3">{item.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Lebenslauf-Stationen als Kette. */
export function BioView({ m }: { m: BioMock }) {
  return (
    <div className="flex w-full items-center gap-[72px]">
      <img
        src={m.photo}
        alt={m.name}
        className="h-[480px] w-[360px] shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0">
        <p className="m-0 font-display text-[76px] leading-[1.1] font-extrabold tracking-[-0.02em] text-fg">
          {m.name}
        </p>
        <p className="m-0 mt-[20px] text-[42px] leading-[1.3] text-[color:var(--accent)]">
          {m.role}
        </p>
      </div>
    </div>
  );
}

/**
 * Der QR-Code auf die Zuschauersicht, als eigene Kachel.
 *
 * Er steht nicht nur auf der Einladungsfolie: Solange die Umfrage läuft, soll
 * er sichtbar bleiben, damit auch mitmachen kann, wer später hereinkommt.
 */
export function QrTile({ size = 380 }: { size?: number }) {
  const [svg, setSvg] = useState("");
  const url = `${location.origin}/`;

  useEffect(() => {
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f141a", light: "#ffffff" },
    })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);

  return (
    <div
      className="shrink-0 rounded-lg bg-win p-[24px] [&_svg]:size-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** QR-Code auf die Zuschauersicht. Die Adresse ergibt sich aus dem Aufruf. */
export function QrView({ m }: { m: QrMock }) {
  const url = `${location.origin}/`;
  return (
    <div className="flex w-full items-center gap-[64px]">
      <QrTile />
      <div className="min-w-0">
        <p className="m-0 font-display text-[52px] leading-[1.15] font-bold text-balance text-fg">
          {m.caption}
        </p>
        <p className="m-0 mt-[24px] text-[34px] leading-[1.35] text-fg-2">{m.hint}</p>
        <p className="m-0 mt-[28px] font-mono text-[26px] text-[color:var(--accent)]">{url}</p>
      </div>
    </div>
  );
}
