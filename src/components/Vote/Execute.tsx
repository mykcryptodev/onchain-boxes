import { type Proposal,ProposalState, type TransactionError,type Vote,Web3Button } from "@thirdweb-dev/react";
import { type FC,useContext } from "react";

import { VOTING_CONTRACT } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";
import NotificationContext from "~/context/Notification";

interface Props {
  proposal: Proposal;
  contract: Vote | undefined;
  onExecution: () => void;
}

export const ExecuteVote: FC<Props> = ({ proposal, contract, onExecution }) => {
  const { popNotification } = useContext(NotificationContext);
  if (!contract) return null;
  if (proposal.state !== ProposalState.Succeeded) return null;

  const executeVote = async () => {
    if (!contract) return;
    try {
      const tx = await contract.execute(proposal.proposalId.toString());
      popNotification({
        title: "Vote Executed",
        description: `The execution has been submitted to the blockchain`,
        type: "success",
        actions: [
          {
            label: `View on ${VOTING_CHAIN.explorers[0].name || ""}`,
            link: `${VOTING_CHAIN.explorers[0].url}/tx/${tx.receipt.transactionHash}`,
          },
        ],
      });
      void onExecution();
    } catch (e) {
      const error = e as TransactionError;
      popNotification({
        title: "Vote Execution Failed",
        description: "Could not execute your vote. " + error.reason || error.message,
        type: "error",
      });
    }
  };

  return (
    <Web3Button
      className="thirdweb-btn-primary"
      contractAddress={VOTING_CONTRACT[VOTING_CHAIN.slug] as string}
      action={async () => await executeVote()}
    >
      Execute
    </Web3Button>
  )
}

export default ExecuteVote;