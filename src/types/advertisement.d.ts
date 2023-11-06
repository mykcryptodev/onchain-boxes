export type Advertisement = {
  id: number,
  price: string,
  owner: string,
  contentURI: string,
  link: string,
  media: string,
}

export type AdvertisementType = "BANNER" | "HERO";
