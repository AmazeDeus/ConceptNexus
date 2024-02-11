import { authRouter } from './auth-router';
import { publicProcedure, router } from './trpc';

// Typesafe API endpoints of the entire backend
export const appRouter = router({
  auth: authRouter
});

// The type of the whole backend
export type AppRouter = typeof appRouter;
