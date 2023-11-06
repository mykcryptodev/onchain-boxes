import { type TransactionError,type TransactionResult, useAddress,Web3Button } from "@thirdweb-dev/react";
import { type FC,useContext } from "react";

import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import { type ContestData } from "~/types/contest";

type Props = {
  contest: ContestData;
  onValuesGenerated: () => void;
}

export const GenerateRandomValues: FC<Props> = ({ contest, onValuesGenerated }) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const { popNotification } = useContext(NotificationContext);
  const address = useAddress();
  if (address !== contest.creator) return null;

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-1" />
      <div className="col-span-10">
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <button className="btn btn-block" onClick={()=> {
          const modal = document?.getElementById('random_generator_modal') as HTMLDialogElement;
          modal.showModal();
        }}>
          Generate Random Row/Col Values
        </button>
        <dialog id="random_generator_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <ul className="steps w-full mb-8">
              <li className="step step-primary">Generate Random Values</li>
              <li className="step">Apply Random Values</li>
            </ul>
            <h3 className="font-bold text-lg">Generate Random Row/Col Values</h3>
            <p className="py-4">
              Generating random values for rows and columns is the first step in a two step process. Once the random values are generated, you will need to execute a second transaction to apply the random values to the boxes.
            </p>
            <p className="p-4 bg-warning text-warning-content rounded-lg">
              <strong>Nobody will be able to claim new boxes after this action is taken.</strong>
            </p>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
              <Web3Button
                className="thirdweb-btn-primary"
                contractAddress={BOX_CONTRACT[activeChainData.slug] as string}
                action={async (contract) => {
                  try {
                    const tx = await contract.call(
                      "fetchRandomValues", 
                      [contest.id]
                    ) as TransactionResult;
                    console.log({ tx });
                    popNotification({
                      title: "Randomizer is Activated!",
                      description: "It will take a few moments for the random number generator to generate random values. Once this is done, you'll need to execute another transaction to assign the values to the boxes. Check back soon!",
                      type: "success",
                      duration: 120000,
                    });
                    void onValuesGenerated();
                  } catch (e) {
                    console.log({ e });
                    const error = e as TransactionError;
                    popNotification({
                      title: "Error Generating Random Values!",
                      description: error.reason,
                      type: "error",
                    });
                  } finally {
                    const modal = document?.getElementById('random_generator_modal') as HTMLDialogElement;
                    modal.close();
                  }
                }}
              >
                Generate Random Values
              </Web3Button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  )
};

export default GenerateRandomValues;