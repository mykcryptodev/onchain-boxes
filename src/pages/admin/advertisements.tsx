import { RectangleGroupIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Link from "next/link";

import AdminBreadcrumbs from "~/components/Admin/Breadcrumbs";
import withAdminProtection from "~/hoc/withAdminProtection";

const AdminAdvertisements: NextPage = () => {
  const pages = [
    {
      name: "Banners",
      path: "/admin/advertisement/banner",
      icon: <RectangleGroupIcon className="h-8 w-8 stroke-2" />
    },
    {
      name: "Heroes",
      path: "/admin/advertisement/hero",
      icon: <Square2StackIcon className="h-8 w-8 stroke-2" />
    },
  ];

  return (
    <div className="flex flex-col gap-2 mx-2">
      <AdminBreadcrumbs
        currentPaths={["/admin/advertisements"]}
        currentPathNames={["Advertisements"]}
      />
      <div className="flex items-center justify-between">
        <div className="text-5xl font-bold mb-8">Advertisements</div>
        <Link href="/admin/advertisement/create" className="btn btn-primary">
          Create
        </Link>
      </div>
      {pages.map(page => (
        <Link key={page.name} href={page.path} className="p-8 flex items-center gap-4 border rounded-lg text-2xl font-bold">
          {page.icon}
          {page.name}
        </Link>
      ))}
    </div>
  )
}

export default withAdminProtection(AdminAdvertisements);