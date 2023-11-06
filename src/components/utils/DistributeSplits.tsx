import { useContract,useTokenBalance, Web3Button } from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS, type Split, type TransactionError } from "@thirdweb-dev/sdk";
import { Token } from "@uniswap/sdk";
import { type FC, useContext,useState } from "react";

import TokenPicker from "~/components/utils/TokenPicker";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import { formattedPrice } from "~/helpers/formattedPrice";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";

interface Props {
  splitterAddress: string;
}

export const DistributeSplits: FC<Props> = ({ splitterAddress }) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const isDarkTheme = useIsDarkTheme();
  const { popNotification } = useContext(NotificationContext);
  const [distributionToken, setDistributionToken] = useState<Token>(new Token(
    activeChainData.chainId,
    NATIVE_TOKEN_ADDRESS,
    activeChainData.nativeCurrency.decimals,
    activeChainData.nativeCurrency.symbol,
    activeChainData.nativeCurrency.name,
  ));
  const { contract: distributionTokenContract } = useContract(distributionToken.address, "token");
  const [distributionIsLoading, setDistributionIsLoading] = useState<boolean>(false);
  const { data: tokenBalance } = useTokenBalance(
    distributionTokenContract,
    splitterAddress,
  );

  return (
    <div className="flex justify-end items-center gap-4">
      <TokenPicker 
        id="distribute-royalties-token-picker"
        selectedToken={distributionToken} 
        callback={(selectedToken) => setDistributionToken(selectedToken)}
        chain={activeChainData}
        displayedWalletBalance={splitterAddress}
      />
      <Web3Button
        type="button"
        theme={isDarkTheme ? "dark" : "light"}
        className={"thirdweb-btn-primary"}
        contractAddress={splitterAddress}
        action={async (contract) => {
          setDistributionIsLoading(true);
          const splitContract = contract as unknown as Split;
          try {
            if (distributionToken.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
              await splitContract.distribute();
            } else {
              await splitContract.distributeToken(distributionToken.address);
            }
            popNotification({
              title: "Success",
              description: "You successfully distributed royalties.",
              type: "success",
            });
          } catch (e) {
            console.error({e});
            const txError = e as TransactionError;
            popNotification({
              title: "Error",
              description: txError.reason || txError.message || "An error occurred",
              type: "error",
            });
          } finally {
            setDistributionIsLoading(false);
          }
        }}
      >
        {distributionIsLoading ? <span className="loading loading-spinner loading-sm"></span> : null}
        Distribute ({formattedPrice(tokenBalance)} {distributionToken.symbol})
      </Web3Button>
    </div>
  )
}

export default DistributeSplits;