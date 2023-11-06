import { AdvertisementType as PrismaAdvertisementType } from "@prisma/client";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { ethers } from "ethers";
import { z } from "zod";

import { BANNER_ADVERTISEMENT, HERO_ADVERTISEMENT } from "~/constants/addresses";
import { ADVERTISEMENT_CHAIN } from "~/constants/chain";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { type Advertisement } from "~/types/advertisement";

// Convert the Typescript enum to a string array
const advertisementTypeArray = Object.values(PrismaAdvertisementType as unknown as Record<string, unknown>) as string[];

// Create a Zod schema for the enum
const AdvertisementType = z.enum(advertisementTypeArray as [string, ...string[]]);

export const advertisementRouter = createTRPCRouter({
  // get all advertisements and sort by end date. allow the user to skip and take
  getAll: publicProcedure
    .input(z.object({ skip: z.number(), take: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.advertisement.findMany({
        orderBy: {
          endDate: 'desc',
        },
        skip: input.skip,
        take: input.take,
      });
    }),
  // get one ad by its id
  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.advertisement.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  // get an advertisement of a certain type where right now is between the start and end date
  getActive: publicProcedure
    .input(z.object({ type: AdvertisementType }))
    .query(({ ctx, input }) => {
      return ctx.prisma.advertisement.findFirst({
        where: {
          type: PrismaAdvertisementType[input.type as keyof typeof PrismaAdvertisementType],
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
      });
    }),
  getStandardPrice: publicProcedure
    .input(z.object({
      adType: AdvertisementType,
    }))
    .query(async ({ input }) => {
      // create an instance of the ThirdwebSdk
      const sdk = new ThirdwebSDK(ADVERTISEMENT_CHAIN, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const adTypeContracts = input.adType === "BANNER" ? BANNER_ADVERTISEMENT : HERO_ADVERTISEMENT;
      const adContractAddress = adTypeContracts[ADVERTISEMENT_CHAIN.slug as keyof typeof adTypeContracts] || "";
      try {
        const contract = await sdk.getContract(adContractAddress);
        const data = await contract.call(
          "price",
          [],
        ) as bigint;
        return data.toString();
      } catch (e) {
        console.error({e});
        throw new Error(e as string);
      }
    }),
  getByDayId: publicProcedure
    .input(z.object({
      dayId: z.number(),
      adType: AdvertisementType,
    }))
    .query(async ({ input }) => {
      // create an instance of the ThirdwebSdk
      const sdk = new ThirdwebSDK(ADVERTISEMENT_CHAIN, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const storage = new ThirdwebStorage({
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const adTypeContracts = input.adType === "BANNER" ? BANNER_ADVERTISEMENT : HERO_ADVERTISEMENT;
      const adContractAddress = adTypeContracts[ADVERTISEMENT_CHAIN.slug as keyof typeof adTypeContracts] || "";
      try {
        const contract = await sdk.getContract(adContractAddress);
        type ContractResponse = [bigint, bigint, string, string];
        const data = await contract.call(
          "getAdSpace",
          [input.dayId],
        ) as ContractResponse;

        if (data[2] === ethers.constants.AddressZero) {
          return null;
        }

        type ContentUriReponse = {
          link: string,
          media: string,
        }
        const json: ContentUriReponse = await storage.downloadJSON(data[3]);
        const advertisement: Advertisement = {
          id: Number(data[0].toString()),
          price: data[1].toString(),
          owner: data[2],
          contentURI: data[3],
          link: json.link,
          media: json.media,
        };
        return advertisement;
        
      } catch (e) {
        console.error({e});
        throw new Error(e as string);
      }
    }),
  // get by range
  getByDayIds: publicProcedure
    .input(z.object({
      dayIds: z.array(z.number()),
      adType: AdvertisementType,
    }))
    .query(async ({ input }) => {
      // create an instance of the ThirdwebSdk
      const sdk = new ThirdwebSDK(ADVERTISEMENT_CHAIN, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const storage = new ThirdwebStorage({
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const adTypeContracts = input.adType === "BANNER" ? BANNER_ADVERTISEMENT : HERO_ADVERTISEMENT;
      const adContractAddress = adTypeContracts[ADVERTISEMENT_CHAIN.slug as keyof typeof adTypeContracts] || "";
      try {
        const contract = await sdk.getContract(adContractAddress);
        type ContractResponse = [bigint, bigint, string, string];
        const data = await contract.call(
          "getAdSpaces",
          [input.dayIds],
        ) as ContractResponse[];
        const ownedAds = data.filter(d => d[2] !== ethers.constants.AddressZero);
        const ownedAdsWithData = ownedAds.map(async (ad) => {
          type ContentUriReponse = {
            link: string,
            media: string,
          }
          const json: ContentUriReponse = await storage.downloadJSON(ad[3]);
          const advertisement: Advertisement = {
            id: Number(ad[0].toString()),
            price: ad[1].toString(),
            owner: ad[2],
            contentURI: ad[3],
            link: json.link,
            media: json.media,
          };
          return advertisement;
        });
        return Promise.all(ownedAdsWithData);
      } catch (e) {
        console.error({e});
        throw new Error(e as string);
      }
    }),
  // get royalty
  getRoyalty: publicProcedure
    .input(z.object({
      adType: AdvertisementType,
    }))
    .query(async ({ input }) => {
      // create an instance of the ThirdwebSdk
      const sdk = new ThirdwebSDK(ADVERTISEMENT_CHAIN, {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });
      const adTypeContracts = input.adType === "BANNER" ? BANNER_ADVERTISEMENT : HERO_ADVERTISEMENT;
      const adContractAddress = adTypeContracts[ADVERTISEMENT_CHAIN.slug as keyof typeof adTypeContracts] || "";
      try {
        const contract = await sdk.getContract(adContractAddress);
        const data = await contract.call(
          "royaltyBps",
          [],
        ) as bigint;
        return Number(data.toString()) / 100;
      } catch (e) {
        console.error({e});
        throw new Error(e as string);
      }
    }),
  // get one onchain ad record
  getOnchainAd: publicProcedure
    .input(z.object({
      dayId: z.number(),
      address: z.string(),
      chainId: z.number(),
      contentURI: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const ad = await ctx.prisma.onchainAdvertisement.findUnique({
        where: {
          address_chainId_contentURI_dayId: {
            dayId: input.dayId,
            address: input.address,
            contentURI: input.contentURI,
            chainId: input.chainId,
          },
        },
      });
      return ad;
    }),
  // get many onchain records
  getOnchainAds: publicProcedure
    .input(
      z.object({
        ads: z.array(z.object({
          dayId: z.number(),
          address: z.string(),
          chainId: z.number(),
          contentURI: z.string(),
        }))
      })
    )
    .query(async ({ input, ctx }) => {
      const ads = await ctx.prisma.onchainAdvertisement.findMany({
        where: {
          OR: input.ads.map(i => ({
            dayId: i.dayId,
            address: i.address,
            chainId: i.chainId,
            contentURI: i.contentURI,
          })),
        },
      });
      return ads;
    }),

  // censor an onchain ad
  toggleCensorship: adminProcedure
    .input(z.object({
      dayId: z.number(),
      address: z.string(),
      chainId: z.number(),
      contentURI: z.string(),
      isCensored: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.onchainAdvertisement.upsert({
        where: {
          address_chainId_contentURI_dayId: {
            dayId: input.dayId,
            address: input.address,
            contentURI: input.contentURI,
            chainId: input.chainId,
          },
        },
        update: {
          isCensored: input.isCensored,
        },
        create: {
          dayId: input.dayId,
          address: input.address,
          chainId: input.chainId,
          contentURI: input.contentURI,
          isCensored: input.isCensored,
        },
      })
    }),
  // create a new advertisement
  create: adminProcedure
    .input(z.object({
      name: z.string(),
      image: z.string(),
      link: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      type: AdvertisementType,
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.advertisement.create({
        data: {
          name: input.name,
          image: input.image,
          link: input.link,
          startDate: input.startDate,
          endDate: input.endDate,
          type: PrismaAdvertisementType[input.type as keyof typeof PrismaAdvertisementType],
        },
      });
    }),
  // update an advertisement
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
      link: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      type: AdvertisementType,
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.advertisement.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          image: input.image,
          link: input.link,
          startDate: input.startDate,
          endDate: input.endDate,
          type: PrismaAdvertisementType[input.type as keyof typeof PrismaAdvertisementType],
        },
      });
    }),
  // increment clicks for an ad
  incrementClicks: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.advertisement.update({
        where: {
          id: input.id,
        },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }),
  // increment views for an ad
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.advertisement.update({
        where: {
          id: input.id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }),
});