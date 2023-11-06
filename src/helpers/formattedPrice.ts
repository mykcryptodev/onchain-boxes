interface Currency {
  decimals: number;
  displayValue: string;
}

export const formattedPrice = (price: Currency | undefined | null): string => {
  if (!price) return '';
  return Number(price.displayValue || "0").toLocaleString(undefined, {
    maximumFractionDigits: price?.decimals,
  });
}