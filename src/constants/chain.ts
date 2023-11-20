import {
  Base,
  BaseGoerli, 
  Mumbai,
  Polygon,
} from "@thirdweb-dev/chains";

export const SUPPORTED_CHAINS = process.env.NODE_ENV === 'production'
? 
  [
    Polygon,
  ]
: 
  [
    Polygon,
    // Mumbai,
    // BaseGoerli,
    // Base
  ]
;

export const DEFAULT_CHAIN = process.env.NODE_ENV === 'production' 
? Polygon
: Polygon
;
export const ADVERTISEMENT_CHAIN = process.env.NODE_ENV === "production"
? Polygon
: Polygon
;
export const VOTING_CHAIN = BaseGoerli;