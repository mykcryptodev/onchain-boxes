import { XMarkIcon } from "@heroicons/react/24/outline";
import { MediaRenderer } from "@thirdweb-dev/react";
import { type FC } from "react";

export const HowToPlay: FC = () => {
  return (
    <>
      <button className="btn btn-ghost sm:btn-md lg:btn-lg btn-sm" onClick={()=>(document.getElementById('how_to_play_modal') as HTMLDialogElement).showModal()}>
        How to play
      </button>
      <dialog id="how_to_play_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
              <XMarkIcon className="w-4 h-4 stroke-2" />
            </button>
          </form>
          <h3 className="font-bold text-2xl">How to Play</h3>
          <p className="py-4 prose">Super Bowl boxes also known as Super Bowl Squares is a game of community fun where users can win prizes based on the scores of a football game.</p>
          <span className="font-bold">What are Superbowl Boxes?</span>
          <ul className="steps steps-vertical">
            <li className="step">Users purchase boxes on a 10x10 grid</li>
            <li className="step">Rows and columns are assigned random values 0-9</li>
            <li className="step" style={{ textAlign: 'start'}}>The scores of a single football game determine the winners of the Super Bowl boxes contest. The last digit of each team&apos;s score at the end of each quarter correspond to the winning box for that quarter</li>
            <li className="step">Winners claim their prize</li>
          </ul>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div className="collapse-title text-xl font-medium">
              What is an example of a winning box?
            </div>
            <div className="collapse-content">
              <p>In the following example, the winning boxes are highlighted. As an example, the final score of the game ended Chiefs: 17, Eagles: 21 and so the winning box for the final round was Chiefs: 7, Eagles 1</p>
              <MediaRenderer src="ipfs://QmTdmEZSU9ccuvBC2bZuuYcxQJqz88AHgCWX4j4TBQrhZW/winninboxexample.png" width="100%" height="100%" />
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div className="collapse-title text-xl font-medium">
              What happens if a grid does not sell out?
            </div>
            <div className="collapse-content"> 
              <p>The creator of the game can kick-off the randomizing of box scores at any time. Once this process is kicked off, boxes can no longer be claimed. If an empty box wins, the first player in the game to claim the reward will receive 50% of the reward for that box -- the other 50% will go towards keeping the dapp operational.</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div className="collapse-title text-xl font-medium">
              What are the payouts?
            </div>
            <div className="collapse-content"> 
              <div className="stats stats-vertical shadow w-full">
                <div className="stat">
                  <div className="stat-title">Q1</div>
                  <div className="stat-value">15%</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Q2</div>
                  <div className="stat-value">30%</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Q3</div>
                  <div className="stat-value">15%</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Final</div>
                  <div className="stat-value">38%</div>
                  <div className="stat-desc">Remaining 2% platform fee</div>
                </div>
              </div>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div className="collapse-title text-xl font-medium">
              How is randomness achieved?
            </div>
            <div className="collapse-content"> 
              <p>Random numbers are provided by Chainlink VRF. This ensures that nobody can influence the randomness of the numbers produced.</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div className="collapse-title text-xl font-medium">
              How are the football game scores determined?
            </div>
            <div className="collapse-content"> 
              <p>There is a refresh button on the scoreboard of the game. Clicking that button calls Chainlink Functions to reach out to the ESPN sports API for the latest scores. The scores are then recorded onchain to be used by the dapp. There is a 10 minute cooldown between refreshes to mitigate abuse of the network.</p>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
};

export default HowToPlay;