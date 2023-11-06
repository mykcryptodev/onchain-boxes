import { type TeamLastDigits } from "~/types/contest";
import { type Game, type LineScore } from "~/types/game";

const useLastDigits = ({ game } : {
  game: Game | undefined;
}) => {
  const homeScores = game?.competitions[0]?.competitors.find(team => team.homeAway === "home")?.linescores;
  const awayScores = game?.competitions[0]?.competitors.find(team => team.homeAway === "away")?.linescores;

  const calculateLastDigits = (linescore: LineScore[] | undefined) => {
    // q1 score is the last digit of the first score
    const q1 = parseInt(linescore?.[0]?.value?.toString() || linescore?.[0]?.displayValue || "0");
    const q1LastDigit = parseInt(q1.toString().slice(-1));
    // q2 score is the last digit of the sum of the first score and second score
    const q2 = parseInt(linescore?.[1]?.value?.toString() || linescore?.[1]?.displayValue || "0");
    const q2LastDigit = parseInt((q1 + q2).toString().slice(-1));
    // q3 score is the last digit of the sum of the first score, second score, and third score
    const q3 = parseInt(linescore?.[2]?.value?.toString() || linescore?.[2]?.displayValue || "0");
    const q3LastDigit = parseInt((q1 + q2 + q3).toString().slice(-1));
    // final score is the last digit of the sum of all scores
    const f = parseInt(linescore?.[3]?.value?.toString() || linescore?.[3]?.displayValue || "0");
    const fLastDigit = parseInt((q1 + q2 + q3 + f).toString().slice(-1));
    return {
      q1: q1LastDigit,
      q2: q2LastDigit,
      q3: q3LastDigit,
      f: fLastDigit,
    }
  };

  const homeLastDigits = calculateLastDigits(homeScores);
  const awayLastDigits = calculateLastDigits(awayScores);

  return {
    home: homeLastDigits,
    away: awayLastDigits,
  } as TeamLastDigits;
};

export default useLastDigits;