import { type SmartContract } from "@thirdweb-dev/sdk";
import { type BaseContract } from "ethers";
import { useEffect, useState } from "react";

const useContractOwner = (contract: SmartContract<BaseContract> | undefined) => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getAndSetOwner = async (contract: SmartContract<BaseContract>) => {
    try {
      // set loading to true
      setIsLoading(true);
      // try the thirdweb sdk first
      const owner = await contract.owner.get();
      setData(owner);
      setError(null);
    } catch (e) {
      try {
        // try the ethers sdk
        const owner = await contract.call("owner", []) as string;
        setData(owner);
        setError(null);
      } catch (e) {
        // if we cannot get an owner, return the zero address
        setData(null);
        const error = e as Error;
        setError(error);
      }
    } finally {
      // set loading to false
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!contract) return;
    void getAndSetOwner(contract);
  }, [contract]);

  return {
    data,
    isLoading,
    error
  };
};

export default useContractOwner;