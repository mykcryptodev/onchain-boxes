import { BellIcon } from "@heroicons/react/24/outline";
import { type FC } from "react";

import usePushNotification from "~/hooks/usePushNotification";

interface Props {
  onSubscription: () => void;
}

export const PushNotificationBanner: FC<Props> = ({ onSubscription }) => {
  const { isSubscribed, subscribe } = usePushNotification();

  if (isSubscribed) return null;

  return (
    <div className="bg-neutral text-neutral-content flex md:justify-between justify-around items-center gap-2 p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <BellIcon className="w-6 h-6 stroke-2" />
        Push Notifications
      </div>
      <button 
        className="btn" 
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          try {
            await subscribe();
          } catch (e) {
            console.error(e);
          }
          void onSubscription();
        }
      }>
        Enable
      </button>
    </div>
  )
}

export default PushNotificationBanner;