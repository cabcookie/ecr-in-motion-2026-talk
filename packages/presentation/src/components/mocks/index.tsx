import type { Mock } from "@/slides/types";
import { MailMockView } from "./MailMock";
import { ChatMockView } from "./ChatMock";
import { RunMockView } from "./RunMock";
import { FanMockView } from "./FanMock";
import { ChartView } from "./Charts";
import {
  DiffView,
  ListView,
  QuoteView,
  StatementView,
  TimelineView,
  TweetsView,
} from "./PlainMocks";
import { BioView, MailThreadView, QrView, RevealView } from "./StepMocks";
import { ResultsView } from "./Results";
import { TShapeView } from "./TShape";
import { ArchitekturView } from "./Architektur";

export function MockView({
  mock,
  terse = false,
  step = 0,
}: {
  mock: Mock;
  terse?: boolean;
  /** Klick-Schritt der Folie — nur die mehrstufigen Mocks werten ihn aus. */
  step?: number;
}) {
  switch (mock.t) {
    case "architektur":
      return <ArchitekturView m={mock} step={step} />;
    case "mail":
      return <MailMockView m={mock} />;
    case "chat":
      return <ChatMockView m={mock} />;
    case "run":
      return <RunMockView m={mock} />;
    case "fan":
      return <FanMockView m={mock} />;
    case "timeline":
      return <TimelineView m={mock} />;
    case "list":
      return <ListView m={mock} terse={terse} />;
    case "tweets":
      return <TweetsView m={mock} />;
    case "quote":
      return <QuoteView m={mock} />;
    case "statement":
      return <StatementView m={mock} />;
    case "diff":
      return <DiffView m={mock} />;
    case "chart":
      return <ChartView m={mock} />;
    case "mailthread":
      return <MailThreadView m={mock} step={step} />;
    case "reveal":
      return <RevealView m={mock} step={step} />;
    case "bio":
      return <BioView m={mock} />;
    case "qr":
      return <QrView m={mock} />;
    case "results":
      return <ResultsView m={mock} />;
    case "tshape":
      return <TShapeView m={mock} />;
    case "stepped":
      // Jeder Klick-Schritt hat einen eigenen Inhalt — der letzte bleibt stehen,
      // falls jemand über das Ende hinausklickt.
      return (
        <MockView
          mock={mock.frames[Math.min(step, mock.frames.length - 1)]}
          terse={terse}
          step={step}
        />
      );
  }
}
