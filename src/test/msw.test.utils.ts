import { setupServer } from "msw/node";
import { http } from "msw";
import { umamiApiEventIngestionPath } from "../const";

export const mswHostedUrl = "https://react-umami.umami.is";

const httpHandlers = [
  http.post(`${mswHostedUrl}${umamiApiEventIngestionPath}`, () => {
    return new Response("TRACKED", { status: 200 });
  }),
];

export const server = setupServer(...httpHandlers);

function useServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

export default useServer;
