import { type BigNumber } from "ethers"

export type Contest = {
  id: BigNumber | string;
  gameId: BigNumber | string;
  creator: string;
  boxCost: BigNumber;
  boxesCanBeClaimed: boolean;
  q1Paid: boolean;
  q2Paid: boolean;
  q3Paid: boolean;
  finalPaid: boolean;
  totalRewards: BigNumber | string;
  boxesClaimed: BigNumber | string;
  randomValuesSet: boolean;
}

export type ContestData = {
  id: string;
  gameId: string;
  creator: string;
  boxCost: string;
  boxesCanBeClaimed: boolean;
  q1Paid: boolean;
  q2Paid: boolean;
  q3Paid: boolean;
  finalPaid: boolean;
  totalRewards: string;
  boxesClaimed: string;
  randomValuesSet: boolean;
  boxes: {
    contestId: string;
    id: string;
    owner: string;
  }[];
  rows: number[];
  cols: number[];
}

export type ContestList = {
  contests: ContestData[];
  total: number;
}

export type Box = {
  contestId: BigNumber,
  id: BigNumber,
  owner: Address,
}

export type LastDigits = {
  q1: number;
  q2: number;
  q3: number;
  f: number;
}

export type TeamLastDigits = {
  home: LastDigits;
  away: LastDigits;
}

export type OracleGame = {
  awayFLastDigit: number;
  awayQ1LastDigit: number;
  awayQ2LastDigit: number;
  awayQ3LastDigit: number;
  homeFLastDigit: number;
  homeQ1LastDigit: number;
  homeQ2LastDigit: number;
  homeQ3LastDigit: number;
  id: BigNumber;
  qComplete: number;
  requestInProgress: boolean;
}