type DonIdMap = {
  [key: string]: string;
}
export const CHAINLINK_DON_ID: DonIdMap = {
  ['mumbai']: 'fun-polygon-mumbai-1',
  ['polygon']: 'fun-polygon-mainnet-1',
}

type SubscriptionIdMap = {
  [key: string]: number;
}
export const CHAINLINK_SUBSCRIPTION_ID: SubscriptionIdMap = {
  ['mumbai']: 390,
  ['polygon']: 39,
}