import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// define a zod schema for enums
const reportStatus = z.enum(["APPROVED", "PENDING", "REJECTED"]);
const reportType = z.enum(["COLLECTION", "PROFILE", "NFT"]);

export const reportRouter = createTRPCRouter({
  // get by status
  getByStatus: publicProcedure
    .input(z.object({ 
      // status must be a report status
      status: reportStatus,
      take: z.number().optional(),
      skip: z.number().optional(),
    }))
    .query(({ input, ctx }) => {
      return ctx.prisma.report.findMany({
        where: {
          status: input.status,
        },
        // include the profile, or collection
        include: {
          profile: true,
          collection: true,
        },
        // optionally take and skip
        ...(input.take && { take: input.take }),
        ...(input.skip && { skip: input.skip }),
      });
    }),

  // get by contentId
  getByContentId: publicProcedure
    .input(z.object({
      contentId: z.string(),
      status: reportStatus.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    }))
    .query(({ input, ctx }) => {
      return ctx.prisma.report.findMany({
        where: {
          contentId: input.contentId,
          // optionally filter on status
          ...(input.status && {
            status: input.status,
          }),
        },
        // include the profile, or collection
        include: {
          profile: true,
          collection: true,
        },
        // optionally take and skip
        ...(input.take && { take: input.take }),
        ...(input.skip && { skip: input.skip }),
      });
    }),

  // allow admins to update report status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: reportStatus,
    }))
    .mutation(({ input, ctx }) => {
      // only admins can update report status
      if (!ctx.session.user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      return ctx.prisma.report.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),

  // allow anyone who is signed in to create a report
  create: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      reason: z.string(),
      type: reportType,
    }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.report.create({
        data: {
          contentId: input.contentId,
          reason: input.reason,
          status: "PENDING",
          type: input.type,
          createdBy: {
            connect: {
              id: ctx.session.user?.id,
            },
          },
          // if the type is collection, connect the collection
          ...(input.type === "COLLECTION" && {
            collection: {
              connect: {
                id: input.contentId,
              }
          }}),
          // if the type is profile, connect the profile
          ...(input.type === "PROFILE" && {
            profile: {
              connect: {
                id: input.contentId,
              }
          }}),
        },
      });
    }),
});
