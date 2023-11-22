import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { type BigNumber } from "ethers";
// import { type TransactionResult, Web3Button } from "@thirdweb-dev/react";
import { type FC, useContext, useMemo } from "react";

import { GAMESCORE_ORACLE_CONTRACT } from "~/constants/addresses";
// import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import { type OracleGame } from "~/types/contest";
import { type Game } from "~/types/game";
import { api } from "~/utils/api";

type Props = {
  game: Game;
  btnClass?: string;
  btnLabel?: string;
  tooltipDirection?: string;
  onFetched: () => void;
}
export const FetchGameData: FC<Props> = ({ game, btnClass, btnLabel, onFetched, tooltipDirection }) => {
  const { popNotification } = useContext(NotificationContext);
  const { activeChainData } = useContext(ActiveChainContext);
  const { 
    mutateAsync, 
    isLoading: fetchIsLoading 
  } = api.scoreOracle.fetchScores.useMutation();
  const { contract: gameScoreOracleContract } = useContract(
    GAMESCORE_ORACLE_CONTRACT[activeChainData.slug] as string, "custom"
  );
  const { data: timeUntilCanFetch } : {
    data: BigNumber | undefined;
  } = useContractRead(
    gameScoreOracleContract, 
    "timeUntilCooldownExpires",
    [game.id]
  );
  const { data: oracleGame } : {
    data: OracleGame | undefined;
  } = useContractRead(
    gameScoreOracleContract, 
    "gameScores",
    [game.id]
  );
  const isInFuture = !game.competitions[0]?.date ? false : new Date(game.competitions[0]?.date) > new Date();
  const isLoading = useMemo(() => {
    return fetchIsLoading || (oracleGame?.requestInProgress || false);
  }, [fetchIsLoading, oracleGame]);
  const timeUntilCanFetchNumber = timeUntilCanFetch?.toNumber() || 0;
  const minutes = Math.floor(timeUntilCanFetchNumber / 60);
  const seconds = timeUntilCanFetchNumber % 60;
  const formattedTimeUntilCanFetch = `${minutes}m${seconds}s`;

  const toolTipText = useMemo(() => {
    if (isLoading) return `Scores are currently being refreshed. This can take several minutes.`;
    if (timeUntilCanFetchNumber > 0) return `You can refresh the scores onchain in ${formattedTimeUntilCanFetch}`;
    return `Refresh the scores onchain`;
  }, [formattedTimeUntilCanFetch, timeUntilCanFetchNumber, isLoading]);

  const fetchGameData = async () => {
    if (timeUntilCanFetchNumber > 0 || isLoading) return;
    try {
      await mutateAsync({
        gameId: game.id,
        chainId: activeChainData.chainId,
      });
      popNotification({
        title: "Refreshing Game Scores!",
        description: "The game scores are refreshing... check back soon!",
        type: "success",
      });
      void onFetched();
    } catch (e) {
      popNotification({
        title: "Error Refreshing Game Scores!",
        description: "The game scores could not be refreshed. Try again in 10 minutes.",
        type: "error",
      });
    }
  }
  if (isInFuture) return null;
  return (
    <div 
      className={`tooltip ${tooltipDirection ?? 'sm:tooltip-top tooltip-right'}`} 
      data-tip={toolTipText}
    >
      <button 
        className={`${btnClass ?? 'btn btn-ghost btn-circle btn-xs'}`}
        onClick={() => void fetchGameData()}
      >
        <ArrowPathIcon className={`w-4 h-4 stroke-2 ${isLoading ? 'animate-spin' : ''}`} />
        {btnLabel ?? ''}
      </button>
    </div>

  )

  // return (
  //   <Web3Button
  //     className="thirdweb-btn-circle-ghost-xs"
  //     contractAddress={BOX_CONTRACT[activeChainData.slug] as string}
  //     action={async (contract) => {
  //       try {
  //         const tx = await contract.call(
  //           "fetchGameData", 
  //           [game.id]
  //         ) as TransactionResult;
  //         console.log({ tx });
  //         popNotification({
  //           title: "Refreshing Game Scores!",
  //           description: "The game scores are refreshing... check back soon!",
  //           type: "success",
  //         })
  //       } catch (e) {
  //         popNotification({
  //           title: "Error Refreshing Game Scores!",
  //           description: "There was an error refreshing the game scores. Please try again later.",
  //           type: "error",
  //         })
  //       }
  //     }}
  //   >
  //     <ArrowPathIcon className="w-4 h-4" />
  //   </Web3Button>
  // )
}