import { contestRouter } from "~/server/api/routers/contest";
import { emailRouter } from "~/server/api/routers/email";
import { gameRouter } from "~/server/api/routers/game";
import { profileRouter } from "~/server/api/routers/profile";
import { pushNotificationRouter } from "~/server/api/routers/pushNotification";
import { reportRouter } from "~/server/api/routers/report";
import { scoreOracleRouter } from "~/server/api/routers/scoreOracle";
import { userRouter } from "~/server/api/routers/user";
import { createTRPCRouter } from "~/server/api/trpc";

import { advertisementRouter } from "./routers/advertisement";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  advertisement: advertisementRouter,
  contest: contestRouter,
  user: userRouter,
  profile: profileRouter,
  game: gameRouter,
  report: reportRouter,
  scoreOracle: scoreOracleRouter,
  pushNotification: pushNotificationRouter,
  email: emailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
