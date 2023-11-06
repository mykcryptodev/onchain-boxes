import { useSDK } from "@thirdweb-dev/react";
import { useCallback, useEffect, useState } from "react";

const useIsContract = (address: string | undefined) => {
  const sdk = useSDK();
  const provider = sdk?.getProvider();
  const [isContract, setIsContract] = useState<boolean | null>(null);
  
  const fetchIsContract = useCallback(async () => {
    if (!provider) return setIsContract(false);
    const code = await provider.getCode(address || "");
    setIsContract(code !== "0x");
  }, [address, provider]);

  useEffect(() => {
    if (address && provider) {
      void fetchIsContract();
    }
  }, [address, fetchIsContract, provider]);

  return isContract;
}

export default useIsContract;