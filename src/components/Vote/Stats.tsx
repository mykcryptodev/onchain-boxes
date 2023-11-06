import { NATIVE_TOKEN_ADDRESS, type Proposal, ProposalState,useContract, useSDK, useTokenBalance } from "@thirdweb-dev/react";
import { Token } from "@uniswap/sdk";
import { type FC, useEffect,useState } from "react";

import TokenPicker from "~/components/utils/TokenPicker";
import { VOTING_CONTRACT } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";

interface Props {
  proposals: Proposal[];
}

export const VotingStats: FC<Props> = ({ proposals }) => {
  const [currency, setCurrency] = useState<Token>(new Token(
    VOTING_CHAIN.chainId as number,
    NATIVE_TOKEN_ADDRESS,
    VOTING_CHAIN.nativeCurrency.decimals,
    VOTING_CHAIN.nativeCurrency.symbol,
    VOTING_CHAIN.nativeCurrency.name,
  ));
  const { contract: currencyContract } = useContract(currency.address);
  const { 
    data: treasuryCurrencyBalance,
    isLoading: isTreasuryCurrencyBalanceLoading,
  } = useTokenBalance(currencyContract, VOTING_CONTRACT[VOTING_CHAIN.slug] as string);
  const sdk = useSDK();
  const [nativeBalance, setNativeBalance] = useState<string | undefined>(undefined);
  const numActiveProposals = proposals?.filter((proposal) => proposal.state === ProposalState.Active).length || 0;

  useEffect(() => {
    if (currency.address.toLowerCase() === NATIVE_TOKEN_ADDRESS && sdk) {
      void sdk?.getBalance(VOTING_CONTRACT[VOTING_CHAIN.slug] as string).then((balance) => {
        setNativeBalance(balance.displayValue);
      });
    }
  }, [currency, sdk]);

  const TreasuryBalanceForCurrency: FC = () => {
    if (currency.address.toLowerCase() === NATIVE_TOKEN_ADDRESS) {
      return nativeBalance || "0";
    }
    if (isTreasuryCurrencyBalanceLoading) {
      return (
        <span className="h-6 w-32 bg-base-200 animate-pulse rounded-lg" />
      )
    }
    return treasuryCurrencyBalance?.displayValue || "0";
  }

  return (
    <div className="flex items-center gap-2">
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Treasury Funds</div>
          <div className="stat-value flex gap-2 items-center">
            <TokenPicker
              selectedToken={currency}
              callback={(selectedCurrency) => {
                setCurrency(selectedCurrency);
              }}
              chain={VOTING_CHAIN}
              id="treasury-funds"
              className="text-sm font-normal"
              displayedWalletBalance={VOTING_CONTRACT[VOTING_CHAIN.slug]}
            />
            <TreasuryBalanceForCurrency />
          </div>
          <div className="stat-desc">
            {currency.name}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Active Proposals</div>
          <div className="stat-value flex gap-2 items-center">
            {numActiveProposals}
          </div>
          <div className="stat-desc">
            out of {proposals?.length || 0} total proposals
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingStats;