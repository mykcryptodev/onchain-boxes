import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type Chain } from "@thirdweb-dev/chains";
import { MediaRenderer, NATIVE_TOKEN_ADDRESS, useAddress, useContract } from "@thirdweb-dev/react";
import { Token, TokenAmount } from "@uniswap/sdk";
import { isAddress } from "ethers/lib/utils";
import Image from "next/image";
import { type FC, useCallback,useContext,useEffect, useMemo, useState } from "react";

import { Portal } from "~/components/utils/Portal";
import { DEFAULT_CHAIN } from "~/constants/chain";
import coingeckoTokenListJson from "~/constants/tokenLists/coingecko.json";
import NotificationContext from "~/context/Notification";
import useTokenLogo from "~/hooks/useTokenLogo";
import { type TokenList, type TokenListToken } from "~/types/tokenList";

const coingeckoTokenList: TokenList = coingeckoTokenListJson;

interface TokenPickerProps {
  selectedToken: Token;
  callback: (token: Token) => void;
  disabled?: boolean;
  id: string;
  chain: Chain;
  className?: string;
  displayedWalletBalance?: string; // if passed in, token balances of this address will be displayed
}
const COINGECKO_UNKNOWN_IMG = 'https://static.coingecko.com/s/missing_thumb_2x-38c6e63b2e37f3b16510adf55368db6d8d8e6385629f6e9d41557762b25a6eeb.png';

