import { type NextPage } from "next";

import AdminBreadcrumbs from "~/components/Admin/Breadcrumbs";
import AdvertisementCalendar from "~/components/Advertisement/Calendar";
import withAdminProtection from "~/hoc/withAdminProtection";

export const HeroAdvertisementAdmin: NextPage = () => {
  
  return (
    <div className="flex flex-col gap-2 mx-2">
      <AdminBreadcrumbs
        currentPaths={["/admin/advertisements", "/admin/advertisement/hero"]}
        currentPathNames={["Advertisements", "Heroes"]}
      />
      <div className="flex items-center justify-between">
        <div className="text-5xl font-bold mb-8">Heroes</div>
      </div>
      <AdvertisementCalendar adType="HERO" adminControls={true} />
    </div>
  )
}

export default withAdminProtection(HeroAdvertisementAdmin);