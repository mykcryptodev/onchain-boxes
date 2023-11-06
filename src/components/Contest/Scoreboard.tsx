import { type FC } from "react";

import { FetchGameData } from "~/components/Contest/FetchGameData";
import { EMOJI_TEAM_MAP } from "~/constants";
import useScoresOnchain from "~/hooks/useScoresOnchain";
import { type Competitor, type Game } from "~/types/game";

type Props = {
  game: Game;
}

export const Scoreboard: FC<Props> = ({ game }) => {
  const { data: scoresOnchain, refetch } = useScoresOnchain(game.id);
  console.log({ scoresOnchain });
  const homeTeam = game.competitions[0]?.competitors.find(
    (competitor) => competitor.homeAway === 'home'
  );
  const awayTeam = game.competitions[0]?.competitors.find(
    (competitor) => competitor.homeAway === 'away'
  );

  const currentQuarter = game.competitions?.[0]?.status?.period ?? 0;

  const score = (quarter: number, team: Competitor | undefined) => {
    console.log({ team, currentQuarter })
    console.log('quarter passed is ', quarter);
    console.log('currentQuarter is ', currentQuarter)
    console.log('the current quarter is less than or equal to the quarter passed in ', currentQuarter <= quarter);
    if (!team || !game) return 0;
    if (currentQuarter < quarter) return '-';
    switch (quarter) {
      case 1:
        return team.linescores?.[0]?.value;
      case 2:
        return (team.linescores?.[0]?.value ?? 0) + (team.linescores?.[1]?.value ?? 0);
      case 3:
        return (team.linescores?.[0]?.value ?? 0) + (team.linescores?.[1]?.value ?? 0) + (team.linescores?.[2]?.value ?? 0);
      case 4:
        return (team.linescores?.[0]?.value ?? 0) + (team.linescores?.[1]?.value ?? 0) + (team.linescores?.[2]?.value ?? 0) + (team.linescores?.[3]?.value ?? 0);
      default:
        return Number(team.score ?? 0);
    }
  }

  const Quarter: FC<{ number: number, name: string  }> = ({ number, name }) => {
    const isOnchain = (scoresOnchain?.qComplete ?? 0) >= number;
    return (
      <div className="tooltip cursor-pointer" data-tip={`${isOnchain ? `${name} scores are saved onchain` : `${name} scores are not yet onchain`}`}>
        <div className="flex w-full justify-center items-center gap-1">
          <div>{name}</div>
          <div className={`w-2 h-2 rounded-full bg-${isOnchain ? 'primary' : 'warning'}`} />
        </div>
      </div>
    )
  };

  const Score: FC<{ quarter: number, team: Competitor | undefined  }> = ({ quarter, team }) => {
    // const isOnchain = (scoresOnchain?.qComplete ?? 0) >= quarter;
    const gameIsOver = game.competitions?.[0]?.status?.type?.completed ?? false;
    const isInProgress = currentQuarter <= quarter && !gameIsOver;
    return (
      <div className={`${isInProgress ? 'opacity-70' : ''}`}>
        {score(quarter, team)}
      </div>
    )
  };

  return (
    <div className="bg-base-200 flex flex-col gap-2 p-4 rounded-lg text-center">
      <div className="grid grid-cols-5 gap-2 border-b-2">
        <div>
          <FetchGameData 
            game={game} 
            onFetched={() => void refetch()} 
          />
        </div>
        <Quarter number={1} name={"Q1"} />
        <Quarter number={2} name={"Q2"} />
        <Quarter number={3} name={"Q3"} />
        <Quarter number={4} name={"Final"} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {homeTeam ? (
          <div className="w-full text-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
            {EMOJI_TEAM_MAP[homeTeam.team.name] ?? '🏈'}&nbsp;
            {homeTeam.team.abbreviation}
          </div>
        ) : (
          <div>Home</div>
        )}
        <Score quarter={1} team={homeTeam} />
        <Score quarter={2} team={homeTeam} />
        <Score quarter={3} team={homeTeam} />
        <Score quarter={4} team={homeTeam} />
      </div>
      <div className={`grid grid-cols-5 gap-2`}>
        {awayTeam ? (
          <div className="w-full text-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
            {EMOJI_TEAM_MAP[awayTeam.team.name] ?? '🏈'}&nbsp;
            {awayTeam.team.abbreviation}
          </div>
        ) : (
          <div>Away</div>
        )}
        <Score quarter={1} team={awayTeam} />
        <Score quarter={2} team={awayTeam} />
        <Score quarter={3} team={awayTeam} />
        <Score quarter={4} team={awayTeam} />
      </div>
    </div>
  )
};

export default Scoreboard;