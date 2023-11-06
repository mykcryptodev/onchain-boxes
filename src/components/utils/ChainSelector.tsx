import { type FC,useContext } from "react";

import { SUPPORTED_CHAINS } from "~/constants/chain";
import ActiveChainContext from "~/context/ActiveChain";

export const ChainSelector: FC = () => {
  const { activeChainData, updateActiveChain } = useContext(ActiveChainContext);

  return (
    <select 
      className="select select-bordered w-full max-w-xs"
      onChange={(e) => void updateActiveChain(e.target.value)}
      value={activeChainData.slug}
    >
      {SUPPORTED_CHAINS.map((chain) => {
        return (
          <option
            key={chain.chainId}
            value={chain.slug}
          >
            {chain.name}
          </option>
        )
      })}
    </select>
  )
};

export default ChainSelector;