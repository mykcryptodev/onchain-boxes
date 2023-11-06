import { type Chain } from "@thirdweb-dev/chains";
import { NATIVE_TOKEN_ADDRESS, type NFT,type Transaction, type TransactionError, type TransactionResultWithId } from "@thirdweb-dev/sdk";
import { type Fraction, Token, TokenAmount } from "@uniswap/sdk";
import { type ethers } from "ethers";
import { useEffect, useState } from "react";

import useEtherPrice from "~/hooks/useEtherPrice";

type Gas = {
  ether: TokenAmount;
  usd: Fraction;
}

type PreparedTx = Transaction | 
  Transaction<TransactionResultWithId<NFT>[]> | 
  Transaction<Omit<{ receipt: ethers.providers.TransactionReceipt; data: () => Promise<unknown>; }, "data">> | 
  undefined |
  null;

const useEstimatedGas = (preparedTx: PreparedTx, chain: Chain) => {
  const etherPrice = useEtherPrice(chain);
  const [gas, setGas] = useState<Gas>();
  const [error, setError] = useState<TransactionError>();

  useEffect(() => {
    if (!preparedTx || !chain) return;
    setError(undefined);
    const estimateGas = async () => {
      try {
        const gas = await preparedTx.estimateGasCost();
        const gasAmount = new TokenAmount(new Token(
          chain.chainId,
          NATIVE_TOKEN_ADDRESS,
          18,
          chain.nativeCurrency.symbol,
          chain.nativeCurrency.name
        ), gas.wei.toString());
  
        setGas({
          ether: gasAmount,
          usd: gasAmount.multiply(etherPrice),
        });
      } catch (e) {
        setError(e as TransactionError);
      }
    };
    void estimateGas();
  }, [preparedTx, chain, etherPrice]);

  return { gas, error };
};

export default useEstimatedGas;