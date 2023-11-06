import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    // get all users and sort by created date
    getAll: protectedProcedure.query(({ ctx }) => {
      return ctx.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
    getByAddress: protectedProcedure
      .input(z.object({ address: z.string() }))
      .query(({ ctx, input }) => {
        return ctx.prisma.user.findMany({
          where: {
            address: {
              contains: input.address.toLowerCase(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          }
        });
      }),
    // get all admins
    getAdmins: publicProcedure.query(({ ctx }) => {
      return ctx.prisma.user.findMany({
        where: {
          isAdmin: true,
        },
        orderBy: {
          createdAt: 'desc',
        }
      });
    }),
    // get users who are collaborators of a collection
    getCollectionCollaborators: publicProcedure
      .input(z.object({ collectionId: z.string() }))
      .query(({ ctx, input }) => {
        return ctx.prisma.collectionCollaborator.findMany({
          where: {
            collectionId: input.collectionId,
          },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          }
        });
      }),
    // allow users who are admins to update other users
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        isAdmin: z.boolean(),
      }))
      .mutation(({ ctx, input }) => {
        return ctx.prisma.user.update({
          where: {
            id: input.id,
          },
          data: {
            isAdmin: input.isAdmin,
          }
        });
      }),
  });