import { type NextPage } from "next";

import AdminBreadcrumbs from "~/components/Admin/Breadcrumbs";
import AdvertisementCalendar from "~/components/Advertisement/Calendar";
import withAdminProtection from "~/hoc/withAdminProtection";

export const BannerAdvertisementAdmin: NextPage = () => {
  
  return (
    <div className="flex flex-col gap-2 mx-2">
      <AdminBreadcrumbs
        currentPaths={["/admin/advertisements", "/admin/advertisement/banner"]}
        currentPathNames={["Advertisements", "Banners"]}
      />
      <div className="flex items-center justify-between">
        <div className="text-5xl font-bold mb-8">Banners</div>
      </div>
      <AdvertisementCalendar adType="BANNER" adminControls={true} />
    </div>
  )
}

export default withAdminProtection(BannerAdvertisementAdmin);