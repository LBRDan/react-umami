import { post } from "./utils";

export type EventsPayloadCommonFields<T = {}> = {
  website: string;
  hostname: string;
  language: string;
  screen: string;
  url: string;
} & T;

export interface UmamiContextValue {
  websiteId: string;
  getEventPayloadFields: () => EventsPayloadCommonFields | null;
  hostUrl: string;
  canTrack: () => boolean;
  track:
    | ((data: UmamiEvents, forceTrack?: boolean) => ReturnType<typeof post>)
    | (() => void);
}

export interface UmamiPageViewEvent {
  payload: EventsPayloadCommonFields<{
    referrer?: string;
    url: string;
  }>;
  type: "pageview";
}

export type UmamiTrackedEvent = {
  payload: EventsPayloadCommonFields<{
    event_name: string;
    event_value: string;
  }>;
  type: "event";
};

export type UmamiEvents = UmamiPageViewEvent | UmamiTrackedEvent;
