// import {
//   decodeResult,
//   FulfillmentCode,
//   ResponseListener,
//   ReturnType,
//   simulateScript,
//   SubscriptionManager,
// } from "@chainlink/functions-toolkit";
import { ThirdwebSDK, type TransactionResult } from "@thirdweb-dev/sdk";
import { ethers, type Signer } from "ethers";
import { z } from "zod";

import { oracleAbi } from "~/constants/abi/oracle";
import { CHAINLINK, CHAINLINK_ROUTER_ADDRESS, GAMESCORE_ORACLE_CONTRACT } from "~/constants/addresses";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "~/constants/chain";
import { CHAINLINK_DON_ID,CHAINLINK_SUBSCRIPTION_ID } from "~/constants/chainlink";
import { oracleSource } from "~/constants/source";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const scoreOracleRouter = createTRPCRouter({
  fetchScores: publicProcedure
  .input(z.object({
    gameId: z.string(),
    chainId: z.number(),
  }))
  .mutation(async ({ input }) => {
    const chain = SUPPORTED_CHAINS.find(c => c.chainId === input.chainId) ?? DEFAULT_CHAIN;
    const functionsConsumerAbi = oracleAbi;
    
    const consumerAddress = GAMESCORE_ORACLE_CONTRACT[chain.slug] as string; // REPLACE this with your Functions consumer address
    const subscriptionId = CHAINLINK_SUBSCRIPTION_ID[chain.slug] as number; // REPLACE this with your subscription ID
    
    // hardcoded for Polygon Mumbai
    const routerAddress = CHAINLINK_ROUTER_ADDRESS[chain.slug] as string;
    const linkTokenAddress = CHAINLINK[chain.slug] as string;
    const donId = CHAINLINK_DON_ID[chain.slug] as string;
    const explorerUrl = chain.explorers[0]?.url;
  
    // Initialize functions settings
    const source = oracleSource({ eventId: input.gameId });
  
    const args = [input.gameId];
    const gasLimit = 300000;
  
    // Initialize ethers signer and provider to interact with the contracts onchain
    const privateKey = process.env.GAMESCORE_ORACLE_ADMIN_PRIVATE_KEY; // fetch PRIVATE_KEY
    if (!privateKey)
      throw new Error(
        "private key not provided - check your environment variables"
      );
  
    const rpcUrl = chain?.rpc[0];
  
    if (!rpcUrl) {
      throw new Error(`rpcUrl not provided  - check your environment variables`);
    }

    const sdk = ThirdwebSDK.fromPrivateKey(privateKey, chain, {
      secretKey: process.env.THIRDWEB_SECRET_KEY
    });
    const provider = sdk.getProvider();
    const signer = sdk.getSigner() as Signer;
  
    /* COMMENT OUT SIMULATION FOR NOW 
    ///////// START SIMULATION ////////////
  
    console.log("Start simulation...");
  
    const response = await simulateScript({
      source: source,
      args: args,
      bytesArgs: [], // bytesArgs - arguments can be encoded off-chain to bytes.
      secrets: {}, // no secrets in this example
    });
  
    console.log("Simulation result", response);
    const errorString = response.errorString;
    if (errorString) {
      console.log(`❌ Error during simulation: `, errorString);
      throw new Error(errorString);
    } else {
      const returnType = ReturnType.string;
      const responseBytesHexstring = response.responseBytesHexstring;
      if (ethers.utils.arrayify(responseBytesHexstring as string).length > 0) {
        const decodedResponse = decodeResult(
          response.responseBytesHexstring as string,
          returnType
        );
        console.log(`✅ Decoded response to ${returnType}: `, decodedResponse);
      }
    }
  
    //////// ESTIMATE REQUEST COSTS ////////
    console.log("\nEstimate request costs...");
    try {
      // Initialize and return SubscriptionManager
      const subscriptionManager = new SubscriptionManager({
        signer: signer,
        linkTokenAddress: linkTokenAddress,
        functionsRouterAddress: routerAddress,
      });
      await subscriptionManager.initialize();
    
      // estimate costs in Juels
    
      const gasPriceWei = await signer.getGasPrice(); // get gasPrice in wei
    
      const estimatedCostInJuels =
        await subscriptionManager.estimateFunctionsRequestCost({
          donId: donId, // ID of the DON to which the Functions request will be sent
          subscriptionId: subscriptionId, // Subscription ID
          callbackGasLimit: gasLimit, // Total gas used by the consumer contract's callback
          gasPriceWei: BigInt(gasPriceWei.toString()), // Gas price in gWei
        });
    
      console.log(
        `Fulfillment cost estimated to ${ethers.utils.formatEther(
          estimatedCostInJuels.toString()
        )} LINK`
      );
    } catch (error) {
      console.error("Error estimating costs:", error);
    }
    */
    //////// MAKE REQUEST ////////
  
    console.log("\nMake request...");

    const functionsConsumer = new ethers.Contract(
      consumerAddress,
      functionsConsumerAbi,
      signer
    );
    
    // To simulate the call and get the requestId.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestId = await functionsConsumer?.callStatic?.fetchGameScores?.(
      source, // source
      args,
      subscriptionId,
      gasLimit,
      ethers.utils.formatBytes32String(donId), // jobId is bytes32 representation of donId
      args[0],
    ) as string;

    const contract = await sdk.getContract(consumerAddress);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const transaction = await contract.call("fetchGameScores", [
      source,
      args,
      subscriptionId,
      gasLimit,
      ethers.utils.formatBytes32String(donId),
      args[0],
    ], {
      gasPrice: await signer.getGasPrice(),
    }) as TransactionResult;
  
    // Actual transaction call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    // const transaction = await functionsConsumer?.fetchGameScores?.(
    //   source, // source
    //   args,
    //   subscriptionId,
    //   gasLimit,
    //   ethers.utils.formatBytes32String(donId), // jobId is bytes32 representation of donId
    //   args[0],
    // );
  
    // Log transaction details
    console.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      `\n✅ Functions request sent! Transaction hash ${transaction.receipt.transactionHash} -  Request id is ${requestId}. Waiting for a response...`
    );
  
    console.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      `See your request in the explorer ${explorerUrl}/tx/${transaction.receipt.transactionHash}`
    );
  
    /* COMMENT OUT LISTENER FOR NOW 
    const responseListener = new ResponseListener({
      provider: provider,
      functionsRouterAddress: routerAddress,
    }); // Instantiate a ResponseListener object to wait for fulfillment.

    try {
      type ListenerResponse = {
        requestId: string;
        responseBytesHexstring: string;
        errorString: string;
        fulfillmentCode: FulfillmentCode;
        totalCostInJuels: string;
      };
      const rawResponse = await new Promise((resolve, reject) => {
        responseListener
          .listenForResponse(requestId)
          .then((response) => {
            resolve(response); // Resolves once the request has been fulfilled.
          })
          .catch((error) => {
            reject(error); // Indicate that an error occurred while waiting for fulfillment.
          });
      });
      const response = rawResponse as ListenerResponse;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fulfillmentCode = response.fulfillmentCode;

      if (fulfillmentCode === FulfillmentCode.FULFILLED) {
        console.log(
          `\n✅ Request ${requestId} successfully fulfilled. Cost is ${ethers.utils.formatEther(
            response.totalCostInJuels
          )} LINK.Complete reponse: `,
          response
        );
      } else if (fulfillmentCode === FulfillmentCode.USER_CALLBACK_ERROR) {
        console.log(
          `\n⚠️ Request ${requestId} fulfilled. However, the consumer contract callback failed. Cost is ${ethers.utils.formatEther(
            response.totalCostInJuels
          )} LINK.Complete reponse: `,
          response
        );
      } else {
        console.log(
          `\n❌ Request ${requestId} not fulfilled. Code: ${fulfillmentCode}. Cost is ${ethers.utils.formatEther(
            response.totalCostInJuels
          )} LINK.Complete reponse: `,
          response
        );
      }

      const errorString = response.errorString;
      if (errorString) {
        console.log(`\n❌ Error during the execution: `, errorString);
      } else {
        const responseBytesHexstring = response.responseBytesHexstring;
        if (ethers.utils.arrayify(responseBytesHexstring).length > 0) {
          const decodedResponse = decodeResult(
            response.responseBytesHexstring,
            ReturnType.string
          );
          console.log(
            `\n✅ Decoded response to ${ReturnType.string}: `,
            decodedResponse
          );
          return decodedResponse;
        }
      }
    } catch (error) {
      console.error("Error listening for response:", error);
    }
    */
  }),
});