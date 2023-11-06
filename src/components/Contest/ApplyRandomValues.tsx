import { type TransactionError,type TransactionResult,Web3Button } from "@thirdweb-dev/react";
import { type FC,useContext } from "react";

import { BOX_CONTRACT } from "~/constants/addresses";
import ActiveChainContext from "~/context/ActiveChain";
import NotificationContext from "~/context/Notification";
import { type ContestData } from "~/types/contest";

type Props = {
  contest: ContestData;
  onValuesApplied: () => void;
}

export const ApplyRandomValues: FC<Props> = ({ contest, onValuesApplied }) => {
  const { activeChainData } = useContext(ActiveChainContext);
  const { popNotification } = useContext(NotificationContext);

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-1" />
      <div className="col-span-10">
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <button className="btn btn-block" onClick={()=> {
          const modal = document?.getElementById('apply_values_modal') as HTMLDialogElement;
          modal.showModal();
        }}>
          Apply Random Row/Col Values
        </button>
        <dialog id="apply_values_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <ul className="steps w-full mb-8">
              <li className="step step-primary">Generate Random Values</li>
              <li className="step step-primary">Apply Random Values</li>
            </ul>
            <h3 className="font-bold text-lg">Apply Random Row/Col Values</h3>
            <p className="py-4">
              Applying random values to rows and columns will assign the random values to the boxes. Once this is done, users will know which scores they need to win the contest.
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
                      "randomlyAssignRowAndColValues", 
                      [contest.id]
                    ) as TransactionResult;
                    console.log({ tx });
                    popNotification({
                      title: "Values Are Being Applied!",
                      description: "Rows and columns will have their random values assigned momentarily!",
                      type: "success",
                    });
                    void onValuesApplied();
                  } catch (e) {
                    console.log({ e });
                    const error = e as TransactionError;
                    popNotification({
                      title: "Error Applying Random Values!",
                      description: error.reason,
                      type: "error",
                    });
                  } finally {
                    const modal = document?.getElementById('apply_values_modal') as HTMLDialogElement;
                    modal.close();
                  }
                }}
              >
                Apply Random Values
              </Web3Button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  )
};

export default ApplyRandomValues;