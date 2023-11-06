import { MediaRenderer, NATIVE_TOKEN_ADDRESS,type TransactionError, type TransactionResult, Web3Button } from "@thirdweb-dev/react";
import { Token, TokenAmount } from "@uniswap/sdk";
import { BigNumber, ethers } from "ethers";
import { useRouter } from "next/router";
import { type FC,useContext, useEffect,useMemo } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import useConnectWalletOptions from "~/hooks/useConnectWalletOptions";
import useEtherPrice from "~/hooks/useEtherPrice";
import { api } from "~/utils/api";

interface FormInput {
  gameId: string;
  week: number;
  boxCost: number;
}

export const GameForm: FC = () => {
  const router = useRouter();
  const { activeChainData } = useContext(ActiveChainContext);
  const connectWalletOptions = useConnectWalletOptions();
  const { popNotification } = useContext(NotificationContext);
  const { data: currentWeek } = api.game.getCurrentWeek.useQuery();
  const { register, handleSubmit, watch, reset } = useForm<FormInput>({
    defaultValues: {
      gameId: '',
      week: currentWeek?.week?.number ?? 1,
      boxCost: 0,
    },
  });
  useEffect(() => {
    reset({
      gameId: '',
      week: currentWeek?.week?.number ?? 1,
      boxCost: 0,
    });
  }, [currentWeek?.week?.number, reset]);
  const week = watch("week");
  const gameId = watch("gameId");
  const boxCost = watch("boxCost");
  const boxCostEther = !boxCost ? BigNumber.from("0") : ethers.utils.parseEther(boxCost.toString());
  const etherPrice = useEtherPrice(activeChainData);
  const boxCostUsd = useMemo(() => {
    const etherToken = new Token(
      activeChainData.chainId,
      NATIVE_TOKEN_ADDRESS,
      activeChainData.nativeCurrency.decimals,
      activeChainData.nativeCurrency.symbol,
      activeChainData.nativeCurrency.name,
    );
    if (!etherPrice) return new TokenAmount(etherToken, "0");
    return etherPrice.multiply(new TokenAmount(
      etherToken,
      boxCostEther.toString()
    ));
  }, [activeChainData.chainId, activeChainData.nativeCurrency.decimals, activeChainData.nativeCurrency.name, activeChainData.nativeCurrency.symbol, boxCostEther, etherPrice]);
  const { data: weekData, isLoading: isLoadingWeekData } = api.game.getByWeek.useQuery({
    week: Number(week)
  });
  const onSubmit: SubmitHandler<FormInput> = (data) => {
    console.log({ data })
  };

  return (
    <div className="flex justify-center w-full">
      <form onSubmit={void handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg capitalize">Week</span>
            </label>
            <div className="text-sm pb-2">
              Select a week to populate the games you can choose from
            </div>
            <select
              {...register("week")}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="">Select a week</option>
              {/* week options are 1 - 16 */}
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
              {[...Array(16)].map((_, i) => {
                return (
                  <option key={i} value={i + 1}>
                    Week {i + 1}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg capitalize">Game</span>
            </label>
            <div className="text-sm pb-2">
              This is the game that your boxes are based on
            </div>
            <select
              {...register("gameId")}
              disabled={isLoadingWeekData}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="">Select a game</option>
              {weekData?.events?.map((game) => {
                const homeTeam = game.competitions[0]?.competitors.find(
                  (competitor) => competitor.homeAway === 'home'
                )?.team.name;
                const awayTeam = game.competitions[0]?.competitors.find(
                  (competitor) => competitor.homeAway === 'away'
                )?.team.name;
                const gameTime = new Date(game.date).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                });
                return (
                  <option key={game.id} value={game.id}>
                    {awayTeam ?? "Away Team"} @ {homeTeam ?? "Home Team"}: {gameTime}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text text-lg capitalize">Box Cost</span>
            </label>
            <div className="text-sm pb-2">
              Set the price per-box for your contest
            </div>
            <div className="join">
              <input
                {...register("boxCost")}
                type="number"
                className="input input-bordered w-full max-w-xs join-item text-right"
              />
              <div className="join-item input input-bordered p-4 flex items-center gap-2 place-content-center">
                <MediaRenderer
                  src={activeChainData.icon?.url ?? "/images/logo.png"}
                  alt={activeChainData.nativeCurrency.name}
                  width="24px"
                  height="24px"
                />
                {activeChainData.nativeCurrency.symbol}
              </div>
            </div>
            {!boxCostEther.eq(0) && (
              <label className="label text-opacity-50">
                <span></span>
                <span className="label-text capitalize">
                  ~${boxCostUsd.toFixed(2, { groupSeparator: ',' })}
                </span>
              </label>
            )}
          </div>
          <Web3Button 
            type="button"
            className="thirdweb-btn-primary"
            contractAddress={BOX_CONTRACT[activeChainData.slug] as string}
            connectWallet={connectWalletOptions}
            action={async (contract) => {
              try {
                // this will most likely be the next contest id
                const nextContestId = await contract.call("contestIdCounter") as BigNumber;
                const tx = await contract.call("createContest", [
                  gameId, boxCostEther
                ]) as TransactionResult;
                console.log({ tx })
                popNotification({
                  type: "success",
                  title: "Contest Created!",
                  description: "You just created a contest for your friends to join!",
                });
                // redirect to the contest page
                void router.push(`/contest/${nextContestId.toString()}`);
              } catch (e) {
                console.log({ e });
                const error = e as TransactionError;
                popNotification({
                  type: "error",
                  title: "Error Creating Contest",
                  description: error.reason,
                });
              }
            }}
          >
            Create Contest
          </Web3Button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;