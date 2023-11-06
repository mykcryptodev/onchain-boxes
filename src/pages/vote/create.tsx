import { ArrowLeftIcon, QuestionMarkCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { NATIVE_TOKEN_ADDRESS, type ProposalExecutable, ThirdwebSDK, type TransactionError,useAddress,useContract,useSigner,Web3Button } from "@thirdweb-dev/react";
import { Token } from "@uniswap/sdk";
import { type BigNumber,ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

import TokenPicker from "~/components/utils/TokenPicker";
import Delegation from "~/components/Vote/Delegation";
import { GOVERNANCE_TOKEN, VOTING_CONTRACT } from "~/constants/addresses";
import { VOTING_CHAIN } from "~/constants/chain";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";

interface FormInput {
  description: string;
}

type ContractInteraction = {
  type: "contract interaction";
  contractAddress: string;
  functionName: string;
  args: Array<string | number | BigNumber>;
  nativeTokenValue: number;
}

type TokenTransfer = {
  type: "token transfer";
  token: Token;
  tokenAmount: string;
  toAddress: string;
}

type NativeTransfer = {
  type: "native transfer";
  nativeTokenValue: number;
  toAddress: string;
}

export const CreateVote: NextPage = () => {
  const address = useAddress();
  const signer = useSigner();
  const router = useRouter();
  const { popNotification } = useContext(NotificationContext);
  const { updateActiveChain } = useContext(ActiveChainContext);
  useEffect(() => {
    void updateActiveChain(VOTING_CHAIN.slug);
  }, [updateActiveChain]);
  
  const { register, watch } = useForm<FormInput>({
    defaultValues: {
      description: "",
    },
  });
  const description = watch("description");
  const nativeToken = useCallback(() => new Token(
    VOTING_CHAIN.chainId as number,
    NATIVE_TOKEN_ADDRESS,
    VOTING_CHAIN.nativeCurrency.decimals,
    VOTING_CHAIN.nativeCurrency.symbol,
    VOTING_CHAIN.nativeCurrency.name,
  ), []);
  const [governanceToken, setGovernanceToken] = useState<Token>();
  const { contract: governanceTokenContract } = useContract(GOVERNANCE_TOKEN[VOTING_CHAIN.slug] as string, "token");
  useEffect(() => {
    if (governanceTokenContract && !governanceToken) {
      void (async () => {
        const data = await governanceTokenContract.get();
        setGovernanceToken(new Token(
          VOTING_CHAIN.chainId as number,
          GOVERNANCE_TOKEN[VOTING_CHAIN.slug] as string,
          data.decimals,
          data.symbol,
          data.name,
        ));
      })();
    }
  }, [governanceToken, governanceTokenContract, nativeToken]);
  
  const [executions, setExecutions] = useState<Array<TokenTransfer | NativeTransfer | ContractInteraction>>([]);
  const [proposalExecutables, setProposalExecutables] = useState<Array<ProposalExecutable>>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);

  useEffect(() => {
    if (executions.length) {
      void (async () => {
        const executables = await Promise.all(executions.map(async (execution) => {
          const sdk = new ThirdwebSDK(VOTING_CHAIN.slug);
          if (execution.type === "native transfer") {
            return {
              toAddress: execution.toAddress,
              nativeTokenValue: ethers.utils.parseUnits(execution.nativeTokenValue?.toString() || "0", VOTING_CHAIN.nativeCurrency.decimals).toString(),
              transactionData: "0x",
            } as ProposalExecutable;
          }

          if (execution.type === "token transfer") {
            // if the token address is not an address, return
            if (isAddress(execution.token?.address || "")) {            
              const contract = await sdk.getContract(execution.token.address || "");
              return {
                toAddress: execution.token.address,
                nativeTokenValue: "0",
                transactionData: contract.encoder.encode(
                  "transfer",
                  [execution.toAddress || address || ethers.constants.AddressZero, ethers.utils.parseUnits(
                    execution.tokenAmount || "0",
                    execution.token.decimals || 18
                  ) || "0"],
                ),
              } as ProposalExecutable;
            }
          }
          if (execution.type === "contract interaction") {
            // if the contract address is not an address, return
            if (isAddress(execution.contractAddress)) {
              const contract = await sdk.getContract(execution.contractAddress || "");
              const args = execution.args.map(arg => {
                // if arg starts with [ and ends with ], the arg should be treated as an array
                if (arg?.toString().startsWith("[") && arg?.toString().endsWith("]")) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  return JSON.parse(arg.toString());
                }
                return arg;
              });
              return {
                toAddress: execution.contractAddress,
                nativeTokenValue: ethers.utils.parseUnits(
                  execution.nativeTokenValue?.toString() || "0", 
                  VOTING_CHAIN.nativeCurrency.decimals
                ).toString(),
                transactionData: contract.encoder.encode(
                  execution.functionName,
                  args || []
                ),
              } as ProposalExecutable;
            }
          }
        }));
        const nonUndefinedExecutables = executables?.filter((executable) => {
          if (executable !== undefined) {
            const e = executable;
            return e;
          }
        }) || []
        setProposalExecutables(nonUndefinedExecutables as ProposalExecutable[]);
      })();
    }
  }, [address, executions]);

  const createProposal = async () => {
    if (!signer) {
      popNotification({
        title: "Error",
        description: "Please connect your wallet",
        type: "error",
      });
      return;
    }
    try {
      const sdk = ThirdwebSDK.fromSigner(signer, VOTING_CHAIN, {
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
      });
      const voteContract = await sdk.getContract(VOTING_CONTRACT[VOTING_CHAIN.slug] as string, "vote");
      const tx = await voteContract.propose(description, proposalExecutables);
      popNotification({
        title: "Success",
        description: "Your proposal has been created",
        type: "success",
      });
      void router.push(`/vote/${tx.id.toString()}`);
    } catch (e) {
      const error = e as TransactionError;
      popNotification({
        title: "Error",
        description: "Your proposal has not been created. " + (error.reason || error.message),
        type: "error",
      });
    }
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
      <div className="text-5xl font-bold my-4">Create Proposal</div>
      <Delegation message="You must Delegate your tokens before creating proposals" />
      <div className="flex flex-col gap-2">
        <div className="form-control">
          <div className="text-3xl font-bold my-4">Description</div>
          <label className="label">
            <span className="label-text text-lg">Proposal Description</span>
            <span>
              <div className="tabs tabs-boxed">
                <a 
                  className={`tab ${!isPreview ? 'tab-active' : ''}`}
                  onClick={() => setIsPreview(false)}
                >
                  Edit
                </a> 
                <a 
                  className={`tab ${isPreview ? 'tab-active' : ''}`}
                  onClick={() => setIsPreview(true)}
                >
                  Preview
                </a> 
              </div>
            </span>
          </label>
          {isPreview ? (
            <ReactMarkdown className="prose max-h-52 w-full p-4 text-ellipsis overflow-scroll border rounded-lg">
              {description}
            </ReactMarkdown>
          ) : (
            <textarea
              rows={5}
              placeholder="A description about why you are proposing this vote"
              className="textarea textarea-lg textarea-bordered w-full"
              {...register("description")}
            />
          )}
          <label className="label">
            <span></span>
            <span className="label-text-alt flex gap-2">
              Supports Markdown
              <Link href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax">
                <QuestionMarkCircleIcon className="w-4 h-4 stroke-2 opacity-80" />
              </Link>
            </span>
          </label>
        </div>
        <div className="form-control w-full">
          <div className="text-3xl font-bold my-4">Set Execution Transactions</div>
          <div className="flex flex-col gap-2">
            {executions.map((execution, index) => (
              <div className="collapse collapse-arrow bg-base-200" key={index}>
                <input type="checkbox" className="peer" /> 
                <div className="collapse-title font-bold text-lg flex items-center">
                  <span>Execution {index + 1}</span>
                  <button
                    className="btn btn-ghost btn-sm ml-auto z-10"
                    onClick={() => {
                      const newExecutions = [...executions];
                      newExecutions.splice(index, 1);
                      setExecutions(newExecutions);
                    }}
                  >
                    <TrashIcon className="w-6 h-6 stroke-2" />
                  </button>
                </div>
                <div className="collapse-content"> 
                  <div className="flex flex-col gap-2" key={index}>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-lg">Execution Type</span>
                      </label>
                      <select
                        className="select select-bordered select-lg w-full"
                        value={execution.type}
                        onChange={(e) => {
                          const newExecutions = [...executions];
                          if (!newExecutions[index] || newExecutions[index] === undefined) return;
                          // loop over the newExecutions array and update the type at the current index
                          newExecutions.map((execution, i) => {
                            if (i !== index) return execution;
                            execution.type = e.target.value as "token transfer" | "contract interaction" | "native transfer";
                            return execution;
                          });
                          setExecutions(newExecutions);
                        }}
                      >
                        <option value="token transfer">Token Transfer</option>
                        <option value="contract interaction">Contract Interaction</option>
                        <option value="native transfer">Native Transfer</option>
                      </select>
                    </div>
                    {execution.type === "contract interaction" && (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text text-lg">Contract Address</span>
                            <span></span>
                          </label>
                          <input
                            placeholder="The address of the contract to execute"
                            className="input input-lg input-bordered w-full"
                            value={execution.contractAddress}
                            onChange={(e) => {
                              const newExecutions = [...executions];
                              (newExecutions[index] as ContractInteraction).contractAddress = e.target.value;
                              setExecutions(newExecutions);
                            }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text text-lg">Function Name</span>
                          </label>
                          <input
                            placeholder="The name of the function to execute"
                            className="input input-lg input-bordered w-full"
                            value={execution.functionName}
                            onChange={(e) => {
                              const newExecutions = [...executions];
                              (newExecutions[index] as ContractInteraction).functionName = e.target.value;
                              setExecutions(newExecutions);
                            }}
                          />
                        </div>
                      </>
                    )}
                    {execution.type !== "token transfer" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-lg">Native Token Value</span>
                        </label>
                        <input
                          type="number"
                          placeholder="The amount of native tokens to send"
                          className="input input-lg input-bordered w-full"
                          value={execution.nativeTokenValue}
                          onChange={(e) => {
                            const newExecutions = [...executions];
                            (newExecutions[index] as ContractInteraction | NativeTransfer).nativeTokenValue = Number(e.target.value);
                            setExecutions(newExecutions);
                          }}
                        />
                      </div>
                    )}
                    {execution.type === "token transfer" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-lg">Amount</span>
                        </label>
                        <div className="relative rounded-sm shadow-sm">
                          <div className="absolute inset-y-0 ml-3 flex items-center">
                          {governanceToken && (
                            <TokenPicker 
                              selectedToken={governanceToken} 
                              chain={VOTING_CHAIN} 
                              id="create-vote"
                              callback={(token) => {
                                const newExecutions = [...executions];
                                (newExecutions[index] as TokenTransfer).token = token || {};
                                setExecutions(newExecutions);
                              }}
                            />
                          )}
                          </div>
                          <input
                            type="number"
                            className="input input-lg input-bordered text-right w-full"
                            placeholder="Enter amount"
                            min="0"
                            step={ethers.utils.formatUnits(
                              "1", 
                              (executions[index] as TokenTransfer).token?.decimals || 18
                            ).toString()}
                            value={execution.tokenAmount}
                            onChange={(e) => {
                              const newExecutions = [...executions];
                              if (!newExecutions[index]) return;
                              (newExecutions[index] as TokenTransfer).tokenAmount = e.target.value;
                              setExecutions(newExecutions);
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {execution.type !== "contract interaction" && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-lg">To Address</span>
                        </label>
                        <input
                          placeholder="The address of the recipient"
                          className="input input-lg input-bordered w-full"
                          value={execution.toAddress}
                          onChange={(e) => {
                            const newExecutions = [...executions];
                            (newExecutions[index] as TokenTransfer | NativeTransfer).toAddress = e.target.value;
                            setExecutions(newExecutions);
                          }}
                        />
                      </div>
                    )}
                    {/* Allow the user to add arguements in an input with a button that will create a blank argument */}
                    {execution.type === "contract interaction" && execution.args?.map((arg, argIndex) => (
                      <div className="form-control" key={argIndex}>
                        <label className="label">
                          <span className="label-text text-lg">Argument {argIndex + 1}</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            placeholder="The argument to pass to the function"
                            className="input input-lg input-bordered w-full"
                            value={arg.toString()}
                            onChange={(e) => {
                              const newExecutions = [...executions];
                              (newExecutions?.[index] as ContractInteraction).args[argIndex] = e.target.value;
                              setExecutions(newExecutions);
                            }}
                          />
                          <button 
                            className="btn btn-lg btn-ghost"
                            onClick={() => {
                              const newExecutions = [...executions];
                              (newExecutions?.[index] as ContractInteraction)?.args.splice(argIndex, 1);
                              setExecutions(newExecutions);
                            }}
                          >
                            <TrashIcon className="w-6 h-6 stroke-2" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {execution.type === "contract interaction" && (
                      <button
                        className="btn my-4"
                        onClick={() => {
                          const newExecutions = [...executions];
                          if (!(newExecutions[index] as ContractInteraction).args) {
                            (newExecutions[index] as ContractInteraction).args = [];
                          }
                          (newExecutions[index] as ContractInteraction).args.push("");
                          setExecutions(newExecutions);
                        }}
                      >
                        Add Argument
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn my-4"
            onClick={() => {
              setExecutions([...executions, {
                type: "token transfer",
                token: governanceToken,
                toAddress: "",
              } as TokenTransfer]);
            }}
          >
            Add Execution
          </button>
        </div>
        <Web3Button
          className="thirdweb-btn-primary-lg" 
          contractAddress={VOTING_CONTRACT[VOTING_CHAIN.slug] as string}
          action={async () => {
            await createProposal();
          }}
        >
          Create Proposal
        </Web3Button>
      </div>
    </div>
  );
}

export default CreateVote;