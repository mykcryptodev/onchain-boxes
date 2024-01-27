import { CheckIcon, DocumentDuplicateIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { MediaRenderer,NATIVE_TOKEN_ADDRESS,type TransactionError,type TransactionResult,useAddress,useBalance, useContract, useContractEvents, useContractRead,useSDK,Web3Button } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { type FC, useCallback,useContext,useEffect,useMemo,useState } from "react";

import MoonpayPopup from "~/components/BuyCrypto/MoonPay";
import StripePopUp from "~/components/BuyCrypto/Stripe";
import ApplyRandomValues from "~/components/Contest/ApplyRandomValues";
import Box from "~/components/Contest/Box";
import GenerateRandomValues from "~/components/Contest/GenerateRandomValues";
import Header from "~/components/Contest/Header";
import Scoreboard from "~/components/Contest/Scoreboard";
import ContestSkeleton from "~/components/Contest/Skeleton";
import ProfileNameAndImageForm from "~/components/Profile/Form/NameAndImage";
import { EMOJI_TEAM_MAP } from "~/constants";
import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import useConnectWalletOptions from "~/hooks/useConnectWalletOptions";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";
import useLastDigits from "~/hooks/useLastDigits";
import { type OracleGame } from "~/types/contest";
import { type Game } from "~/types/game";
import { api } from "~/utils/api";

export const Contest: NextPage = () => {
  // get the id from the url param
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { activeChainData } = useContext(ActiveChainContext);
  const connectWalletOptions = useConnectWalletOptions();
  const { popNotification } = useContext(NotificationContext);
  const isDarkTheme = useIsDarkTheme();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { contract } = useContract(BOX_CONTRACT[activeChainData.slug] as string);
  const sdk = useSDK();
  const [blockNumber, setBlockNumber] = useState<number>(9828452);
  useEffect(() => {
    if (!sdk) return;
    void (async () => {
      return await sdk.getProvider()?.getBlockNumber();
    })().then((blockNumber) => {
      setBlockNumber(blockNumber);
    });
  }, [sdk]);
  const { data: scoresAssignedEvent } = useContractEvents(
    contract,
    "ScoresAssigned",
    {
      queryFilter: {
        filters: {
          contestId: id, // e.g. Only events where tokenId = 123
        },
        fromBlock: blockNumber, // Events starting from this block
        order: "asc", // Order of events ("asc" or "desc")
      },
      subscribe: true, // Subscribe to new events
    },
  );
  const { 
    data: contest, 
    isLoading: contestIsLoading, 
    refetch: refetchContest,
  } = api.contest.get.useQuery({
    id: Number(id),
    chainId: activeChainData.chainId
  }, {
    enabled: isMounted && !!id,
  });

  const { data: gameScoresUpdatedEvent } = useContractEvents(
    contract,
    "GameScoresUpdated",
    {
      queryFilter: {
        filters: {
          gameId: contest?.gameId, // e.g. Only events where tokenId = 123
        },
        fromBlock: blockNumber, // Events starting from this block
        order: "asc", // Order of events ("asc" or "desc")
      },
      subscribe: true, // Subscribe to new events
    },
  );
  // loading all boxes at once on mobile crashes the page
  const [boxesToLoad, setBoxesToLoad] = useState<number>(0);

  // set boxesToLoad to 0 and refetch the contest
  const refetch = useCallback(() => {
    setBoxesToLoad(0);
    void refetchContest();
  }, [refetchContest]);

  const [gameScoresUpdatedTxHash, setGameScoresUpdatedTxHash] = useState<string | undefined>();
  useEffect(() => {
    if (gameScoresUpdatedEvent) {
      setGameScoresUpdatedTxHash(gameScoresUpdatedEvent[0]?.transaction.transactionHash);
    }
  }, [popNotification, gameScoresUpdatedEvent, refetch]);

  useEffect(() => {
    if (gameScoresUpdatedTxHash === undefined) return;
    void refetch();
    popNotification({
      title: "Scoreboard Updated Onchain",
      description: "The scoreboard for this contest has been updated with real-world data!",
      type: "info",
      actions: [{
        label: `View on ${activeChainData.explorers?.[0]?.name ?? 'Block Explorer'}`,
        link: `${activeChainData.explorers?.[0]?.url ?? ''}/tx/${gameScoresUpdatedTxHash}`,
      }]
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameScoresUpdatedTxHash]);

  const [scoresAssignedTxHash, setScoresAssignedTxHash] = useState<string | undefined>();
  useEffect(() => {
    if (scoresAssignedEvent) {
      setScoresAssignedTxHash(scoresAssignedEvent[0]?.transaction.transactionHash);
    }
  }, [popNotification, scoresAssignedEvent, refetch]);

  useEffect(() => {
    if (scoresAssignedTxHash === undefined) return;
    void refetch();
    popNotification({
      title: "Scores Assigned",
      description: "The random scores for this contest have been generated and assigned!",
      type: "info",
      actions: [{
        label: `View on ${activeChainData.explorers?.[0]?.name ?? 'Block Explorer'}`,
        link: `${activeChainData.explorers?.[0]?.url ?? ''}/tx/${scoresAssignedTxHash}`,
      }]
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoresAssignedTxHash]);

  const { data: game, isLoading: gameIsLoading } = api.game.get.useQuery({
    id: Number(contest?.gameId ?? 0),
  }, {
    enabled: contest !== undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const lastDigits = useLastDigits({ game });

  const {
    data: oracleGame,
  } : {
    data: OracleGame | undefined;
  } = useContractRead(
    contract,
    "gameScores",
    [contest?.gameId ?? 0]
  );

  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const totalCost = useMemo(() => {
    if (!contest || !selectedBoxes.length) return BigNumber.from('0');
    return BigNumber.from(contest.boxCost).mul(selectedBoxes.length);
  }, [selectedBoxes, contest]);

  console.log({ contest, game, selectedBoxes, totalCost })
  const { data: userNativeBalance } = useBalance(NATIVE_TOKEN_ADDRESS);
  const hasEnoughBalance = useMemo(() => {
    if (!userNativeBalance || !contest) return false;
    return userNativeBalance.value.gte(totalCost);
  }, [userNativeBalance, contest, totalCost]);
  const address = useAddress();
  console.log({ address })
  const { 
    data: profile, 
    isLoading: profileIsLoading, 
    refetch: refetchProfile 
  } = api.profile.get.useQuery({
    userId: address ?? '',
  }, {
    enabled: !!address,
  });
  console.log({ profile })
  const userHasNoProfileName = useMemo(() => {
    if (!profile) return true;
    return !profile.name || profile.name === '';
  }, [profile]);

  const TeamName: FC<{game: Game, homeAway: 'home' | 'away'}> = ({ game, homeAway }) => {
    const teamName = game.competitions[0]?.competitors.find(
      (competitor) => competitor.homeAway === homeAway
    )?.team.name ?? "Team";
    const emoji: string = EMOJI_TEAM_MAP[teamName] ?? '🏈';
    return (
      <div className="flex items-center gap-2">
        <span>{emoji}</span>
        <span>{teamName}</span>
      </div>
    );
  };

  useEffect(() => {
    if (!contest || !game) return;
    // load boxes incrementally to avoid crashing mobile
    const interval = setInterval(() => {
      setBoxesToLoad((prev) => Math.min(prev + 22, 121));
    }, 1000);
    return () => clearInterval(interval);
  }, [contest, game]);

  if (!isMounted || gameIsLoading || contestIsLoading) return (
    <ContestSkeleton />
  );

  if (game && contest) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-12">
            <div className="col-span-1" />
            <div className="col-span-10">
              <Header game={game} />
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-1" />
            <div className="col-span-10">
              <Scoreboard game={game} />
            </div>
          </div>
          {!contest.randomValuesSet && !contest.boxesCanBeClaimed && (
            <div className="grid grid-cols-12">
              <div className="col-span-1" />
              <div className="col-span-10">
                <div className="bg-base-200 rounded-lg p-4">
                  Random values are being generated for boxes. Claiming boxes is no longer available for this contest! Anyone will be able to apply the random values to the boxes once the random values are generated. Check back soon!
                </div>
              </div>
            </div>
          )}
          {!contest.randomValuesSet && contest.boxesCanBeClaimed && (
            <GenerateRandomValues contest={contest} onValuesGenerated={() => void refetch()} />
          )}
          {contest.randomValuesSet && !contest.randomValuesSet && (
            <ApplyRandomValues contest={contest} onValuesApplied={() => void refetch()} />
          )}
          <div className="grid grid-cols-12 mt-2">
            <div className="grid col-span-1" />
            <div className="grid col-span-10 place-content-center text-2xl">
              <TeamName game={game} homeAway="home" />
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="grid col-span-1 place-content-center">
              <div className="transform -rotate-90 text-2xl h-fit">
                <TeamName game={game} homeAway="away" />
              </div>
            </div>
            <div className="grid col-span-10">
              <div className="grid grid-cols-11 grid-rows-11 gap-1 w-full h-full">
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                {[...Array(121)].map((_, i) => {
                  const rowNumber = Math.floor(i / 11);
                  const colNumber = i % 11;
                  // the box id is based on the position of the box. 
                  // the boxes in the first column and the boxes in the first row do not get IDs
                  // the box in the upper left corner (0, 0) gets an ID of 0
                  const boxId = i % 11 === 0 || i < 11 ? 0 : (rowNumber - 1) * 10 + colNumber - 1;

                  if (i % 11 === 0 || i < 11) {
                    if (contest.randomValuesSet) {
                      return (
                        <div key={i} className={`border-2 rounded-lg box-border w-full h-full aspect-square grid place-content-center bg-base-200`}>
                          {(i === 0) ? '' : (rowNumber === 0) ? contest.cols[colNumber - 1] : (colNumber === 0) ? contest.rows[rowNumber - 1] : ''}
                        </div>
                      )
                    }
                    return (
                      <div key={i} className={`border-2 ${isDarkTheme ? 'border-neutral' : ''} rounded-lg box-border w-full h-full aspect-square grid place-content-center bg-base-${isDarkTheme ? '300' : '200'}`} />
                    )
                  }
                  if (i < boxesToLoad) return (
                    <Box
                      key={i}
                      boxId={boxId}
                      game={game} 
                      contest={contest} 
                      row={contest.rows[rowNumber - 1] ?? 0} 
                      col={contest.cols[colNumber - 1] ?? 0} 
                      qComplete={oracleGame?.qComplete ?? 0}
                      lastDigits={lastDigits}
                      selectedBoxes={selectedBoxes}
                      onSelection={(boxId: number) => {
                        if (selectedBoxes.includes(boxId)) {
                          setSelectedBoxes(selectedBoxes.filter((id) => id !== boxId));
                        } else {
                          setSelectedBoxes([...selectedBoxes, boxId]);
                        }
                      }}
                    />
                  );
                  return (
                    <div key={i} className="h-full w-full bg-base-300 animate-pulse rounded-lg"></div>
                  )
                })}
              </div>
            </div>
          </div>
          {address && !profileIsLoading && userHasNoProfileName && selectedBoxes.length > 0 && (
            <div className="btm-nav sm:h-1/2 h-4/5 bg-base-300 z-10 px-2 slide-up">
              <div className="flex flex-col gap-2">
                <div className="flex justify-end w-full max-w-sm">
                  <button
                    className="btn btn-ghost btn-circle btn-sm p-2"
                    onClick={() => {
                      setSelectedBoxes([]);
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 stroke-2" />
                  </button>
                </div>
                <div className="text-3xl font-bold">Add your profile</div>
                <div>
                  <ProfileNameAndImageForm 
                    profile={profile} 
                    onSave={() => { void refetchProfile() }}
                  />
                </div>
              </div>
            </div>
          )}
          {address && !hasEnoughBalance && selectedBoxes.length > 0 && (
            <div className="btm-nav sm:h-2/6 h-1/2 bg-base-300 slide-up">
              <div className="flex flex-col gap-2">
                <div className="flex justify-end w-full max-w-sm">
                  <button
                    className="btn btn-ghost btn-circle btn-sm p-2"
                    onClick={() => {
                      setSelectedBoxes([]);
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 stroke-2" />
                  </button>
                </div>
                <div>You do not have enough {activeChainData.nativeCurrency.name} to claim these boxes.</div>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <MediaRenderer
                        src={activeChainData.icon?.url ?? ""}
                        alt={activeChainData.nativeCurrency.name}
                        width="32px"
                        height="32px"
                      />
                    </div>
                    <div className="stat-title">Your Balance</div>
                    <div className="stat-value">
                      {Number(userNativeBalance?.displayValue).toLocaleString([], {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      }) ?? '0'}
                    </div>
                    <div className="stat-desc">
                      {activeChainData.nativeCurrency.name}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure">
                      <MediaRenderer
                        src={activeChainData.icon?.url ?? ""}
                        alt={activeChainData.nativeCurrency.name}
                        width="32px"
                        height="32px"
                      />
                    </div>
                    <div className="stat-title">Total Cost</div>
                    <div className="stat-value">
                      {ethers.utils.formatEther(totalCost)}
                    </div>
                    <div className="stat-desc">
                      {activeChainData.nativeCurrency.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-center flex flex-col gap-1 mt-4">
                  <div>Buy {activeChainData.nativeCurrency.name} with</div>
                  <div className="flex w-full justify-center items-center gap-2">
                    <StripePopUp />
                    <MoonpayPopup />
                  </div>
                  <div className="text-xs">
                    When you buy {activeChainData.nativeCurrency.name}, make sure to send it to the following address:
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <code>{address}</code>
                    <label className="swap swap-rotate">
                      <input 
                        id="copy-address-main"
                        type="checkbox"                   
                        onClick={() => {
                          void navigator.clipboard.writeText(address ?? "");
                          popNotification({
                            title: "Copied",
                            description: "Your wallet address has been copied to your clipboard.",
                            type: "success"
                          });
                          // wait 5 seconds then switch the checkbox back
                          setTimeout(() => {
                            const checkbox = document.getElementById('copy-address-main') as HTMLInputElement;
                            checkbox.checked = false;
                          }, 5000);
                        }}
                      />
                      <DocumentDuplicateIcon className="swap-off w-4 h-4 stroke-2" />
                      <CheckIcon className="swap-on w-4 h-4 stroke-2" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {(hasEnoughBalance || !address) && contest.boxesCanBeClaimed && selectedBoxes.length > 0 && (
            <div className="btm-nav h-1/6 bg-base-300 slide-up">
              <Web3Button
                className="thirdweb-btn-primary-lg"
                isDisabled={totalCost.eq(0)}
                contractAddress={BOX_CONTRACT[activeChainData.slug] as string}
                connectWallet={connectWalletOptions}
                action={async (contract) => {
                  console.log({ contract, selectedBoxes });
                  try {
                    // call the claimBoxes function on the contract
                    const tx = await contract.call(
                      'claimBoxes', 
                      [contest.id, selectedBoxes], 
                      { value: totalCost }
                    ) as TransactionResult;
                    popNotification({
                      title: 'Boxes Claimed!',
                      description: `You successfully claimed ${selectedBoxes.length} box${selectedBoxes.length === 1 ? '' : 'es'}!`,
                      type: 'success',
                      actions: [{
                        label: `View on ${activeChainData.explorers?.[0]?.name ?? 'Block Explorer'}`,
                        link: `${activeChainData.explorers?.[0]?.url ?? ''}/tx/${tx.receipt.transactionHash}`,
                      }]
                    });
                    void refetch();
                    setSelectedBoxes([]);
                  } catch (e) {
                    const error = e as TransactionError;
                    popNotification({
                      title: 'Error claiming boxes',
                      description: error.reason,
                      type: 'error',
                    });
                  }
                }}
              >
                Claim {selectedBoxes.length} Boxes ({ethers.utils.formatEther(totalCost)} {activeChainData.nativeCurrency.symbol})
              </Web3Button>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default Contest;