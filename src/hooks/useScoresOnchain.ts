import { useContract, useContractRead } from "@thirdweb-dev/react";
import { type BigNumber } from "ethers";
import { useContext, useState } from "react";

import { GAMESCORE_ORACLE_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";

type ScoresOnChain = {
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

const useScoresOnchain = (gameId: string) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const [readFunction, setReadFunction] = useState<string>("gameScores");

  const { contract } = useContract(GAMESCORE_ORACLE_CONTRACT[activeChainData.slug] as string, "custom");

  const { data, isLoading, error } : {
    data: ScoresOnChain | undefined,
    isLoading: boolean,
    error: unknown
  } = useContractRead(
    contract, 
    readFunction,
    [gameId]
  );

  console.log({ data, isLoading, error })
  const refetch = () => {
    // a hack to force useContractRead to refetch
    setReadFunction("");
    setReadFunction("gameScores");
  }

  return {
    data, isLoading, error, refetch
  }
}

export default useScoresOnchain;