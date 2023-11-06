import { useAddress } from "@thirdweb-dev/react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import NotificationContext from "~/context/Notification";
import arrayBufferToBase64 from "~/helpers/arrayBufferToBase64";
import urlBase64ToUint8Array from "~/helpers/urlToBase64ToUint8Array";
import { api } from "~/utils/api";

const usePushNotification = () => {
  const address = useAddress();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const createPushSubscription = api.pushNotification.createPushSubscription.useMutation();
  const { popNotification } = useContext(NotificationContext);

  // check if the user is already subscribed
  const fetchSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setSubscription(subscription);
      }
      return subscription;
    } catch (e) {
      console.error('Could not determine if user had push notis enabled', e)
    }
  }, []);

  const subscribe = async () => {
    try {
      // register the notifications on user device
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });
      setSubscription(subscription);
      // store this subscription in the db
      const authBuffer = subscription.getKey('auth');
      const p256dhBuffer = subscription.getKey('p256dh');

      const authBase64 = arrayBufferToBase64(authBuffer);
      const p256dhBase64 = arrayBufferToBase64(p256dhBuffer);

      const record = await createPushSubscription.mutateAsync({
        userId: address || "",
        endpoint: subscription.endpoint || "",
        keys: {
          auth: authBase64,
          p256dh: p256dhBase64,
        }
      });

      popNotification({
        title: 'Success',
        description: 'Push notifications are enabled!',
        type: 'success'
      });

      return {
        subscription,
        record
      }

    } catch (e) {
      const error = e as Error;
      popNotification({
        title: 'Error',
        description: 'Could not enable push notifications: ' + error.message,
        type: 'error'
      })
    }

  }

  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscribe,
    isSubscribed: useMemo(() => !!subscription, [subscription])
  }
}

export default usePushNotification;