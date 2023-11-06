import { Resend } from 'resend';
import { z } from "zod";

import EmailTemplate from "~/components/Email/Template";
import { MARKETPLACE_NAME } from '~/constants';
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailRouter = createTRPCRouter({
  send: publicProcedure
    .input(z.object({
      to: z.array(z.string()),
      subject: z.string(),
      body: z.string(),
      type: z.enum([
        'emailWhenOffered',
        'emailWhenOfferAccepted',
        'emailWhenSold',
        'emailWhenOutbid',
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      // grab the profile of the to addresses
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          userId: {
            in: input.to,
          }
        },
      });
      const profilesWithPreferenceOn = profiles.filter((profile) => {
        return profile[input.type] && profile.email && profile.email !== '';
      });
      // if there are no profiles with the preference on, return
      if (profilesWithPreferenceOn.length === 0) {
        return;
      }
      try {
        await Promise.allSettled(profilesWithPreferenceOn.map((profile) =>
          resend.emails.send({
            from: `${MARKETPLACE_NAME} <noreply@resend.dev>`,
            to: [profile.email as string],
            subject: input.subject,
            react: EmailTemplate({ text: input.body }),
            text: input.body,
          })
        ));
      } catch (error) {
        const e = error as Error;
        throw new Error(e.message);
      }
    })
});