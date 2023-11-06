import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import ActiveAdvertisement from "~/components/Advertisement/Active";
import ContestList from "~/components/Contest/List";
import { MARKETPLACE_NAME } from "~/constants";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{MARKETPLACE_NAME}</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col gap-12 justify-center">
        <div className="flex flex-col gap-2 px-2">
          <div className="p-2 sm:p-6 lg:p-8">
            <ActiveAdvertisement type={"HERO"} showFallback={true} />
          </div>
          <div className="px-2 sm:px-6 lg:px-8 w-full flex justify-end">
            <Link href="/contest/create" className="btn btn-sm btn-primary">
              Create Contest
            </Link>
          </div>
          <div className="p-2 sm:p-6 lg:p-8" id="contest-list-homepage">
            <ContestList />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;