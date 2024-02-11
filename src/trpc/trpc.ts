import { initTRPC } from '@trpc/server';

const t = initTRPC.context().create();

export const router = t.router;

// Endpoints open to the everyone
export const publicProcedure = t.procedure;
