import { type FC } from "react";

export const ContestSkeleton: FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col gap-2 animate-pulse justify-center items-center">
        {/* header */}
        <div className="h-8 w-40 bg-base-200 rounded" />
        <div className="h-5 w-56 bg-base-200 rounded" />
        <div className="h-5 w-24 bg-base-200 rounded" />
        {/* scoreboard */}
        <div className="h-24 w-5/6 bg-base-200 rounded" />
        {/* boxes */}
        <div className="mt-6 h-96 w-5/6 bg-base-200 rounded" />
      </div>
    </div>
  )
};

export default ContestSkeleton;