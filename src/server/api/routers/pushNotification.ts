import webpush from "web-push";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

// setup webpush
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export const pushNotificationRouter = createTRPCRouter({
  // create a new user push notification subscription
  createPushSubscription: publicProcedure
    .input(z.object({
      userId: z.string(),
      endpoint: z.string(),
      keys: z.object({
        auth: z.string(),
        p256dh: z.string(),
      }),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.pushSubscription.create({
        data: {
          userId: input.userId,
          endpoint: input.endpoint,
          auth: input.keys.auth,
          p256dh: input.keys.p256dh,
        },
      });
    }),
  // get subscriptions for a specific user
  getPushSubscriptions: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(({ ctx, input }) => {
      return ctx.prisma.pushSubscription.findMany({
        where: {
          userId: input.userId,
        },
      });
    }),
  // send notification
  send: publicProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      title: z.string(),
      body: z.string(),
      url: z.string().optional(),
      type: z.enum([
        'notifyWhenOffered',
        'notifyWhenOfferAccepted',
        'notifyWhenSold',
        'notifyWhenOutbid',
        'general',
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      // get the profiles of the users passed in
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          userId: {
            in: input.userIds,
          },
        },
      });
      // user ids of users who have push notifications enabled for this type
      const userIdsWithPushNotis = input.type === "general" ? input.userIds : profiles
        .filter((profile) => profile[input.type as keyof typeof profile])
        .map((profile) => profile.userId);

      // get subscriptions based on userIds passed in
      const subscriptions = await ctx.prisma.pushSubscription.findMany({
        where: {
          userId: {
            in: userIdsWithPushNotis,
          },
        },
      });
      // send notification to subscriptions
      const sends = await Promise.allSettled(subscriptions.map(async (subscription) => {
        const formattedSub = {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        };

        await webpush.sendNotification(
          formattedSub, 
          JSON.stringify({
            title: input.title,
            body: input.body,
            icon: '/icons/icon-192x192.png',
            data: {
              url: input.url,
            }
          })
        );
      }));
      // failed sends get deleted from the db
      type FailedSend = {
        status: 'rejected',
        reason: {
          endpoint: string,
        }
      }
      const failedSends = sends.filter((send) => send.status === 'rejected') as FailedSend[];

      if (failedSends.length) {
        await ctx.prisma.pushSubscription.deleteMany({
          where: {
            endpoint: {
              in: failedSends.map((send) => send.reason.endpoint),
            },
          },
        });
      }
    }),
});