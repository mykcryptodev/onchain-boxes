import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback,useContext,useEffect,useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import AdminBreadcrumbs from "~/components/Admin/Breadcrumbs";
import Upload from "~/components/utils/Upload";
import { MARKETPLACE_NAME } from "~/constants";
import NotificationContext from "~/context/Notification";
import withAdminProtection from "~/hoc/withAdminProtection";
import { api } from "~/utils/api";

interface FormInput {
  name: string;
  type: "BANNER" | "HERO";
  link: string;
  start: string;
  end: string;
}

const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
thirtyDaysFromNow.setSeconds(0);
thirtyDaysFromNow.setMilliseconds(0);

const getIsoStringInUserTimezone = (date: Date) => {
  // if the date is invalid, return empty string
  if (isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000; // Get timezone offset in milliseconds
  const localDate = new Date(date.getTime() - offsetMs); // Subtract offset to get local date
  const isoString = localDate.toISOString().slice(0, 16); // Get ISO date string (YYYY-MM-DDTHH:mm)
  return isoString;
}

const ManageAdvertisement: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: existingAd } = api.advertisement.getOne.useQuery({ id });
  const create = api.advertisement.create.useMutation();
  const update = api.advertisement.update.useMutation();
  const { popNotification } = useContext(NotificationContext);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { register, handleSubmit, watch, reset } = useForm<FormInput>({
    defaultValues: {
      name: existingAd?.name || "",
      type: existingAd?.type || "BANNER",
      link: existingAd?.link || "",
      start: getIsoStringInUserTimezone(existingAd?.startDate || new Date()),
      end: getIsoStringInUserTimezone(existingAd?.endDate || thirtyDaysFromNow),
    },
  });

  const type = watch("type");

  const resetFormWithExistingAd = useCallback(() => {
    if (existingAd) {
      setImageUrl(existingAd.image);
      reset({
        name: existingAd.name,
        type: existingAd.type,
        link: existingAd.link,
        start: getIsoStringInUserTimezone(existingAd.startDate),
        end: getIsoStringInUserTimezone(existingAd.endDate),
      });
    }
  }, [existingAd, reset])

  useEffect(() => {
    if (existingAd) {
      void resetFormWithExistingAd();
    }
  }, [existingAd, reset, resetFormWithExistingAd])

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (id === "create") {
        await create.mutateAsync({
          name: data.name,
          type: data.type,
          link: data.link,
          image: imageUrl,
          startDate: new Date(data.start),
          endDate: new Date(data.end),
        });
      } else {
        await update.mutateAsync({
          id,
          name: data.name,
          type: data.type,
          link: data.link,
          image: imageUrl,
          startDate: new Date(data.start),
          endDate: new Date(data.end),
        });
      }
      popNotification({
        title: "Success",
        description: `Advertisement ${id === "create" ? "created" : "updated"} successfully`,
        type: "success",
      });
      // go to the advertisements page
      void router.push("/admin/advertisements");
    } catch (err) {
      const error = err as Error;
      popNotification({
        title: "Error",
        description: "There was a problem managing the advertisement: " + error.message,
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 mx-2">
      <AdminBreadcrumbs
        currentPaths={["/admin/advertisements",`/admin/advertisement/${!existingAd ? "create" : existingAd.name }`]}
        currentPathNames={["Advertisements", !existingAd ? "Create" : existingAd.name ]}
      />
      <h3 className="font-bold text-5xl mb-8">
        {id === "create" ? "Create" : "Edit"} Advertisement
      </h3>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg capitalize">Media</span>
            </label>
            <Upload
              callback={(url) => {
                // if the current url is not equal to the new url, set the new url
                if (url[0] !== imageUrl) {
                  setImageUrl(url[0] || "");
                }
              }}
              height={type === "BANNER" ? 'h-16' : 'h-96'}
              objectCover={true}
              initialUrls={[imageUrl]}
            />
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col max-w-md">
              <div className="form-control">
              <label className="label">
                <span className="label-text text-lg capitalize">Type</span>
              </label>
              <select
                className="select select-bordered select-lg w-full"
                {...register("type")}
              >
                <option value="BANNER">Banner</option>
                <option value="HERO">Hero</option>
              </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg capitalize">Name</span>
                </label>
                <div className="text-sm pb-2">
                  Name is only used for organizational purposes in the admin panel
                </div>
                <input
                  type="text"
                  className="input input-lg input-bordered w-full"
                  {...register("name")}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg capitalize">Link</span>
                </label>
                <div className="text-sm pb-2">
                  Use absolute paths (https://example.com) for external links but use relative paths (/profile/Myk_Rocks) for links on {MARKETPLACE_NAME}
                </div>
                <input
                  type="text"
                  className="input input-lg input-bordered w-full"
                  {...register("link")}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg capitalize">Start Date</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-lg input-bordered w-full"
                  {...register("start")}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg capitalize">End Date</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-lg input-bordered w-full"
                  {...register("end")}
                />
              </div>
              <button 
                className="btn btn-lg btn-block btn-primary mt-8"
                onClick={() => handleSubmit(onSubmit)}
              >
                {id === "create" ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default withAdminProtection(ManageAdvertisement);