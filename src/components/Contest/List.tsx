import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { Token,TokenAmount } from "@uniswap/sdk";
import { ethers } from "ethers";
import Link from "next/link";
import { type FC,useContext, useEffect, useState } from "react";

import Avatar from "~/components/Profile/Avatar";
import Name from "~/components/Profile/Name";
import { EMOJI_TEAM_MAP } from "~/constants";
import ActiveChainContext from "~/context/ActiveChain";
import useEtherPrice from "~/hooks/useEtherPrice";
import { type Game } from "~/types/game";
import { api } from "~/utils/api";

const CONTESTS_PER_PAGE = 10;

type Props = {
  withUser?: string;
}

export const ContestList: FC<Props> = ({ withUser }) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const [page, setPage] = useState<number>(1);
  const { 
    data: contestList, 
    isLoading: isLoadingContests,
  } = api.contest.list.useQuery({
    chainId: activeChainData.chainId,
    withUser,
    take: CONTESTS_PER_PAGE,
    skip: (page - 1) * CONTESTS_PER_PAGE,
  }, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  console.log({ contestList })
  const { 
    data: games,
    isLoading: isLoadingGames,
  } = api.game.getMany.useQuery({
    ids: contestList?.contests?.map((c) => Number(c.gameId)) ?? [],
  }, {
    enabled: !!contestList?.contests?.length,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const contestWithGame = contestList?.contests?.map((contest) => {
    const game = games?.find((g) => Number(g?.id) === Number(contest.gameId));
    return {
      ...contest,
      game,
    };
  }).filter((c) => c.game !== undefined);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;


  const teamEmoji = (game: Game | undefined, team: "home" | "away") => {
    if (!game) return null;
    const teamName = game.competitions?.[0]?.competitors?.find((c) => c.homeAway === team)?.team?.name;
    if (!teamName) return null;
    const emoji = EMOJI_TEAM_MAP[teamName] as keyof typeof EMOJI_TEAM_MAP;
    if (!emoji) return null;
    return <span className="emoji">{emoji}</span>;
  }

  const TABLE_HEADERS = [
    { title: "Game", className: "" },
    { title: "Creator", className: "" },
    { title: "Date", className: "" },
    { title: "Box Cost", className: "text-right" },
    { title: "Boxes Claimed", className: "text-right" },
  ];

  const DollarValue: FC<{ ethAmount: string }> = ({ ethAmount }) => {
    const ethToken = new Token(
      activeChainData.chainId,
      NATIVE_TOKEN_ADDRESS,
      activeChainData.nativeCurrency.decimals,
      activeChainData.nativeCurrency.symbol,
      activeChainData.nativeCurrency.name,
    );
    const tokenAmount = new TokenAmount(ethToken, ethAmount);
    const etherPrice = useEtherPrice(activeChainData);
    if (!etherPrice) return null;
    const boxPrice = tokenAmount.multiply(etherPrice);
    return (
      <span>~${boxPrice.toFixed(2)}</span>
    );
  }
  
  return (
    <div className="w-full flex flex-col gap-2 justify-center overflow-x-auto">
      <table className="table table-zebra  min-w-[1024px]">
        <tr>
          {TABLE_HEADERS.map((header) => (
            <th key={header.title} className={header.className}>
              {header.title}
            </th>
          ))}
        </tr>
        {(isLoadingContests || isLoadingGames) && Array.from({ length: CONTESTS_PER_PAGE }).map((_, index) => (
          <tr key={index}>
            {Array.from({ length: TABLE_HEADERS.length }).map((_, index) => (
              <td key={index}>
                <div className="flex bg-base-200 rounded-lg h-6 w-32" />
              </td>
            ))}
          </tr>
        ))}
        {!isLoadingContests && !contestWithGame?.length && (
          <tr>
            <td colSpan={4}>No Contests</td>
          </tr>
        )}
        <tbody>
          {contestWithGame?.map((contest) => (
            <tr key={contest.id}>
              <td>
                <div className="flex h-full items-start">
                  <Link href={`/contest/${contest.id}`} className="flex gap-2">
                    {teamEmoji(contest?.game, "away")}
                    <span className="underline sm:hidden flex">{contest.game?.shortName}</span>
                    <span className="underline sm:flex hidden">{contest.game?.name}</span>
                    {teamEmoji(contest?.game, "home")}
                  </Link>
                </div>
              </td>
              <td>
                <Link href={`/profile/${contest.creator}`}>
                  <div className="flex items-center gap-2">
                    <Avatar address={contest.creator} />
                    <Name address={contest.creator} />
                  </div>
                </Link>
              </td>
              <td>
                {new Date(contest.game?.date ?? "").toLocaleDateString([], {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </td>
              <td>
                <div className="flex flex-col w-full text-right">
                  <span>
                    {ethers.utils.formatEther(contest.boxCost)} &nbsp;
                    {activeChainData.nativeCurrency.symbol}
                  </span>
                  <span className="text-xs opacity-50">
                    <DollarValue ethAmount={contest.boxCost} />
                  </span>
                </div>
              </td>
              <td>
                <div className="flex flex-col w-full text-right">
                  <span>{contest.boxesClaimed} / 100</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex text-sm items-center gap-1 justify-between w-full">
        <span>Total Contests: {contestList?.total}</span>
        <div className="flex items-center gap-2">
          <div className="join">
            {/* <button className="join-item btn">«</button> */}
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage(page - 1)}
              disabled={page - 1 < 1}
            >
              <ChevronLeftIcon className="w-3 h-3 stroke-2" />
            </button>
            {Array.from({ length: Math.ceil((contestList?.total ?? 0) / CONTESTS_PER_PAGE) }).map((_, index) => (
              <button
                key={index}
                className={`join-item btn btn-sm ${page === index + 1 ? 'btn-primary' : ''}`}
                onClick={() => setPage(index + 1)}
              >
                {/* calculate the number of pages there would based on the total and page size */}
                {index + 1}
              </button>
            ))}
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage(page + 1)}
              disabled={((page + 1) * CONTESTS_PER_PAGE) > (contestList?.total ?? 0)}
            >
              <ChevronRightIcon className="w-3 h-3 stroke-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ContestList;