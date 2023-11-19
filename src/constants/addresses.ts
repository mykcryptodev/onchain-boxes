
type ContractAddress = {
  [chainId: string]: string;
}

export const MARKETPLACE: ContractAddress = {
  ['binance-testnet']: '0xCA20947876aF1062Af765448001C054970DB2050',
  ['binance-mainnet']: '0x0',
  ['mumbai']: '0x160586B4374a9A6910b0c693aC28f3498b94AC0D',
  ['goerli']: '0xc4D4dFa8ebF66D2500b7231bcd8d1C3292612F8E',
  ['base-goerli']: '0xf2df887aa9ec1fbdd053fb4c13a726a4d855d2fe',
  ['base']: '0x87435ffdc2fdee53f3c809e388b4c10fdd27610f',
};

export const WETH: ContractAddress = {
  ['binance-testnet']: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  ['binance-mainnet']: '0x0',
  ['mumbai']: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  ['goerli']: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  ['ethereum']: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ['polygon']: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  ['base-goerli']: '0x4200000000000000000000000000000000000006',
  ['base']: '0x4200000000000000000000000000000000000006',
};

export const HERO_ADVERTISEMENT: ContractAddress = {
  ['base']: '0x883e650597b8e42ecfbB7605c906B62c586668c2',
  ['base-goerli']: '0xd9fD28A94b3B3E622B7B937836a9fA860869EF09',
}

export const BANNER_ADVERTISEMENT: ContractAddress = {
  ['base']: '0x4047f984f20f174919bffbf0c5f347270d13a112',
  ['base-goerli']: '0xD13E80EE333FF58F3711b45c3F03b09ced284133',
}

export const DEFAULT_PRIMARY_SALE_RECIPIENT = "0x5079EC85c3c8F8E932Bd011B669b77d703DEEea7";

export const VOTING_CONTRACT: ContractAddress = {
  // ['base-goerli']: '0x314BF06caEe105883b5F8F5dF4f6AEDEe9aBC436',
  // ['base-goerli']: '0x570f497964eFB9564af6fC4175809c8e8eC2263E',
  ['base-goerli']: '0x3945479213Af54Fb9EC4BF0A4bfCc96e5509B2d1',
  ['goerli']: '0xbE1127E57770f1F9E5734a973C1FFAb5E5BB1469',
}

export const GOVERNANCE_TOKEN: ContractAddress = {
  // ['base-goerli']: '0x495E73935Db8Ef0b43a538188203F36972E25B80',
  ['base-goerli']: '0xD03463CA01ACB8f97Ff82E70003a107Bd703f236',
  ['goerli']: '0x09072283C8A69D3D16A7b12d058d44509C83EFD3',
}

export const AIRDROP: ContractAddress = {
  ['base']: '0x09350f89e2d7b6e96ba730783c2d76137b045fef',
  ['base-goerli']: '0x7A69373531a4877EA54c3617D3f7B256C72DBa1E',
  ['goerli']: '0x8488af0ed7a0a09b9348ac1c6912f225350796e7',
}

export const SMART_WALLET_FACTORY: ContractAddress = {
  ['base']: '0x7d51950913147e0d464dee1a07c49ca7a2e1b17d',
  ['base-goerli']: '0x0b6d891DcA65eD409af14758aAF2A5516E7Ee183',
  ['mumbai']: '0x11a00bd77aa21791cb4d29dee1defa5a17dcc2f8',
}

export const BOX_CONTRACT: ContractAddress = {
  ['goerli']: '0x81101D0A9BeAcfBd627fa85d83B0eA8932adE457',
  // ['mumbai']: '0xc68371f21C3e9b60Fb2E41D523DEC5A3c071E533',
  // ['mumbai']: '0xe13f70F0d60A0ADEcB451aECaed71e3cB7e12EDe',
  // ['mumbai']: '0xd80ecf37656a5997f8f5b1494dd241acc0a0bf1b',
  // ['mumbai']: '0xa114Ef31a6A1F66b3129A175980aCD697D3257aa',
  // ['mumbai']: '0x8Af094CaEFD25e2577700e4EB69c33247971a88a',
  ['mumbai']: '0x6CEF1850753b783ba6eF7C568C85Dc10918537D8',
}

export const GAMESCORE_ORACLE_CONTRACT: ContractAddress = {
  // ['mumbai']: '0xECb47CabAC187005e8A01850dD3aFAD9DF3e6CA9',
  // ['mumbai']: '0x35a00139bB346abB41a93D5DdcaF570Efc111289',
  // ['mumbai']: '0xd80ecf37656a5997f8f5b1494dd241acc0a0bf1b',
  // ['mumbai']: '0xa114Ef31a6A1F66b3129A175980aCD697D3257aa',
  // ['mumbai']: '0x8Af094CaEFD25e2577700e4EB69c33247971a88a',
  ['mumbai']: '0x6CEF1850753b783ba6eF7C568C85Dc10918537D8',
}

export const CHAINLINK_ROUTER_ADDRESS: ContractAddress = {
  ['mumbai']: '0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C',
}

export const CHAINLINK: ContractAddress = {
  ['mumbai']: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
}