export const TokenPicker: FC<TokenPickerProps> = ({ selectedToken, callback, disabled, id, chain, displayedWalletBalance, className }) => {
  const { popNotification } = useContext(NotificationContext);
  const address = useAddress();
  // if we were passed a displayedWalletBalance, use that otherwise use the connected wallet
  const balanceAddress = useMemo(() => {
    if (displayedWalletBalance) return displayedWalletBalance;
    return address;
  }, [address, displayedWalletBalance]);
  const [query, setQuery] = useState<string>('');
  const [fetchedToken, setFetchedToken] = useState<TokenListToken | undefined>(undefined);
  const [fetchedTokenIsLoading, setFetchedTokenIsLoading] = useState<boolean>(false);
  const imgUrl = useTokenLogo(selectedToken, chain);

  const selectToken = (token: Token) => {
    callback(new Token(
      chain.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name
    ));
    document.getElementById(`token-picker-modal-${id}`)?.click();
  };

  const fetchTokenAddress = useMemo(() => {
    if (isAddress(query)) return query;
  }, [query]);

  useEffect(() => {
    // immediately set loading to true if the query is an address
    // other functions will fetch the token by the address and 
    // set the loading to false when the token is fetched
    if (isAddress(query)) {
      setFetchedTokenIsLoading(true);
      setFetchedToken(undefined);
    }
  }, [query]);

  const { contract: fetchedTokenContract } = useContract(fetchTokenAddress, 'token');
  const fetchTokenValues = useCallback(async () => {
    if (!fetchedTokenContract) return;
    setFetchedTokenIsLoading(true);
    try {
      const tokenValues = await fetchedTokenContract.get();
      setFetchedToken({
        name: tokenValues.name,
        address: fetchedTokenContract.getAddress(),
        symbol: tokenValues.symbol,
        decimals: tokenValues.decimals,
        logoURI: undefined,
        chainId: chain.chainId,
      });
      setFetchedTokenIsLoading(false);
    } catch (e) {
      const error = e as Error;
      popNotification({
        title: "Error fetching token",
        description: error.message,
        type: "error",
      })
    }
  }, [chain.chainId, fetchedTokenContract, popNotification]);

  useEffect(() => {
    if (fetchedTokenContract) {
      void fetchTokenValues();
    }
  }, [chain.chainId, fetchTokenValues, fetchedTokenContract]);

  const featuredCurrencies = [
    new Token(
      chain.chainId,
      NATIVE_TOKEN_ADDRESS,
      chain.nativeCurrency?.decimals || DEFAULT_CHAIN.nativeCurrency.decimals,
      chain.nativeCurrency?.symbol || DEFAULT_CHAIN.nativeCurrency.symbol,
      chain.nativeCurrency?.name || DEFAULT_CHAIN.nativeCurrency.name,
    ),
    new Token(
      1,
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      18,
      'LINK',
      'Chainlink',
    ),
    new Token(
      1,
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      18,
      'UNI',
      'Uniswap',
    ),
    new Token(
      5,
      '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      18,
      'WETH',
      'Wrapped Ether',
    ),
  ];

  interface UserTokenBalanceProps {
    tokenAddress: string;
  }
  const UserTokenBalance: FC<UserTokenBalanceProps> = ({ tokenAddress }) => {
    const { contract } = useContract(tokenAddress, 'token');
    const [tokenBalance, setTokenBalance] = useState<TokenAmount | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fetchBalance = useCallback(async () => {
      if (!contract) return;
      setIsLoading(true);
      try {
        const balance = await contract.balanceOf(balanceAddress || "");
        setTokenBalance(new TokenAmount(
          new Token(
            chain.chainId,
            tokenAddress,
            balance?.decimals || 18,
            balance?.symbol || "",
            balance?.name || "",
          ),
          balance?.value.toString() || "0",
        ));
      } catch (e) {
        console.error(e);
        setTokenBalance(undefined);
      }
      setIsLoading(false);
    }, [contract, tokenAddress]);

    useEffect(() => {
      if (contract) {
        void fetchBalance();
      }
    }, [contract, fetchBalance]);

    if (isLoading) return (
      <div className="h-4 w-24 bg-base-200 animate-pulse rounded-lg" />
    )

    if (!tokenBalance) return null;

    return (
      <div className="text-sm">{tokenBalance.toSignificant(tokenBalance.token.decimals, { groupSeparator: "," })}</div>
    )
  }

  interface TokenOptionProps {
    token: TokenListToken | undefined;
  }
  const TokenOption: FC<TokenOptionProps> = ({ token }) => {
    if (!token) return null;
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <Image
            src={token.logoURI || COINGECKO_UNKNOWN_IMG}
            height={20}
            width={20}
            alt={token.name}
          />
          <div className="ml-2 flex flex-col">
            <div>{token.symbol}</div>
            <div className="text-sm">{token.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <UserTokenBalance key={token.address} tokenAddress={token.address} />
          <button
            className="btn btn-primary"
            onClick={() => selectToken(new Token(
              token.chainId,
              token.address,
              token.decimals,
              token.symbol,
              token.name
            ))}
          >
            Select
          </button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={`${disabled ? '' : `token-picker-modal-${id}`}`}>
        <div className={`flex items-center cursor-pointer ${className || ""}`}>
          {imgUrl && !imgUrl.toString().startsWith("ipfs://") ? (
            <Image
              src={imgUrl}
              height={20}
              width={20}
              alt={`${selectedToken?.symbol || 'token'} logo`}
            />
          ) : (
            <div className="h-4 w-4">
              <MediaRenderer src={imgUrl.toString()} height="20" width="20" />
            </div>
          )}
          <span className="ml-2">{selectedToken.symbol}</span>
          {!disabled && (<ChevronDownIcon className="h-4 w-4 stroke-2" />)}
        </div>
      </label>

      <Portal>
        <input type="checkbox" id={`token-picker-modal-${id}`} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box h-96 relative">
            <label htmlFor={`token-picker-modal-${id}`} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
              <XMarkIcon className="h-4 w-4" />
            </label>
            <h3 className="font-bold text-lg">Select token</h3>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full my-4"
              placeholder="Search token"
            />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {featuredCurrencies.filter(t => t.chainId === chain.chainId).map((token) => (
                <button 
                  key={token.address} 
                  className={`btn ${token.address.toLowerCase() === selectedToken.address.toLowerCase() ? 'btn-primary' : 'btn-outline'} mb-4`}
                  onClick={() => selectToken(token)}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
            {coingeckoTokenList.tokens.filter(token => 
                token.chainId === chain.chainId && 
                token.address.toLowerCase() !== selectedToken.address.toLowerCase()
              )
              .filter(token => 
                token.symbol.toLowerCase().includes(query.toLowerCase()) || 
                token.name.toLowerCase().includes(query.toLowerCase()) || 
                token.address.toLowerCase().includes(query.toLowerCase())
              )            
              .slice(0, 10)
              .map((token) => (
                <TokenOption key={token.address} token={token} />
              ))
            }
            {fetchedTokenIsLoading ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="avatar w-5 h-5 bg-base-200 rounded-full animate-pulse" />
                  <div className="w-full ml-2 flex flex-col gap-2">
                    <div className="w-16 h-4 bg-base-200 animate-pulse rounded-lg" />
                    <div className="w-32 h-4 bg-base-200 animate-pulse rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-base-200 animate-pulse rounded-lg" />
                  <div className="h-12 w-24 bg-base-200 animate-pulse rounded-lg" />
                </div>
              </div>
            ) : (
              <TokenOption token={fetchedToken} />
            )}
          </div>
        </div>
      </Portal>
    </div>
  )
}

export default TokenPicker;