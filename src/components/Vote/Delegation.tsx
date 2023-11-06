import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ThirdwebSDK,useAddress, useContract, useSigner, Web3Button } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { type FC, useCallback,useContext,useEffect, useState } from "react";

import { GOVERNANCE_TOKEN } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";
import NotificationContext from "~/context/Notification";
import useIsDarkTheme from "~/hooks/useIsDarkTheme";

interface Props {
  message?: string;
}

export const Delegation: FC<Props> = ({ message }) => {
  const address = useAddress();
  const signer = useSigner();
  const isDarkTheme = useIsDarkTheme();
  const { popNotification } = useContext(NotificationContext);

  const [delegate, setDelegate] = useState<string>();
  const { contract: governanceTokenContract } = useContract(GOVERNANCE_TOKEN[VOTING_CHAIN.slug] as string, "token");

  const getDelegation = useCallback(async () => {
    if (!governanceTokenContract || !address) return;
    const delegate = await governanceTokenContract.getDelegationOf(address);
    setDelegate(delegate);
  }, [governanceTokenContract, address]);

  useEffect(() => {
    if (governanceTokenContract) {
      void getDelegation();
    }
  });

  if (!delegate) return null;
  if (delegate === ethers.constants.AddressZero) return (
    <div className="my-2">
      <div className="alert items-start mb-4">
        <InformationCircleIcon className={`h-5 w-5 mt-1 stroke-2 ${isDarkTheme ? 'stroke-info' : 'fill-info'}`} />
        <div className="flex flex-col gap-2 w-full">
          <span className="font-bold">Delegate Tokens</span>
          <span className="text-sm">
            {message}
          </span>
          <div className="flex w-full justify-end">
            <Web3Button
              className="thirdweb-btn-primary"
              contractAddress={GOVERNANCE_TOKEN[VOTING_CHAIN.slug] as string}
              action={async (contract) => {
                if (!signer || !address) return;
                const sdk = ThirdwebSDK.fromSigner(signer, VOTING_CHAIN.slug, {
                  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
                });
                const tokenContract = await sdk.getContract(contract.getAddress(), "token");
                const tx = await tokenContract.delegateTo(address || "");
                popNotification({
                  title: "Delegation Transaction",
                  description: "Your delegation transaction has been submitted to the blockchain",
                  type: "success",
                  actions: [
                    {
                      label: `View on ${VOTING_CHAIN.explorers[0].name}`,
                      link: `${VOTING_CHAIN.explorers[0].url}/tx/${tx.receipt.transactionHash}`,
                    },
                  ]
                });

              }}
            >
              Delegate
            </Web3Button>
          </div>
        </div>
      </div>
    </div>
  );
  return null;
};

export default Delegation;