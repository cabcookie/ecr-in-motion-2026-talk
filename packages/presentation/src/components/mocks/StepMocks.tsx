import { Fragment, useEffect, useState } from "react";
import QRCode from "qrcode";
import type {
  BioMock,
  MailThreadMock,
  QrMock,
  ResultsMock,
  RevealMock,
} from "@/slides/types";
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
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[20px]">
        {m.stations.map((s, i) => (
          <span key={s} className="flex items-center gap-[18px]">
            {i > 0 && <span className="text-[32px] text-fg-3">·</span>}
            <span className="text-[40px] leading-[1.2] text-fg">{s}</span>
          </span>
        ))}
      </div>
      <p className="m-0 mt-[48px] text-[36px] leading-[1.35] text-[color:var(--accent)]">{m.line}</p>
    </div>
  );
}

/** QR-Code auf die Zuschauersicht. Die Adresse ergibt sich aus dem Aufruf. */
export function QrView({ m }: { m: QrMock }) {
  const [svg, setSvg] = useState("");
  const url = `${location.origin}/?audience`;

  useEffect(() => {
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0b0e13", light: "#ffffff" },
    })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);

  return (
    <div className="flex w-full items-center gap-[64px]">
      <div
        className="size-[380px] shrink-0 rounded-lg bg-win p-[24px] [&_svg]:size-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
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

/**
 * Platzhalter für die Live-Auswertung. Die echten Antworten kommen aus der
 * Zuschauersicht — bis die Auswertung steht, zeigt die Folie ihren Rahmen,
 * damit im Storyboard sichtbar ist, wo sie hingehört.
 */
export function ResultsView({ m }: { m: ResultsMock }) {
  if (m.as === "matrix" && m.axes) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-[3px]">
          <div />
          <div className="pb-[14px] text-center font-mono text-[22px] tracking-[0.1em] text-fg-3 uppercase">
            Ja
          </div>
          <div className="pb-[14px] text-center font-mono text-[22px] tracking-[0.1em] text-fg-3 uppercase">
            Nein
          </div>
          {["Freut mich", "Freut mich nicht"].map((row) => (
            <Fragment key={row}>
              <div
                className="flex items-center pr-[20px] text-right font-mono text-[22px] tracking-[0.08em] text-fg-3 uppercase"
              >
                {row}
              </div>
              {[0, 1].map((c) => (
                <div
                  key={`${row}-${c}`}
                  className="grid h-[150px] place-items-center rounded-md border border-dashed border-hair bg-stage-2 font-mono text-[44px] tabular-nums text-fg-3"
                >
                  –
                </div>
              ))}
            </Fragment>
          ))}
        </div>
        <p className="m-0 mt-[26px] text-center font-mono text-[22px] text-fg-3">
          {m.axes.x} × {m.axes.y} · Antworten erscheinen live
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-3 gap-[16px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid h-[110px] place-items-center rounded-md border border-dashed border-hair bg-stage-2 font-mono text-[24px] text-fg-3"
        >
          Antwort {i + 1}
        </div>
      ))}
    </div>
  );
}
