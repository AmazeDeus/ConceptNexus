import { z } from 'zod';
import { authRouter } from './auth-router';
import { publicProcedure, router } from './trpc';
import { QueryValidator } from '../lib/validators/query-validator';
import { getPayloadClient } from '../get-payload';

// Typesafe API endpoints of the entire backend
export const appRouter = router({
  auth: authRouter,

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(), // The last element rendered. Will be used to fetch the next page of products
        query: QueryValidator,
      })
    )
    .query(async ({ input }) => {
      const { query, cursor } = input;

      // For extendability - spread queryOpts for parsing
      const { sort, limit, ...queryOpts } = query;

      // Get products from the db
      const payload = await getPayloadClient();

      // Initialize the query options
      const parsedQueryOpts: Record<string, { equals: string }> = {};

      // Parse the query options for the CMS
      Object.entries(queryOpts).forEach(([key, value]) => {
        parsedQueryOpts[key] = { equals: value };
      });

      const page = cursor || 1;

      const {
        docs: products,
        hasNextPage,
        nextPage,
      } = await payload.find({
        collection: 'products',
        where: {
          approvedForSale: {
            equals: 'approved',
          },
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      });

      return {
        items: products,
        nextPage: hasNextPage ? nextPage : null,
      };
    }),
});

// The type of the whole backend
export type AppRouter = typeof appRouter;
