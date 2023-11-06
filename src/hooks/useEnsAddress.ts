import { useSigner } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

const useEnsAddress = (name: string) => {
  const signer = useSigner();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<string | null | undefined>(null);

  useEffect(() => {
    const fetchEnsAddress = async () => {
      try {
        const address = await signer?.provider?.resolveName(name || "");
        setData(address);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchEnsAddress();
  }, [name, signer]);

  return { isLoading, error, data };
}

export default useEnsAddress;