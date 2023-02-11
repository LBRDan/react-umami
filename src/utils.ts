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
	headers?: Record<string, string>
) {
	return new Promise<string>(function (resolve, reject) {
		const req = new XMLHttpRequest();
		req.open("POST", url, true);
		req.setRequestHeader("Content-Type", "application/json");
		if (headers) {
			for (const header in headers)
				if (headers[header]) req.setRequestHeader(header, headers[header]);
		}

		req.onload = function () {
			if (req.status >= 200 && req.status < 300) {
				resolve(req.response as string);
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

		req.send(JSON.stringify(data));
	});
}
