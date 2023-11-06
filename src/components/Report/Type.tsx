import { type FC } from "react";

import { type ReportWithContent } from "~/types/report";

export const ReportType: FC<{ report: ReportWithContent }> = ({ report }) => {
  return (
    <>
      {report.collection && (
        <div className="badge badge-primary">Collection</div>
      )}
      {report.profile && (
        <div className="badge badge-secondary">Profile</div>
      )}
    </>
  )
};

export default ReportType;