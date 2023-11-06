import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { type BigNumber } from "ethers";
import { z } from "zod";

import { boxABI } from "~/constants/abi/box";
import { BOX_CONTRACT } from "~/constants/addresses";
import { DEFAULT_CHAIN,SUPPORTED_CHAINS } from "~/constants/chain";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { type Box, type Contest,type ContestData, type ContestList } from "~/types/contest";

export const contestRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({
      id: z.number(),
      chainId: z.number(),
    }))
    .query(async ({ input }) => {
      const chain = SUPPORTED_CHAINS.find((chain) => chain.chainId === input.chainId) || DEFAULT_CHAIN;
      const sdk = new ThirdwebSDK(chain.chainId, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const contract = await sdk.getContract(BOX_CONTRACT[chain.slug] as string, boxABI);
      const [contest, boxes, rows, cols] = await Promise.all([
        contract.call("contests", [input.id]),
        contract.call("fetchAllBoxesByContest", [input.id]),
        contract.call("fetchContestRows", [input.id]),
        contract.call("fetchContestCols", [input.id]),
      ]) as [Contest, Box[], number[], number[]];

      console.log({ contest });
      return {
        ...contest,
        id: contest.id.toString(),
        gameId: contest.gameId.toString(),
        boxCost: contest.boxCost.toString(),
        totalRewards: contest.totalRewards.toString(),
        boxesClaimed: contest.boxesClaimed.toString(),
        boxes: boxes.map((box) => ({
          ...box,
          contestId: box.contestId.toString(),
          id: box.id.toString(),
        })),
        rows: rows.map((row) => Number(row.toString())),
        cols: cols.map((col) => Number(col.toString())),
      } as ContestData;
    }),
  list: publicProcedure
    .input(z.object({
      chainId: z.number(),
      take: z.number().optional(),
      skip: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const chain = SUPPORTED_CHAINS.find((chain) => chain.chainId === input.chainId) || DEFAULT_CHAIN;
      const sdk = new ThirdwebSDK(chain.chainId, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const contract = await sdk.getContract(BOX_CONTRACT[chain.slug] as string, boxABI);
      // the ending index cannot be greater than the total number of contests
      const totalContests = await contract.call("contestIdCounter") as BigNumber;
      const startingIndex = Math.max((input.skip ? totalContests.toNumber() - input.skip : totalContests.toNumber()), 0);
      const endingIndex = Math.max(startingIndex - (input.take ?? totalContests.toNumber()), 0);
      if (startingIndex > totalContests.toNumber()) throw new Error("Invalid starting index");
      if (!totalContests.toNumber()) return {
        contests: [],
        total: 0,
      } as ContestList;

      try {
        const contests = await Promise.all(
          // make an array from the starting index to the ending index
          Array.from({ length: startingIndex - endingIndex }).map((_, index) => {
            // get the contest id by subtracting the index from the starting index
            const contestId = startingIndex - (index + 1);
            // get the contest data
            return contract.call("contests", [contestId]);
          })
        ) as unknown as Contest[];
  
        return {
          contests: contests.map((contest) => ({
            ...contest,
            id: contest.id.toString(),
            gameId: contest.gameId.toString(),
            boxCost: contest.boxCost.toString(),
            totalRewards: contest.totalRewards.toString(),
            boxesClaimed: contest.boxesClaimed.toString(),
          })),
          total: totalContests.toNumber(),
        } as ContestList;
      } catch (e) {
        const error = e as Error;
        console.error({ error });
        throw new Error(error.message);
      }

    }),
});