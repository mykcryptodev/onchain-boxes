import { type Proposal, useSigner } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { type FC, useCallback, useEffect, useState } from "react";

interface Props {
  proposal: Proposal;
  type: "until" | "date";
  dateOptions: Intl.DateTimeFormatOptions;
  onDeadlinePast: () => void;
}

export const VoteDeadline: FC<Props> = ({ proposal, type, dateOptions, onDeadlinePast }) => {
  const signer = useSigner();
  const [deadlineDate, setDeadlineDate] = useState<Date>();
  const [deadlineUntilString, setDeadlineUntilString] = useState<string>("");

  const getBlockDeadline = useCallback(async () => {
    if (!signer) return;
    const currentBlockNumber = await signer.provider?.getBlockNumber();
    if (!currentBlockNumber) return;
    const currentBlock = await signer.provider?.getBlock(currentBlockNumber);
    if (!currentBlock) return;
    const tenBlockNumbersAgo = currentBlockNumber - 10;
    if (tenBlockNumbersAgo < 0) return;
    const tenBlocksAgo = await signer.provider?.getBlock(tenBlockNumbersAgo);
    if (!tenBlocksAgo) return;
    const averageTimePerBlock = (currentBlockNumber - tenBlockNumbersAgo) / (currentBlock.timestamp - tenBlocksAgo.timestamp);

    // if the current block is greater than the proposal end block, the proposal has ended
    if (currentBlockNumber > proposal.endBlock.toNumber()) {
      const endBlockTimestamp = await signer.provider?.getBlock(proposal.endBlock.toNumber());
      if (!endBlockTimestamp) return;
      setDeadlineDate(new Date(endBlockTimestamp.timestamp * 1000));
      setDeadlineUntilString("Ended");
      void onDeadlinePast();
      return;
    }

    // otherwise estimate the time in the future
    const blocksUntilDeadline = proposal.endBlock.sub(BigNumber.from(currentBlockNumber)).toNumber();
    const secondsUntilDeadline = blocksUntilDeadline / averageTimePerBlock;
    const minutesUntilDeadline = Math.floor(secondsUntilDeadline / 60);
    const hoursUntilDeadline = Math.floor(minutesUntilDeadline / 60);
    const daysUntilDeadline = Math.floor(hoursUntilDeadline / 24);
    
    setDeadlineDate(new Date(Date.now() + secondsUntilDeadline * 1000));
    setDeadlineUntilString(`${daysUntilDeadline} days, ${hoursUntilDeadline} hours, ${minutesUntilDeadline} minutes`);
  }, [onDeadlinePast, proposal.endBlock, signer]);

  useEffect(() => {
    if (!signer) return;
    void getBlockDeadline();
  }, [getBlockDeadline, signer]);

  if (type === "until") {
    return (
      <span>~ {deadlineUntilString}</span>
    )
  }

  if (type === "date") {
    return (
      <span>~ {deadlineDate?.toLocaleString([], dateOptions)}</span>
    )
  }

  return null;
}

export default VoteDeadline;