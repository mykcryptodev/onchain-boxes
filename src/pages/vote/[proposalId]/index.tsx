import { ArrowLeftIcon, CheckIcon, HandRaisedIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type Proposal,ProposalState,type TransactionError,useAddress,useContract,VoteType, Web3Button } from "@thirdweb-dev/react";
import { type ProposalVote } from "@thirdweb-dev/sdk";
import { Percent } from "@uniswap/sdk";
import { BigNumber, ethers } from "ethers";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useCallback,useContext, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Portal } from "~/components/utils/Portal";
import VoteDeadline from "~/components/Vote/Deadline";
import Delegation from "~/components/Vote/Delegation";
import ExecuteVote from "~/components/Vote/Execute";
import VoteExecutions from "~/components/Vote/Executions";
import { VOTING_CONTRACT } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import { abbreviatedNumber } from '~/helpers/abbreviatedNumber';

export const ProposalPage: NextPage = () => {
  const router = useRouter();
  const { popNotification } = useContext(NotificationContext);
  const { proposalId } = router.query as { proposalId: string };
  const { updateActiveChain } = useContext(ActiveChainContext);
  useEffect(() => {
    void updateActiveChain(VOTING_CHAIN.slug);
  }, [updateActiveChain]);
  const address = useAddress();
  const { contract: voteContract } = useContract(VOTING_CONTRACT[VOTING_CHAIN.slug] as string, "vote");
  const [proposal, setProposal] = useState<Proposal>();
  const [votes, setVotes] = useState<ProposalVote[]>([]);
  const [deadlinePast, setDeadlinePast] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const getProposal = useCallback(async () => {
    if (!voteContract) return;
    const proposal = await voteContract.get(proposalId);
    setProposal(proposal);
  }, [voteContract, proposalId]);
  
  const getVotes = useCallback(async () => {
    if (!voteContract) return;
    const votes = await voteContract.getProposalVotes(BigNumber.from(proposalId));
    setVotes(votes);
  }, [voteContract, proposalId]);

  const checkHasVoted = useCallback(async () => {
    if (!voteContract || !address) return false;
    const hasVoted = await voteContract.hasVoted(proposalId, address);
    setHasVoted(hasVoted);
  }, [voteContract, address, proposalId]);

  useEffect(() => {
    if (voteContract) {
      void getProposal();
      void getVotes();
    }
  }, [voteContract, getProposal, getVotes, proposalId]);

  useEffect(() => {
    if (address && proposalId) {
      void checkHasVoted();
    }
  }, [address, checkHasVoted, proposalId, voteContract]);

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

  const Results: FC = () => {
    const totalVotes = useMemo(() => {
      // sum up vote.count()
      return votes.reduce((acc, vote) => acc.add(vote.count), BigNumber.from(0));
    }, []);
    const forPercentage = useMemo(() => {
      // (yes.count() / totalVotes) * 100
      return new Percent(votes.find((vote) => vote.label === "For")?.count.toString() || "0", totalVotes.toString());
    }, [totalVotes]);
    const againstPercentage = useMemo(() => {
      // (no.count() / totalVotes) * 100
      return new Percent(votes.find((vote) => vote.label === "Against")?.count.toString() || "0", totalVotes.toString());
    }, [totalVotes]);
    const abstainPercentage = useMemo(() => {
      // (abstain.count() / totalVotes) * 100
      return new Percent(votes.find((vote) => vote.label === "Abstain")?.count.toString() || "0", totalVotes.toString());
    }, [totalVotes]);
    const forCount = votes.find((vote) => vote.label === "For")?.count.toString() || "0";
    const againstCount = votes.find((vote) => vote.label === "Against")?.count.toString() || "0";
    const abstainCount = votes.find((vote) => vote.label === "Abstain")?.count.toString() || "0";

    return (
      <div className="flex flex-col sm:flex-row gap-4 px-2 mb-4">
        <div className="flex flex-col w-full gap-2">
          <h2 className="text-2xl font-bold">For</h2>
          <progress className="progress progress-success w-full" value={forPercentage.toSignificant(2)} max="100"></progress>
          <span className="text-sm text-muted w-full text-end">{abbreviatedNumber(
            Number(ethers.utils.formatEther(forCount).toString()))}
          </span>
        </div>
        <div className="flex flex-col w-full gap-2">
          <h2 className="text-2xl font-bold">Against</h2>
          <progress className="progress progress-error w-full" value={againstPercentage.toSignificant(2)} max="100"></progress>
          <span className="text-sm text-muted w-full text-end">{abbreviatedNumber(
            Number(ethers.utils.formatEther(againstCount).toString()))}
          </span>
        </div>
        <div className="flex flex-col w-full gap-2">
          <h2 className="text-2xl font-bold">Abstain</h2>
          <progress className="progress progress-neutral w-full" value={abstainPercentage.toSignificant(2)} max="100"></progress>
          <span className="text-sm text-muted w-full text-end">{abbreviatedNumber(
            Number(ethers.utils.formatEther(abstainCount).toString()))}
          </span>
        </div>
      </div>
    )
  };

  const CastVoteModal: FC<{ vote: VoteType }> = ({ vote }) => {
    const Icon: FC = () => {
      switch (vote) {
        case VoteType.For:
          return <CheckIcon className="w-5 h-5 stroke-2" />;
        case VoteType.Against:
          return <XMarkIcon className="w-5 h-5 stroke-2" />;
        case VoteType.Abstain:
          return <HandRaisedIcon className="w-5 h-5 stroke-2" />;
        default:
          return <></>;
      }
    };
    const btnClass = useMemo(() => {
      switch (vote) {
        case VoteType.For:
          return "thirdweb-btn-success-lg";
        case VoteType.Against:
          return "thirdweb-btn-error-lg";
        default:
          return "thirdweb-btn-lg-normal";
      }
    }, [vote]);
    const [reason, setReason] = useState<string>("");

    const castVote = async () => {
      if (!voteContract) return;
      try {
        await voteContract.vote(proposalId, vote, reason);
        popNotification({
          title: "Vote Cast",
          description: `Your vote of "${VoteType[vote]}" has been cast`,
          type: "success",
        });
      } catch (e) {
        const error = e as TransactionError;
        popNotification({
          title: "Vote Failed",
          description: "Could not submit your vote. " + error.reason || error.message,
          type: "error",
        });
      } finally {
        void getProposal();
        void getVotes();
        void checkHasVoted();
        setReason("");
        // close modal
        const modal = document.getElementById(`cast_vote_modal_${VoteType[vote]}`) as HTMLInputElement;
        modal.checked = false;
      }
    };

    return (
      <>
        <label htmlFor={`cast_vote_modal_${VoteType[vote]}`} className={`btn ${btnClass}`}>
          <Icon /> {VoteType[vote]}
        </label>
        <Portal>
          <input type="checkbox" id={`cast_vote_modal_${VoteType[vote]}`} className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-2xl">{VoteType[vote]}</h3>
              <p className="py-4">Optionally include a reason for your vote</p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason</span>
                </label>
                <textarea className="textarea h-24 textarea-bordered" placeholder="Reason for your vote" />
              </div>
              <div className="modal-action">
                <label htmlFor={`cast_vote_modal_${VoteType[vote]}`} className="btn btn-lg">
                  Cancel
                </label>
                <Web3Button
                  className={`btn ${btnClass}`}
                  action={async () => await castVote()} 
                  contractAddress={VOTING_CONTRACT[VOTING_CHAIN.slug] as string}
                >
                  <Icon />
                  Vote {VoteType[vote]}
                </Web3Button>
              </div>
            </div>
          </div>
        </Portal>
      </>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col gap-2 justify-center max-w-2xl mx-auto px-2">
        <Link
          href="/vote"
          className="btn btn-ghost w-fit"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 stroke-2" />
          Back to All Proposals
        </Link>
        <div className="my-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-5xl font-bold">Vote</h1>
            <div className="w-72 h-4 rounded-lg bg-base-200 animate-pulse" />
          </div>
          <div className="w-32 h-8 rounded-lg bg-base-200 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center mb-8">
            <div className="flex flex-col gap-2 w-full">
              <div className="w-36 h-8 rounded-lg bg-base-200 animate-pulse" />
              <div className="w-full h-4 rounded-lg bg-base-200 animate-pulse" />
              <div className="flex w-full justify-end">
                <div className="w-10 h-4 rounded-lg bg-base-200 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="w-36 h-8 rounded-lg bg-base-200 animate-pulse" />
              <div className="w-full h-4 rounded-lg bg-base-200 animate-pulse" />
              <div className="flex w-full justify-end">
                <div className="w-10 h-4 rounded-lg bg-base-200 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="w-36 h-8 rounded-lg bg-base-200 animate-pulse" />
              <div className="w-full h-4 rounded-lg bg-base-200 animate-pulse" />
              <div className="flex w-full justify-end">
                <div className="w-10 h-4 rounded-lg bg-base-200 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="w-64 h-16 mb-8 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-96 h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-full h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-full h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-3/4 h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="my-4" />
          <div className="w-72 h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-full h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-3/4 h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="w-5/6 h-6 rounded-lg bg-base-200 animate-pulse" />
          <div className="my-4" />
          <div className="flex justify-center gap-8">
            <div className="w-24 h-12 rounded-lg bg-base-200 animate-pulse" />
            <div className="w-32 h-12 rounded-lg bg-base-200 animate-pulse" />
            <div className="w-48 h-12 rounded-lg bg-base-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-2 justify-center max-w-2xl mx-auto px-2">
      <Link
        href="/vote"
        className="btn btn-ghost w-fit"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2 stroke-2" />
        Back to All Proposals
      </Link>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1 my-4">
          <h1 className="text-5xl font-bold">Vote</h1>
          <div className="text-muted text-sm">
            Deadline&nbsp;
            <VoteDeadline 
              proposal={proposal} 
              onDeadlinePast={() => void setDeadlinePast(true)}
              type={"date"} 
              dateOptions={{
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZoneName: "short",
              }}
            />
          </div>
        </div>
        <div className={`badge badge-lg badge-${stateColor(proposal.state)}`}>
          {ProposalState[proposal.state]}
        </div>
      </div>
      <Delegation message="You must Delegate your tokens before you can vote on proposals" />
      <Results />
      <div className="mx-auto">
        <ReactMarkdown className="prose">
          {proposal.description}
        </ReactMarkdown>
      </div>

      <div className="flex w-full flex-col gap-4 my-4">
        <VoteExecutions proposal={proposal} />
        <ExecuteVote 
          proposal={proposal} 
          contract={voteContract}
          onExecution={() => {
            void getProposal();
            void getVotes();
          }}
        />
      </div>

      {!deadlinePast && !hasVoted && (
        <div className="flex gap-8 justify-center w-full mt-8">
          <CastVoteModal vote={VoteType.For} />
          <CastVoteModal vote={VoteType.Against} />
          <CastVoteModal vote={VoteType.Abstain} />
        </div>
      )}
    </div>
  )

}

export default ProposalPage;