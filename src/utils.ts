import { UmamiEvents } from "./types";

export const doNotTrack = () => {
  // @ts-ignore
  const { doNotTrack, navigator, external } = window;

  const msTrackProtection = "msTrackingProtectionEnabled";
  const msTracking = () => {
    return (
      // @ts-ignore
      external && msTrackProtection in external && external[msTrackProtection]()
    );
  };

  const dnt =
    doNotTrack ||
    navigator.doNotTrack ||
    // @ts-ignore
    navigator.msDoNotTrack ||
    msTracking();

  return dnt == "1" || dnt === "yes";
};

export function removeTrailingSlash(url: string) {
  return url && url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url;
}

export function post(
  url: string,
  data: UmamiEvents,
  headers: Record<string, string> = {}
): Promise<{ status: number; statusText: string; body?: string }> {
  if ("fetch" in window) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
      cache: "no-cache",
    }).then(async (res) => {
      if (res.ok)
        return {
          status: res.status,
          statusText: res.statusText,
          body: await res.text(),
        };
      throw {
        status: res.status,
        statusText: res.statusText,
      };
    });
  } else if ("XMLHttpRequest" in window) {
    return new Promise(function (resolve, reject) {
      const req = new XMLHttpRequest();
      req.open("POST", url, true);
      req.setRequestHeader("Content-Type", "application/json");

      for (const header in headers)
        if (headers[header]) req.setRequestHeader(header, headers[header]);

      req.onload = function () {
        if (req.status >= 200 && req.status < 300) {
          resolve({
            status: req.status,
            statusText: req.statusText,
            body: req.response as string,
          });
        } else {
          reject({
            status: req.status,
            statusText: req.statusText,
          });
        }
      };
      req.onerror = function () {
        reject({
          status: req.status,
          statusText: req.statusText,
        });
      };

      req.ontimeout = () => {
        reject({
          status: 408,
          statusText: "Timeout",
        });
      };

      req.send(JSON.stringify(data));
    });
  } else {
    return Promise.reject({ status: -1, statusText: "Unsopported env" });
  }
}
