import { useCallback, useMemo } from "react";
import { cacheKey, localStorageMainTurnoffKey } from "./const";
import { UmamiContext } from "./context";
import { UmamiEvents } from "./types";
import { doNotTrack, post, removeTrailingSlash } from "./utils";

interface UmamiProviderProps {
  websiteId: string;
  getCurrentUrl: () => string;
  // url: string;
  domains?: string[];
  respectDoNotTrack?: boolean;
  hostUrl: string;
  useCache?: boolean;
  // autoTrack: boolean; // default true (Tracks Pageviews and Events (using auto binding function)) (Needs history for pageviews and dom binding/jsx helper binders on events (ex <div onClick={umamiTrack('click')})) /> where umamiTrack: (eventType: string) => (event) => void)
}

/*

https://umami.is/docs/api

*/

export default function UmamiProvider({
  websiteId,
  children,
  useCache = false,
  domains = [],
  getCurrentUrl,
  ...props
}: React.PropsWithChildren<UmamiProviderProps>) {
  const windowInfo = useMemo(() => {
    if (typeof window == "undefined") {
      return {
        screen: `SSR`,
        language: "",
        hostname: "",
        pathname: "",
        search: "",
      };
    }
    const {
      screen: { width, height },
      navigator: { language },
      location: { hostname, pathname, search },
    } = window;
    return {
      screen: `${width}x${height}`,
      language,
      hostname,
      pathname,
      search,
    };
  }, []);

  const mainCanTrack = useCallback(
    () =>
      (props.respectDoNotTrack ? !doNotTrack() : true) &&
      (domains.length == 0 ||
        (domains.length > 0 && domains.includes(windowInfo.hostname))) &&
      (!localStorage ||
        (localStorage && !localStorage.getItem(localStorageMainTurnoffKey))),
    [props.respectDoNotTrack, windowInfo.hostname, domains]
  );

  const getEventPayloadFields = () => {
    const { hostname, language, screen } = windowInfo;
    return {
      website: websiteId,
      hostname,
      language,
      screen,
      url: getCurrentUrl(),
    };
  };

  const hostUrl = useMemo(() => {
    return removeTrailingSlash(props.hostUrl);
  }, [props.hostUrl]);

  const track = useCallback(
    async (data: UmamiEvents, forceTrack: boolean = false) => {
      if (!mainCanTrack() && !forceTrack) return "NO_TRACK";

      let headers: Record<string, string> = {};
      if (useCache && sessionStorage.getItem(cacheKey))
        headers = { ["x-umami-cache"]: sessionStorage.getItem(cacheKey)! };

      return post(`${hostUrl}/api/collect`, data, headers).then((response) => {
        if (useCache && sessionStorage)
          sessionStorage.setItem(cacheKey, response);
        return response;
      });
    },
    [hostUrl, mainCanTrack, useCache]
  );

  return (
    <UmamiContext.Provider
      value={{
        websiteId,
        getEventPayloadFields,
        hostUrl,
        canTrack: mainCanTrack,
        track,
      }}
    >
      {children}
    </UmamiContext.Provider>
  );
}
