import { 
  Avalanche, 
  AvalancheFuji, 
  Base,
  BaseGoerli,
  Binance, 
  BinanceTestnet,
  Ethereum, 
  Goerli, 
  Mumbai,
  Polygon,
} from "@thirdweb-dev/chains";

export const SUPPORTED_CHAINS = process.env.NODE_ENV === 'production'
? 
  [
    Mumbai,
    BaseGoerli,
  ]
: 
  [
    Ethereum,
    Goerli,
    Binance,
    BinanceTestnet,
    Avalanche,
    AvalancheFuji,
    Polygon,
    Mumbai,
    BaseGoerli,
    Base
  ]
;

export const DEFAULT_CHAIN = process.env.NODE_ENV === 'production' 
? Mumbai
: Mumbai
;
export const ADVERTISEMENT_CHAIN = process.env.NODE_ENV === "production"
? BaseGoerli
: BaseGoerli
;
export const VOTING_CHAIN = BaseGoerli;