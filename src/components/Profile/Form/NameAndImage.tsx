import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type Profile } from "@prisma/client";
import { useSession } from "next-auth/react";
import { type FC,useContext, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { Portal } from "~/components/utils/Portal";
import SignInButton from "~/components/utils/SignIn";
import Upload from "~/components/utils/Upload";
import NotificationContext from "~/context/Notification";
import { api } from "~/utils/api";

interface IFormInput {
  name: string;
}

interface Props {
  profile: Profile | undefined | null;
  onSave?: () => void;
}

export const ProfileNameAndImageForm: FC<Props> = ({ profile, onSave }) => {
  const { popNotification } = useContext(NotificationContext);
  const [img, setImg] = useState<string>("");
  const { data: session } = useSession();
  const updateProfile = api.profile.update.useMutation();
  const createProfile = api.profile.create.useMutation();
  const { register, handleSubmit } = useForm<IFormInput>({
    defaultValues: {
      name: profile?.name || "",
    },
  });

  const handleRemoveGraphic = async (type: "logo" | "banner") => {
    try {
      if (type === "logo") {
        await updateProfile.mutateAsync({
          img: undefined,
          id: profile?.id || "",
        });
      }
      if (type === "banner") {
        await updateProfile.mutateAsync({
          banner: undefined,
          id: profile?.id || "",
        });
      }
      void onSave?.();
      popNotification({
        title: "Success",
        description: "Your graphic has been removed.",
        type: "success"
      });
    } catch (e) {
      const error = e as Error;
      console.error({ error });
      popNotification({
        title: "Error",
        description: "There was an error removing your graphic. " + error.message,
        type: "error"
      });
    }
  }

  interface RemoveGraphicModalProps {
    type: "logo" | "banner"
  }

  const RemoveGraphicModal: FC<RemoveGraphicModalProps> = ({ type }) => {
    return (
      <>
        {/* The button to open modal */}
        <label htmlFor={`remove-graphic-modal-${type}`} className="btn btn-xs btn-ghost">
          <TrashIcon className="w-4 h-4 stroke-2" />
          Remove
        </label>

        <Portal>
          <input type="checkbox" id={`remove-graphic-modal-${type}`} className="modal-toggle" />
          <div className="modal modal-bottom sm:modal-middle">
            <div className="modal-box relative">
              <label htmlFor={`remove-graphic-modal-${type}`} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
                <XMarkIcon className="h-4 w-4 stroke-2" />
              </label>
              <h3 className="font-bold text-lg">Remove Graphic</h3>
              <p className="py-4">Are you sure you want to remove this graphic? This action cannot be undone.</p>
              <div className="modal-action">
                <label htmlFor={`remove-graphic-modal-${type}`} className="btn">Cancel</label>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={() => void handleRemoveGraphic(type)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </>
    )
  }

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log({ profile, session })
    if (!profile) {
      await createProfile.mutateAsync({
        userId: session?.user?.id || "",
        name: session?.user?.id || "",
      });
    }
    try {
      await updateProfile.mutateAsync({
        id: profile?.id || "",
        img,
        userId: profile?.userId || "",
        name: data.name,
      });
      void onSave?.();
      popNotification({
        title: "Success",
        description: "Your profile has been updated.",
        type: "success"
      });
    } catch (e) {
      console.error({ e });
      const error = e as Error;
      popNotification({
        title: "Error",
        description: "There was an error updating your profile. " + error.message,
        type: "error"
      });
    }
  }

  return (
    <div className="w-full">
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-start items-center w-full gap-2 min-w-[300px]">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg">Profile image</span>
            </label>
            <Upload 
              key="logo"
              objectCover
              className="rounded-lg w-32 h-32 bg-base-100 text-center flex items-center justify-center relative"
              initialUrls={profile?.img ? [profile.img] : []}
              callback={(url) => setImg(url[0] || "")}
            />
            <div className="w-full flex justify-center mt-2">
              <RemoveGraphicModal type="logo" />
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg capitalize">Name</span>
            </label>
            <input
              type="text"
              placeholder="username"
              className="input input-lg input-bordered w-full"
              {...register("name")}
            />
          </div>
        </div>
        <div className="w-full">
          {!session ? (
            <SignInButton btnLabel={'Sign In to Save'} className="btn btn-block btn-lg mt-4" />
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-4"
              onClick={() => handleSubmit(onSubmit)}
            >
              Save
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProfileNameAndImageForm;