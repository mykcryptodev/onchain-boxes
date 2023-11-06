import { type Collection, type Profile, type Report } from "@prisma/client";

export type ReportWithContent = Report & {
  collection: Collection | null;
  profile: Profile | null;
};

export type ReportStatus = "APPROVED" | "PENDING" | "REJECTED";

export type ReportType = "COLLECTION" | "PROFILE" | "NFT";