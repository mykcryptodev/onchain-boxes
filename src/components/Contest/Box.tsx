import { CheckCircleIcon, UserCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { type TransactionError, type TransactionResult, useAddress,Web3Button } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import Link from "next/link";
import { type FC,useContext,useEffect,useMemo } from "react";

import { FetchGameData } from "~/components/Contest/FetchGameData";
import Avatar from "~/components/Profile/Avatar";
import Name from "~/components/Profile/Name";
import { PAYOUTS } from "~/constants";
import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import useConnectWalletOptions from "~/hooks/useConnectWalletOptions";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";
import useProfileName from "~/hooks/useProfileName";
import useShortenedAddress from "~/hooks/useShortenedAddress";
import { type ContestData, type TeamLastDigits } from "~/types/contest";
import { type Game } from "~/types/game";

export const Box:FC<{ 
  boxId: number,
  game: Game, 
  contest: ContestData,
  row: number,
  col: number,
  onSelection: (boxId: number) => void,
  selectedBoxes: number[],
  lastDigits: TeamLastDigits,
  qComplete: number,
}> = ({ boxId, game, contest, row, col, lastDigits, onSelection, selectedBoxes, qComplete }) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const connectWalletOptions = useConnectWalletOptions();
  const { popNotification } = useContext(NotificationContext);
  const box = contest.boxes[boxId];
  const boxOwnerName = useProfileName({
    address: box?.owner ?? ethers.constants.AddressZero,
    shorten: true,
  });
  const address = useAddress();
  const { getShortenedAddress } = useShortenedAddress();
  const isDarkTheme = useIsDarkTheme();

  const quarterCompletedLive = useMemo(() => {
    const liveQuarter = game.competitions?.[0]?.status?.period ?? 1;
    if (game.competitions?.[0]?.status?.type?.completed) return 100;
    return (liveQuarter - 1);
  }, [game]);
  
  const isWinner = useMemo(() => {
    return {
      q1: col === lastDigits.home.q1 && row === lastDigits.away.q1 && quarterCompletedLive >= 1,
      q2: col === lastDigits.home.q2 && row === lastDigits.away.q2 && quarterCompletedLive >= 2,
      q3: col === lastDigits.home.q3 && row === lastDigits.away.q3 && quarterCompletedLive >= 3,
      f: col === lastDigits.home.f && row === lastDigits.away.f && game.competitions?.[0]?.status?.type?.completed,
    }
  }, [col, lastDigits.home.q1, lastDigits.home.q2, lastDigits.home.q3, lastDigits.home.f, lastDigits.away.q1, lastDigits.away.q2, lastDigits.away.q3, lastDigits.away.f, row, quarterCompletedLive, game.competitions]);

  const hasWon = useMemo(() => {
    if (!contest.randomValuesSet) return false;
    return (isWinner.q1 && quarterCompletedLive >= 1) || 
      (isWinner.q2 && quarterCompletedLive >= 2) || 
      (isWinner.q3 && quarterCompletedLive >= 3) || 
      (isWinner.f && game.competitions?.[0]?.status?.type?.completed);
    }, [contest.randomValuesSet, isWinner.q1, isWinner.q2, isWinner.q3, isWinner.f, quarterCompletedLive, game.competitions]);

  const isYetToBePaid = useMemo(() => {
    if (isWinner.q1 && !contest.q1Paid) return true;
    if (isWinner.q2 && !contest.q2Paid) return true;
    if (isWinner.q3 && !contest.q3Paid) return true;
    if (isWinner.f && !contest.finalPaid) return true;
    return false;
  }, [isWinner, contest]);

  const isAbleToBePaid = useMemo(() => {
    if (!hasWon) return false;
    if (!isYetToBePaid) return false;
    if (isWinner.q1 && qComplete >= 1 && !contest.q1Paid) return true;
    if (isWinner.q2 && qComplete >= 2 && !contest.q2Paid) return true;
    if (isWinner.q3 && qComplete >= 3 && !contest.q3Paid) return true;
    if (isWinner.f && qComplete >= 4 && !contest.finalPaid) return true;
    return false;
  }, [hasWon, isYetToBePaid, isWinner.q1, isWinner.q2, isWinner.q3, isWinner.f, qComplete, contest.q1Paid, contest.q2Paid, contest.q3Paid, contest.finalPaid]);

  type Quarter = "q1" | "q2" | "q3" | "f";
  const QuarterWinner: FC<{ quarter: Quarter }> = ({ quarter }) => (
    <div className="flex items-center gap-2">
      <span className="uppercase">{quarter}</span>
      {isWinner[quarter] ? (
        <CheckCircleIcon className="w-4 h-4 stroke-2 text-success" />
      ) : (
        <XCircleIcon className="w-4 h-4 stroke-2 text-error" />
      )}
    </div>
  );

  const pendingRewardAmount = useMemo(() => {
    if (!contest) return 0;
    if (!box) return 0;
    if (!hasWon) return 0;
    const totalAmountInContest = Number(ethers.utils.formatEther(contest.boxCost)) * Number(contest.boxesClaimed);
    let pendingRewardAmount = 0;
    if (isWinner.q1 && !contest.q1Paid) {
      pendingRewardAmount += totalAmountInContest * PAYOUTS.q1;
    }
    if (isWinner.q2 && !contest.q2Paid) {
      pendingRewardAmount += totalAmountInContest * PAYOUTS.q2;
    }
    if (isWinner.q3 && !contest.q3Paid) {
      pendingRewardAmount += totalAmountInContest * PAYOUTS.q3;
    }
    if (isWinner.f && !contest.finalPaid) {
      pendingRewardAmount += totalAmountInContest * PAYOUTS.f;
    }
    if (box.owner === ethers.constants.AddressZero) return pendingRewardAmount / 2;
    return pendingRewardAmount;
  }, [box, contest, hasWon, isWinner.f, isWinner.q1, isWinner.q2, isWinner.q3]);

  // Insert this code at the desired location
  useEffect(() => {
    const handleCloseModal = () => {
      const modal = document?.getElementById(`profile-modal-${boxId}`);
      if (modal) {
        (modal as HTMLDialogElement).close();
      }
    };
    const claimRewardButton = document.getElementById(`claim-reward-${boxId}`);
    if (claimRewardButton) {
      claimRewardButton.addEventListener('click', handleCloseModal);
    }
    return () => {
      if (claimRewardButton) {
        claimRewardButton.removeEventListener('click', handleCloseModal);
      }
    };
  }, [boxId]);

  if (!box) return null;

  if (contest.boxesCanBeClaimed && box.owner === ethers.constants.AddressZero) {
    return (
      <div 
        onClick={() => onSelection(boxId)}
        className={`cursor-pointer border-2 rounded-lg box-border w-full h-full aspect-square grid place-content-center`}>
        <input
          type="checkbox"
          className="checkbox-primary checkbox lg:checkbox-lg checkbox-sm border-0"
          checked={selectedBoxes.includes(boxId)}
          onChange={() => {
            console.log('clicked');
            onSelection(boxId);
          }}
        />
      </div>
    )
  }

  return (
    <div className="sm:tooltip sm:tooltip-bottom cursor-pointer" data-tip={boxOwnerName}>
      <div 
        className={`
          ${box.owner === address ? 'border-primary' : ''} 
          ${(isAbleToBePaid && isYetToBePaid) ? 'bg-gradient-to-b from-primary to-success border-success' : ''}
          ${(hasWon && !(isAbleToBePaid && isYetToBePaid)) ? 'bg-gradient-to-b from-transparent to-success border-success' : ''}
          border-2 
          rounded-lg box-border w-full h-full aspect-square grid place-content-center`}
      >
        <label 
          htmlFor={`profile-modal-${boxId}`} 
          className="btn btn-ghost btn-circle btn-xs sm:btn-md"
        >
          {box.owner === ethers.constants.AddressZero ? (
            <span></span>
          ) : (
            <Avatar address={box.owner} />
          )}
        </label>

        <input type="checkbox" id={`profile-modal-${boxId}`} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box overflow-x-hidden">
            <h3 className="font-bold text-lg">
              <Link 
                className="text-2xl flex flex-col items-center w-full gap-2" 
                href={`/profile/${box.owner}`}
              >
                {box.owner === ethers.constants.AddressZero ? (
                  <div className="flex flex-col items-center w-full gap-1">
                    <UserCircleIcon className="w-12 h-12 stroke-2" />
                    <span>
                      Unclaimed Box
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full gap-1">
                    <Avatar address={box.owner} width={48} height={48} />
                    <Name address={box.owner} disableTooltip /> 
                    <span className="text-xs">
                      {getShortenedAddress(box.owner)}
                    </span>
                  </div>
                )}
              </Link>
            </h3>
            <div className="flex flex-col gap-2 my-2 bg-base-200 p-4 rounded">
              <div className="text-lg text-center">
                Winning Quarters
              </div>
              <div className="w-full flex items-center justify-around gap-2">
                <QuarterWinner quarter="q1" />
                <QuarterWinner quarter="q2" />
                <QuarterWinner quarter="q3" />
                <QuarterWinner quarter="f" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {hasWon && box.owner === ethers.constants.AddressZero && isYetToBePaid && (
                <p className="text-center">
                  Nobody owns this box. The first player to claim the reward will receive half of the prize!
                </p>
              )}
              {hasWon && isYetToBePaid && !isAbleToBePaid && (
                <FetchGameData
                  game={game}
                  btnClass="btn btn-primary btn-block"
                  btnLabel="Refresh scores to claim reward"
                  tooltipDirection="tooltip-top"
                  onFetched={() => console.log('scores refreshed')}
                />
              )}
              {hasWon && (
                <Web3Button
                  className="thirdweb-btn-primary"
                  contractAddress={BOX_CONTRACT[activeChainData.slug] as string}
                  isDisabled={!isYetToBePaid || !isAbleToBePaid}
                  connectWallet={connectWalletOptions}
                  action={async (contract) => {
                    try {
                      const tx = await contract.call("claimReward", [contest.id, boxId]) as TransactionResult;
                      console.log({ tx })
                      popNotification({
                        type: "success",
                        title: "Reward Claimed",
                        description: `The reward of ${pendingRewardAmount} ${activeChainData.nativeCurrency.symbol} is on the way!`,
                        actions: [{
                          label: "View Transaction",
                          link: `${activeChainData.explorers?.[0]?.url ?? ''}/tx/${tx.receipt.transactionHash}`,
                        }],
                      });
                    } catch (err) {
                      console.error(err);
                      const e = err as TransactionError;
                      popNotification({
                        type: "error",
                        title: "Error Claiming Reward",
                        description: e.reason ?? e.message,
                      });
                    } finally {
                      // close the modal
                      document?.getElementById(`profile-modal-${boxId}`)?.click();
                    }
                  }}
                >
                  <span className={`${(!isYetToBePaid || !isAbleToBePaid) ? `${isDarkTheme ? 'text-base-content opacity-50' : 'text-base-300 opacity-50'}` : ''}`}>
                    {isYetToBePaid ? `Claim Box Reward (${pendingRewardAmount} ${activeChainData.nativeCurrency.symbol})` : 'Reward Claimed'}
                  </span>
                </Web3Button>
              )}
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => {
                  document?.getElementById(`profile-modal-${boxId}`)?.click();
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Box;