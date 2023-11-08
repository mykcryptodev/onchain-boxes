import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { type EventsResponse } from "~/types/espn";
import { type Game } from "~/types/game";

const ESPN_BASE_URL = `https://site.api.espn.com/apis/site/v2/sports/football/nfl`;

type GameSummaryResponse = {
  header: {
    week: number
  };
};
type EspnApiResponse = {
  events: Game[];
};

export const gameRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      console.log(`${ESPN_BASE_URL}/summary?event=${input.id}`)
      // fetch the game summary
      const gameSummaryResponse = await fetch(`${ESPN_BASE_URL}/summary?event=${input.id}`, {
        next: { revalidate: 60 } // revalidate every minute
      });
      if (!gameSummaryResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const gameSummary = await gameSummaryResponse.json() as GameSummaryResponse;
      console.log({ gameSummary })
      const { week } = gameSummary.header;
      // fetch the game box score
      const boxScoreResponse = await fetch(`${ESPN_BASE_URL}/scoreboard?week=${week}`, {
        next: { revalidate: 60 } // revalidate every minute
      });
      const boxScoreData = await boxScoreResponse.json() as EspnApiResponse;
      const { events } = boxScoreData;
      const game = events.find((event) => event.id === input.id.toString());
      return game;
    }),
  getMany: publicProcedure
    .input(z.object({
      ids: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      const games = await Promise.all(input.ids.map(async (id) => {
        const gameSummaryResponse = await fetch(`${ESPN_BASE_URL}/summary?event=${id}`, {
          next: { revalidate: 60 } // revalidate every minute
        });
        if (!gameSummaryResponse.ok) {
          throw new Error('Network response was not ok');
        }
        const gameSummary = await gameSummaryResponse.json() as GameSummaryResponse;
        const { week } = gameSummary.header;
        const boxScoreResponse = await fetch(`${ESPN_BASE_URL}/scoreboard?week=${week}`, {
          next: { revalidate: 60 } // revalidate every minute
        });
        const boxScoreData = await boxScoreResponse.json() as EspnApiResponse;
        const { events } = boxScoreData;
        const game = events.find((event) => event.id === id.toString());
        return game;
      }));
      return games;
    }),
  getByWeek: publicProcedure
    .input(z.object({
      week: z.number(),
    }))
    .query(async ({ input }) => {
      const response = await fetch(`${ESPN_BASE_URL}/scoreboard?week=${input.week}`, {
        next: { revalidate: 60 } // revalidate every minute
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      type EspnApiResponse = {
        events: EventsResponse;
      };
      const data = await response.json() as EspnApiResponse;
      console.log({ data });
      return data;
    }),
  getCurrentWeek: publicProcedure
    .query(async () => {
      const response = await fetch(`${ESPN_BASE_URL}/scoreboard`, {
        next: { revalidate: 60 * 60 * 24 } // revalidate every day
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      type EspnApiResponse = {
        week: {
          number: number;
        };
      };
      const data = await response.json() as EspnApiResponse;
      return data;
    }),
});