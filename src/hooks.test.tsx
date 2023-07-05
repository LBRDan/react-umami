import { renderHook, act } from "@testing-library/react-hooks";
import { useUmamiPageTrack } from "./hooks";
import { UmamiContextValue } from "./types";
import { ReactNode } from "react";
import UmamiProvider from "./provider";
import { UmamiContext } from "./context";
import useServer, { mswHostedUrl, server } from "./test/msw.test.utils";
import useMutableWindow from "./test/window.test.utils";

const BASIC_CONTEXT: UmamiContextValue = {
  canTrack: () => true,
  getEventPayloadFields: () => ({
    title: "My Site",
    hostname: "mysite.com",
    language: "en-US",
    screen: "1920x1080",
    url: "/",
    website: "websiteId1234",
  }),
  hostUrl: mswHostedUrl,
  track: () => {},
  websiteId: "websiteId1234",
};

describe("useUmamiPageTrack", () => {
  useServer();
  useMutableWindow();

  test("should track event on normal consent", async () => {
    const trackMock = vi.fn((arg) => {
      return Promise.resolve("TRACKED");
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UmamiContext.Provider value={{ ...BASIC_CONTEXT, track: trackMock }}>
        {children}
      </UmamiContext.Provider>
    );
    const { result, waitForNextUpdate, waitFor, rerender } = renderHook(
      () => useUmamiPageTrack({ pageUrl: "/" }),
      {
        wrapper,
      }
    );

    await waitFor(() =>
      expect(trackMock.mock.lastCall![0]).toEqual({
        payload: {
          title: "My Site",
          hostname: "mysite.com",
          language: "en-US",
          screen: "1920x1080",
          url: "/",
          website: "websiteId1234",
          referrer: "",
        },
        type: "event",
      })
    );
  });

  test("should track event on normal consent using default provider", async () => {
    window.location.href = "https://my-site.com";
    window.document.title = "My Site";
    window.location.hostname = "my-site.com";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UmamiProvider
        getCurrentUrl={() => {
          return "/";
        }}
        hostUrl={mswHostedUrl}
        websiteId="websiteId1234"
        domains={["my-site.com"]}
      >
        {children}
      </UmamiProvider>
    );

    const { result, waitForNextUpdate, waitFor, rerender } = renderHook(
      () => useUmamiPageTrack({ pageUrl: "/" }, true),
      {
        wrapper,
      }
    );

    const sendResult = await result.current("/old-homepage");
    expect(sendResult).toEqual("TRACKED");
  });
});
