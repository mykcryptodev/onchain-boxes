import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useAddress } from '@thirdweb-dev/react';
import Image from 'next/image';
import Link from 'next/link';
import { type FC,useContext } from 'react';

import ActiveChainContext from '~/context/ActiveChain';
import NotificationContext from '~/context/Notification';
import useIsDarkTheme from '~/hooks/useIsDarkTheme';

const MoonpayPopup: FC = () => {
  const isDarkTheme = useIsDarkTheme();
  const { activeChainData } = useContext(ActiveChainContext);
  const { popNotification } = useContext(NotificationContext);
  const address = useAddress();
  
  return (
    <>
      <button 
        className={`btn btn-sm ${isDarkTheme ? 'btn-secondary' : 'btn-ghost'}`} 
        onClick={()=>(document.getElementById('moonpay_modal') as HTMLDialogElement).showModal()}
      > 
        <Image
          src="/images/buy-crypto/moonpay.png"
          alt='Moonpay'
          width={75}
          height={12}
        />
      </button>
      <dialog id="moonpay_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Buy {activeChainData.nativeCurrency.symbol} with MoonPay</h3>
          <p className="py-4">
            To claim these boxes, you need to buy {activeChainData.nativeCurrency.symbol}. MoonPay makes it easy to buy crypto. Click this button to get taken to MoonPay.
          </p>
          <span className="flex flex-col items-center gap-1">
            <span>Use this wallet address when buying {activeChainData.nativeCurrency.symbol}:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold label-text-alt ">{address}</span>
              <label className="swap swap-rotate">
                <input 
                  id="copy-address-moonpay"
                  type="checkbox"                   
                  onClick={() => {
                    void navigator.clipboard.writeText(address ?? "");
                    popNotification({
                      title: "Copied",
                      description: "Your wallet address has been copied to your clipboard.",
                      type: "success"
                    });
                    // wait 5 seconds then switch the checkbox back
                    setTimeout(() => {
                      const checkbox = document.getElementById('copy-address-moonpay') as HTMLInputElement;
                      checkbox.checked = false;
                    }, 5000);
                  }}
                />
                
                <DocumentDuplicateIcon 
                  className="swap-off w-4 h-4 stroke-2"
                />
                <CheckIcon className="swap-on w-4 h-4 stroke-2" />
                
              </label>
            </div>
          </span>
          <div className="modal-action flex items-center" >
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
            <Link 
              className="btn btn-primary flex items-center"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.moonpay.com/buy/matic`}
            >
              Go to MoonPay
            </Link>
          </div>
        </div>
      </dialog>
    </>
  )
};

export default MoonpayPopup;