import { useUmamiPageTrack } from "./hooks";

const PageTracker = ({ pageUrl }: { pageUrl: string }) => {
  useUmamiPageTrack({ pageUrl });
  return null;
};

export { PageTracker };
