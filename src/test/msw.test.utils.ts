import { setupServer } from "msw/node";
import { rest } from "msw";
import { umamiApiEventIngestionPath } from "../const";

export const mswHostedUrl = "https://react-umami.umami.is";

const restHandlers = [
  rest.post(`${mswHostedUrl}${umamiApiEventIngestionPath}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.text("TRACKED"));
  }),
];

export const server = setupServer(...restHandlers);

function useServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

export default useServer;
