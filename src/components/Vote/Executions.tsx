/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Abi,MediaRenderer,type Proposal,useContract,useSDK } from "@thirdweb-dev/react";
import { Token, TokenAmount } from "@uniswap/sdk";
import { BigNumber,ethers } from "ethers";
import { isAddress, keccak256 } from "ethers/lib/utils";
import Link from "next/link";
import { type FC, useCallback,useEffect, useState } from "react";

import Avatar from "~/components/Profile/Avatar";
import Name from "~/components/Profile/Name";
import TokenIcon from "~/components/utils/TokenIcon";
import { VOTING_CHAIN } from "~/constants/chain";

interface Props {
  proposal: Proposal;
}

type FunctionData = {
  name: string;
  inputs: {
    name: string;
    type: string;
  }[];
}

function getFunctionData(abi: Abi, signature: string): FunctionData | null {
  for (const item of abi) {
    if (item.type === "function") {
      const signatureString = `${item.name}(${item.inputs.map((input) => input.type).join(',')})`;
      const hash = keccak256(Buffer.from(signatureString));
      if (hash.slice(0, 8) === signature.slice(0, 8)) {
        return item;
      }
    }
  }
  return null;
}

export const VoteExecutions: FC<Props> = ({ proposal }) => {
  const sdk = useSDK();
  interface DecodedExecution {
    type: "token transfer" | "contract interaction" | "native transfer",
    toAddress: string,
    tokenAddress?: string,
    amount?: BigNumber,
    nativeTokenValue?: BigNumber,
    functionData?: FunctionData,
    args?: Array<{ [key: string]: string[] | string }>,
  }
  const [decodedExecutions, setDecodedExecutions] = useState<DecodedExecution[]>([]);
  const decodeExecutions = useCallback(async () => {
    if (!proposal.executions) return;
    const decodedExecutions = await Promise.all(proposal.executions.map(async (execution) => {
      // 1. Handle Native ETH transfer
      if (!execution.transactionData || execution.transactionData === '0x') {
        return {
          ...execution,
          type: "native transfer"
        } as DecodedExecution;
      }
      // 2. Handle ERC-20 transfer
      if (execution.transactionData.toString().startsWith('0xa9059cbb')) {
        const contract = await sdk?.getContract(execution.toAddress.toString());
        const functionSig = execution.transactionData?.toString().slice(0, 10);
        const decoded = contract?.encoder.decode(functionSig, execution.transactionData.toString());
        if (!decoded) return null;
        return {
          toAddress: decoded.to as string,
          amount: decoded.amount as BigNumber,
          tokenAddress: execution.toAddress,
          type: "token transfer",
        };
      }
      // 2. Handle contract interactions
      if (isAddress(execution.toAddress)) {
        const contract = await sdk?.getContract(execution.toAddress.toString());
        if (!contract) return;
        const functionSig = execution.transactionData?.toString().slice(0, 10);
        const functionData = getFunctionData(contract.abi, functionSig);
        const decoded = contract?.encoder.decode(functionSig, execution.transactionData.toString());
        // create an array of objects where there is a name for the input of functionData and the value from decoded
        const args = decoded.map((value, i) => {
          const key = `${functionData?.inputs[i]?.name || "Unknown Arg"}`;
          // if value is an array, turn it into an array of strings
          if (Array.isArray(value)) {
            const strings = value.map((v: { toString: () => unknown }) => {
              return v.toString()
            });
            // for each of the strings, if turning the string into a number is not NaN, turn it into a number
            const stringsAndNumbers = strings.map((s) => {
              if (!isNaN(Number(s))) {
                return Number(s);
              }
              return s;
            });
            return {
              [key]: stringsAndNumbers
            }
          }
          return {
            [key]: JSON.stringify(value)
          }
        })
        return {
          ...decoded,
          functionData,
          args,
          type: "contract interaction",
        };
      }
    }));
    setDecodedExecutions(decodedExecutions.filter(Boolean) as DecodedExecution[]);
  }, [proposal.executions, sdk]);

  useEffect(() => {
    void decodeExecutions();
  }, [decodeExecutions, proposal]);

  const TokenInfo: FC<{ 
    tokenAddress: string, 
    amount: BigNumber 
  }> = ({ tokenAddress, amount }) => {
    const { contract } = useContract(tokenAddress, "token");
    const [token, setToken] = useState<Token>();
    const [tokenAmount, setTokenAmount] = useState<TokenAmount>();

    const getToken = useCallback(async () => {
      const tokenData = await contract?.get();
      if (tokenData) {
        const t = new Token(
          VOTING_CHAIN.chainId as number,
          tokenAddress,
          tokenData.decimals,
          tokenData.symbol,
          tokenData.name
        );
        setToken(t);
        setTokenAmount(new TokenAmount(t, amount.toString()))
      }
    }, [amount, contract, tokenAddress]);
    useEffect(() => {
      void getToken();
    }, [getToken, tokenAddress]);

    if (token) {
      return (
        <div className="flex items-center gap-2">
          <TokenIcon token={token} />
          <span>{token.symbol}</span>
          <span>
            {tokenAmount?.toSignificant(token.decimals, {
              groupSeparator: ','
            })}
          </span>
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        {tokenAddress}
      </div>
    )
  }
  return (
    <div className="grid grid-flow-row gap-2">
      {decodedExecutions.map((execution, i) => {
        return (
          <div key={i} className="grid grid-cols-3 gap-2 overflow-x-auto">
            <span className="font-bold text-xl col-span-3 my-4">Transaction {i + 1}</span>
            <div className="flex flex-col gap-2">
              <span className="font-bold">Type</span>
              <span className="capitalize">{execution.type}</span>
            </div>
            {execution.type === "token transfer" && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-bold">Amount</span>
                  <TokenInfo tokenAddress={execution.tokenAddress || ""} amount={execution.amount || BigNumber.from('0')} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold">To</span>
                  <Link href={`/profile/${execution.toAddress}`} className="flex gap-2 items-center cursor-pointer">
                    <Avatar address={execution.toAddress} />
                    <Name address={execution.toAddress} />
                  </Link>
                </div>
              </>
            )}
            {execution.type === "native transfer" && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-bold">Amount</span>
                  <div className="flex gap-2 items-center">
                    <MediaRenderer
                      src={VOTING_CHAIN.icon.url || ""}
                      width="22px"
                      height="22px"
                      className="rounded-full"
                    />
                    <span>
                      {ethers.utils.formatEther(
                        execution.nativeTokenValue?.toString() || "0"
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold">To</span>
                  <Link href={`/profile/${execution.toAddress}`} className="flex gap-2 items-center cursor-pointer">
                    <Avatar address={execution.toAddress} />
                    <Name address={execution.toAddress} />
                  </Link>
                </div>
              </>
            )}
            {execution.type === "contract interaction" && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-bold">Function Name</span>
                  <span>{execution.functionData?.name}</span>
                </div>
                <div className="flex flex-col gap-2 col-span-3">
                  <span className="font-bold">Arguments</span>
                    {decodedExecutions.map((execution, i) => {
                      return (
                        <ul key={i} className="menu">
                          <li>
                            <ul>
                              {execution.args?.map((arg, i) => (
                                <li key={i}>
                                  {/* display the key of this arg object */}
                                  <span className="font-bold">{Object.keys(arg)[0]}</span>
                                  {/* display the value of this arg object */}
                                  <span>
                                    {
                                      // if the value is an array, display the array
                                      Array.isArray(Object.values(arg)[0]) ? (
                                        JSON.stringify(Object.values(arg)[0])
                                      ) : (
                                        // otherwise, display the value
                                        Object.values(arg)[0]
                                      )
                                    }
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        </ul>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default VoteExecutions;