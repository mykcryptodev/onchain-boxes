import { type NextPage } from "next";

import ContestForm from "~/components/Contest/Form";

export const CreateGame: NextPage = () => {
  return (
    <div className="flex flex-col gap-2 w-full justify-center text-center">
      <h1 className="text-3xl">Create Contest</h1>
      <p className="prose mx-auto max-w-md">
        Create a contest for your friends (or strangers) to join!
        Pick a football game to power your contest.
        Once all boxes are bought, generate random numbers.
        Update the scores onchain and let the winners claim their prizes!
      </p>
      <ContestForm />
    </div>
  );
}

export default CreateGame;