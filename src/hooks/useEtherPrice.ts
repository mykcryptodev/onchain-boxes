import { type Chain,Ethereum } from "@thirdweb-dev/chains";
import { NATIVE_TOKEN_ADDRESS, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Token, TokenAmount } from "@uniswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";

import aggregatorV3InterfaceABI from "~/constants/abi/priceFeed";

type PriceOracle = {
  [chainId: string]: string;
};

type PriceOracleResponse = {
  roundId: string;
  answer: string;
  startedAt: string;
  updatedAt: string;
}

const NATIVE_ASSET_PRICE_ORACLES: PriceOracle = {
  ['ethereum']: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH / USD
  ['goerli']: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH / USD
  ['sepolia']: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH / USD
  ['binance']: "0x14e613ac84a31f709eadbdf89c6cc390fdc9540a", // BNB / USD
  ['binance-testnet']: "0x14e613ac84a31f709eadbdf89c6cc390fdc9540a", // BNB / USD
  ['avalance']: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7", // AVAX / USD
  ['avalance-fuji']: "0xFF3EEb22B5E3dE6e705b44749C2559d704923FD7", // AVAX / USD
  ['cronos']: "0x00Cb80Cf097D9aA9A3779ad8EE7cF98437eaE050", // CRO / USD
  ['polygon']: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676", // MATIC / USD
  ['mumbai']: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676", // MATIC / USD
  ['base']: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419", // ETH / USD
  ['base-goerli']: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419", // ETH / USD
}

const useEtherPrice = (chain: Chain) => {
  const oracle = NATIVE_ASSET_PRICE_ORACLES[chain.slug] as string;
  const [decimals, setDecimals] = useState<number>(8);
  const usd = useMemo(() => {
    return new Token(
      chain.chainId, 
      NATIVE_TOKEN_ADDRESS,
      decimals,
      "USD",
      "US Dollar"
    );
  }, [chain, decimals]);
  const [price, setPrice] = useState<TokenAmount>(new TokenAmount(usd, "0"));

  const fetchPrice = useCallback(async () => {
    if (!oracle) return;
    // always get from the price oracles on ETH mainnet
    const sdk = new ThirdwebSDK(Ethereum);
    try {
      const priceOracle = await sdk.getContract(oracle, aggregatorV3InterfaceABI);
      const decimals = await priceOracle.call("decimals") as number;
      setDecimals(decimals);
      const priceOracleResponse = await priceOracle.call("latestRoundData") as PriceOracleResponse;
      setPrice(new TokenAmount(usd, priceOracleResponse?.answer?.toString() || '0'));
    } catch (e) {
      console.error(e);
    }
  }, [oracle, usd]);


  useEffect(() => {
    void fetchPrice();
  }, [chain, fetchPrice]);

  return price;
}

export default useEtherPrice;