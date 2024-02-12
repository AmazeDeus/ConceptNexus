import express from 'express';
import { getPayloadClient } from './get-payload';
import { nextApp, nextHandler } from './next-utils';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { inferAsyncReturnType } from '@trpc/server';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
})

// Infer the context for use in the tRPC initialization - trpc.ts
export type ExpressContext = inferAsyncReturnType<typeof createContext>

const start = async () => {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  // Forward any request to this endpoint to trpc in next.js endpoints
  app.use(
    '/api/trpc',
    // Middleware to attach specific things from express (eg. req, res) on the context, for use in next.js
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started")

    app.listen(PORT, async () => {
      payload.logger.info(`Next.js App Url: ${process.env.NEXT_PUBLIC_SERVER_URL}`)
    });
  });
};

start();
