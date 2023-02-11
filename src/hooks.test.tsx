import { renderHook, act } from "@testing-library/react-hooks";
import { useUmamiPageTrack } from "./hooks";
import { UmamiContextValue } from "./types";
import { ReactNode } from "react";
import UmamiProvider from "./provider";
import { UmamiContext } from "./context";

describe("useUmamiPageTrack", () => {
  const BASIC_CONTEXT: UmamiContextValue = {
    canTrack: () => true,
    getEventPayloadFields: () => ({
      hostname: "mysite.com",
      language: "en-US",
      screen: "1920x1080",
      url: "/",
      website: "websiteId1234",
    }),
    hostUrl: "localhost:2000/api",
    track: () => {},
    websiteId: "websiteId1234",
  };
  test("should track event on normal consent", async () => {
    // const wrapper = ({ children }: { children: ReactNode }) => (
    //   <UmamiProvider
    //     getCurrentUrl={() => {
    //       return "/";
    //     }}
    //     hostUrl=""
    //     websiteId="websiteId1234"
    //     domains={["my-site.com"]}
    //   >
    //     {children}
    //   </UmamiProvider>
    // );
    const trackMock = vi.fn((arg) => {
      return Promise.resolve("TRACKED");
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UmamiContext.Provider value={{ ...BASIC_CONTEXT, track: trackMock }}>
        {children}
      </UmamiContext.Provider>
    );
    const { result, waitForNextUpdate, waitFor } = renderHook(
      () => useUmamiPageTrack({ pageUrl: "/" }),
      {
        wrapper,
      }
    );
    await waitFor(() =>
      expect(trackMock.mock.lastCall![0]).toEqual({
        payload: {
          hostname: "mysite.com",
          language: "en-US",
          screen: "1920x1080",
          url: "/",
          website: "websiteId1234",
          referrer: "",
        },
        type: "pageview",
      })
    );
  });
});
