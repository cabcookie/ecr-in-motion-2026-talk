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

export function MockView({ mock, terse = false }: { mock: Mock; terse?: boolean }) {
  switch (mock.t) {
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
  }
}
