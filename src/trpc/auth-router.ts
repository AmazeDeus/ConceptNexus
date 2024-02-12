import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator';
import { publicProcedure, router } from './trpc';
import { getPayloadClient } from '../get-payload';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

// publicProcedure is open to everyone
export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      // input is available from the input method chain
      const { email, password } = input;
      const payload = await getPayloadClient(); // CMS

      // Check if user already exists
      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      });

      if (users.length !== 0)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });

      // Create user
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user',
        },
      });

      return { success: true, sentToEmail: email };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;

      // requires the CMS client that makes it possible to verify the email
      const payload = await getPayloadClient();

      // Define the collection we are trying to verify a person on
      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token,
      });

      if (!isVerified) throw new TRPCError({ code: 'UNAUTHORIZED' });

      return { success: true };
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { res } = ctx;

      const payload = await getPayloadClient();

      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password,
          },
          res, // Required in order to attach the auth token cookie in the respone
        });

        return { success: true };
      } catch (err) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
    }),
});
