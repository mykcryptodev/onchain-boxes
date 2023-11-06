import { DevicePhoneMobileIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { type Profile } from '@prisma/client';
import { type FC, useContext, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import PushNotificationBanner from '~/components/PushNotification/Banner';
import NotificationContext from '~/context/Notification';
import usePushNotification from '~/hooks/usePushNotification';
import { api } from '~/utils/api';

interface IFormInput {
  notifyWhenSold: boolean;
  notifyWhenOffered: boolean;
  notifyWhenOfferAccepted: boolean;
  notifyWhenOutbid: boolean;
  emailAddress: string;
  emailWhenSold: boolean;
  emailWhenOffered: boolean;
  emailWhenOfferAccepted: boolean;
  emailWhenOutbid: boolean;
}

interface Props {
  profile: Profile | undefined | null;
  onSave: () => void;
}

export const ProfileLinksForm: FC<Props> = ({ profile, onSave }) => {
  const { popNotification } = useContext(NotificationContext);
  const updateProfile = api.profile.update.useMutation();
  const { isSubscribed } = usePushNotification();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  useEffect(() => {
    if (isSubscribed) {
      setNotificationsEnabled(true);
    }
  }, [isSubscribed]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IFormInput>({
    defaultValues: {
      notifyWhenSold: profile?.notifyWhenSold || false,
      notifyWhenOffered: profile?.notifyWhenOffered || false,
      notifyWhenOfferAccepted: profile?.notifyWhenOfferAccepted || false,
      notifyWhenOutbid: profile?.notifyWhenOutbid || false,
      emailWhenSold: profile?.emailWhenSold || false,
      emailWhenOffered: profile?.emailWhenOffered || false,
      emailWhenOfferAccepted: profile?.emailWhenOfferAccepted || false,
      emailWhenOutbid: profile?.emailWhenOutbid || false,
      emailAddress: profile?.email || undefined,
    },
  });

  const pushNotificationOptions = [
    {
      title: "Item is Sold",
      description: "Get notified when one of your items is bought",
      value: "notifyWhenSold",
    },
    {
      title: "An Offer is Made",
      description: "Get notified when someone makes an offer on an item that you own",
      value: "notifyWhenOffered",
    },
    {
      title: "An Offer is Accepted",
      description: "Get notified when offers you make are accepted by sellers",
      value: "notifyWhenOfferAccepted",
    },
    {
      title: "Higher Bid Placed",
      description: "Get notified when someone outbids you on an auction",
      value: "notifyWhenOutbid",
    },
  ];

  const emailNotificationOptions = [
    {
      title: "Item is Sold",
      description: "Get emailed when one of your items is bought",
      value: "emailWhenSold",
    },
    {
      title: "An Offer is Made",
      description: "Get emailed when someone makes an offer on an item that you own",
      value: "emailWhenOffered",
    },
    {
      title: "An Offer is Accepted",
      description: "Get emailed when offers you make are accepted by sellers",
      value: "emailWhenOfferAccepted",
    },
    {
      title: "Higher Bid Placed",
      description: "Get emailed when someone outbids you on an auction",
      value: "emailWhenOutbid",
    },
  ];

  const emailAdddress = watch("emailAddress");

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      await updateProfile.mutateAsync({
        id: profile?.id || "",
        userId: profile?.userId || "",
        notifyWhenSold: data.notifyWhenSold,
        notifyWhenOffered: data.notifyWhenOffered,
        notifyWhenOfferAccepted: data.notifyWhenOfferAccepted,
        notifyWhenOutbid: data.notifyWhenOutbid,
        emailWhenSold: data.emailWhenSold,
        emailWhenOffered: data.emailWhenOffered,
        emailWhenOfferAccepted: data.emailWhenOfferAccepted,
        emailWhenOutbid: data.emailWhenOutbid,
        email: data.emailAddress,
      });
      popNotification({
        title: "Success",
        description: "Your notification preferences have been updated.",
        type: "success"
      });
      onSave();
    } catch (e) {
      console.error({ e });
      const error = e as Error;
      popNotification({
        title: "Error",
        description: "There was an error updating your notification preferences. " + error.message,
        type: "error"
      });
    }
  }

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <div className="collapse collapse-arrow">
            <input type="checkbox" className="peer" /> 
            <div className="collapse-title">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-8 h-8 stroke-2 mr-2" />
                Push Notifications
              </h2>
            </div>
            <div className="collapse-content"> 
              <div className="mb-4">
                <PushNotificationBanner onSubscription={() => {
                  setNotificationsEnabled(true);
                }} />
              </div>
              {pushNotificationOptions.map((option) => (
                <div className="form-control" key={option.value}>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text text-lg capitalize">{option.title}</span>
                      </label>
                    </div>
                    <div className="flex items-center justify-end w-full gap-2">
                      <input
                        type="checkbox"
                        disabled={!notificationsEnabled}
                        className="toggle toggle-lg toggle-success"
                        {...register(option.value as keyof IFormInput)}
                      />
                    </div>
                  </div>
                  <div className="text-sm pb-2">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="collapse collapse-arrow">
            <input type="checkbox" className="peer" /> 
            <div className="collapse-title">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <EnvelopeIcon className="w-8 h-8 stroke-2 mr-2" />
                Email Notifications
              </h2>
            </div>
            <div className="collapse-content"> 
              <div className="w-full flex flex-col gap-1 mb-4">
                <input
                  type="email"
                  className="input input-lg input-bordered w-full"
                  placeholder="Email Address"
                  {...register("emailAddress", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: 'invalid email address'
                    }
                  })}
                />
                {errors.emailAddress && <p className="text-error">{errors.emailAddress.message}</p>}
              </div>
              {emailNotificationOptions.map((option) => (
                <div className="form-control" key={option.value}>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <label className="label">
                        <span className="label-text text-lg capitalize">{option.title}</span>
                      </label>
                    </div>
                    <div className="flex items-center justify-end w-full gap-2">
                      <input
                        type="checkbox"
                        disabled={!emailAdddress && !errors.emailAddress}
                        className="toggle toggle-lg toggle-success"
                        {...register(option.value as keyof IFormInput)}
                      />
                    </div>
                  </div>
                  <div className="text-sm pb-2">
                    {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!notificationsEnabled && !emailAdddress && !errors.emailAddress}
            className="btn btn-primary btn-block btn-lg mt-4"
            onClick={() => handleSubmit(onSubmit)}
          >
            Save
          </button>
        </div>
      </form>
    </>
  )
}

export default ProfileLinksForm;