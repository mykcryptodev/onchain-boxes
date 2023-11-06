import { ProposalState, useContract } from "@thirdweb-dev/react";
import { type Proposal } from "@thirdweb-dev/sdk";
import { type NextPage } from "next";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

import VotingStats from "~/components/Vote/Stats";
import { VOTING_CONTRACT } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";
import ActiveChainContext from "~/context/ActiveChain";

export const Vote: NextPage = () => {
  const { updateActiveChain } = useContext(ActiveChainContext);
  useEffect(() => {
    void updateActiveChain(VOTING_CHAIN.slug);
  }, [updateActiveChain]);
  const { contract } = useContract(VOTING_CONTRACT[VOTING_CHAIN.slug] as string, "vote");
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (contract) {
      const getProposals = async () => {
        setProposals(await contract.getAll());
        // try {
        //   const proposalIndex = await contract.call("proposalIndex");
        //   console.log({ proposalIndex })
          
        //   if (!proposalIndex) return;
        //   // map an array of proposalIds to an array of promises
        //   const proposals = await Promise.all(Array.from({ length: Number(proposalIndex.toString()) }, async (_, index) => {
        //     try {
        //       const prop = await contract.call("proposals", [index]);
        //       const [state, votes] = await Promise.all([
        //         contract.call("state", [prop.proposalId]),
        //         contract.call("proposalVotes", [prop.proposalId]),
        //       ]);

        //       console.log({
        //         prop, state, votes
        //       })

        //       return {
        //         proposalId: prop.proposalId,
        //         proposer: prop.proposer,
        //         description: prop.description,
        //         state: state,
        //         startBlock: prop.startBlock,
        //         endBlock: prop.endBlock,
        //         votes: [
        //           { type: 0, label: "against", count: votes[0] },
        //           { type: 1, label: "for", count: votes[1] },
        //           { type: 2, label: "abstain", count: votes[2] },
        //         ] as ProposalVote[],
        //         executions: []
        //       }
        //     } catch (e) {
        //       console.error({ e })
        //     }
        //   }));
        //   console.log({ proposals })
        //   if (!proposals) return;
        //   setProposals(proposals.filter((proposal) => proposal !== undefined));
        // } catch (e) {
        //   console.error({ e })
        // }
      };
      void getProposals();
    }
  }, [contract]);

  const stateColor = (state: number) => {
    switch (state) {
      case ProposalState.Pending:
        return "secondary";
      case ProposalState.Active:
        return "primary";
      case ProposalState.Canceled:
        return "error badge-outline";
      case ProposalState.Expired:
        return "neutral";
      case ProposalState.Queued:
        return "secondary badge-outline";
      case ProposalState.Defeated:
        return "error";
      case ProposalState.Succeeded:
        return "success";
      case ProposalState.Executed:
        return "success badge-outline";
      default:
        return "";
    }
  };

  if (!proposals.length) {
    return (
      // return an array of 10 cards
      <div className="flex flex-col gap-2 justify-center max-w-2xl mx-auto px-2">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-5xl font-bold my-4">Vote</h1>
          <Link
            href="/vote/create"
            className="btn btn-primary"
          >
            Create Proposal
          </Link>
        </div>
        <h2 className="text-3xl font-bold my-4">Stats</h2>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex gap-2 items-center">
              <div className="flex flex-col gap-2 w-full">
                <div className="w-24 h-4 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-36 h-12 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-3/4 h-4 rounded-lg bg-base-200 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="w-24 h-4 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-36 h-12 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-3/4 h-4 rounded-lg bg-base-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold my-4 mt-8">Proposals</h2>
        <div className="flex flex-col gap-4 w-full">
          {Array.from({ length: 10 }, (_, index) => (
            <div className="card bg-base-100 shadow-xl" key={index}>
              <div className="card-body">
                <h2 className="card-title flex justify-between items-center">
                  <div className="w-2/6 h-8 rounded-lg bg-base-200 animate-pulse" />
                  <div className="w-1/6 h-6 rounded-lg bg-base-200 animate-pulse" />
                </h2>
                <div className="my-4" />
                <div className="w-72 h-6 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-full h-6 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-3/4 h-6 rounded-lg bg-base-200 animate-pulse" />
                <div className="w-5/6 h-6 rounded-lg bg-base-200 animate-pulse" />
                <div className="my-4" />
                <div className="card-actions justify-end">
                  <div className="w-24 h-10 rounded-lg bg-base-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  } 

  return (
    <div className="flex flex-col gap-2 justify-center max-w-2xl mx-auto px-2">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-5xl font-bold my-4">Vote</h1>
        <Link
          href="/vote/create"
          className="btn btn-primary"
        >
          Create Proposal
        </Link>
      </div>
      <h2 className="text-3xl font-bold my-4">Stats</h2>
      <VotingStats proposals={proposals} />
      <h2 className="text-3xl font-bold my-4 mt-8">Proposals</h2>
      <div className="flex flex-col gap-4 w-full pb-8">
        {proposals.map((proposal, index) => (
          <div className="card bg-base-100 shadow raise-on-hover" key={proposal.proposalId.toString()}>
            <div className="card-body">
              <h2 className="card-title flex justify-between items-center">
                <span>Proposal #{index}</span>
                <div className={`badge badge-lg badge-${stateColor(proposal.state)}`}>
                  {ProposalState[proposal.state]}
                </div>
              </h2>
              <div className="relative">
                <div className="w-full h-2/6 bottom-0 absolute bg-gradient-to-t from-base-100 to-transparent rounded-b-lg" />
                <ReactMarkdown className="prose max-h-48 text-ellipsis overflow-hidden">
                  {proposal.description}
                </ReactMarkdown>
              </div>
              <div className="card-actions justify-end">
                <Link
                  href={`/vote/${proposal.proposalId.toString()}`}
                  className="btn btn-ghost"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        )).reverse()}
      </div>
    </div>
  );
}

export default Vote;