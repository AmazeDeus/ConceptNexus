import { z } from 'zod';
import { privateProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { getPayloadClient } from '../get-payload';
import { stripe } from '../lib/stripe';
import type Stripe from 'stripe';

export const paymentRouter = router({
  createSession: privateProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
        });
      }

      const payload = await getPayloadClient();

      // Get all products that are passed into this API route
      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
      });

      // Make sure the products have a valid priceId
      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));

      // Create the order for the db
      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      filteredProducts.forEach((product) => {
        line_items.push({
          price: product.priceId!,
          quantity: 1,
        });
      });

      line_items.push({
        price: 'price_1OmeDgEQVQ0m9hQZjTAPee5F',
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card', 'paypal'],
          mode: 'payment',
          metadata: {
            userId: user.id,
            orderId: order.id,
          }, // To be available in the webhook
          line_items,
        });

        // Return the URL to the frontend (cart page)
        return {
          url: stripeSession.url,
        };
      } catch (err) {
        console.log(err);

        return {
          url: null,
        };
      }
    }),
});
