import { type FC } from "react";

import { type Game } from "~/types/game";

type Props = {
  game: Game;
}

export const Header: FC<Props> = ({ game }) => {
  const homeTeam = game.competitions[0]?.competitors.find(
    (competitor) => competitor.homeAway === 'home'
  );
  const awayTeam = game.competitions[0]?.competitors.find(
    (competitor) => competitor.homeAway === 'away'
  );
  const startTime = game.competitions[0]?.date 
    ? new Date(game.competitions[0]?.date).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      weekday: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) 
    : "TBD"
  ;
  const isInFuture = !game.competitions[0]?.date ? false : new Date(game.competitions[0]?.date) > new Date();
  return (
    <div className="flex flex-col gap-2 text-center">
      <div className="text-2xl font-bold">
        {awayTeam?.team.name} @ {homeTeam?.team.name}
      </div>
      {!isInFuture && (
        <div>{startTime}</div>
      )}
      {game.competitions[0]?.status?.type && (
        <div>
          {game.competitions[0].status.type.detail}
        </div>
      )}
    </div>
  )
};

export default Header;