import { type ReportWithContent } from "~/types/report";

const useReportName = (report: ReportWithContent) => {
  if (report.collection?.name) {
    return report.collection.name;
  }
  if (report.profile?.name) {
    return report.profile.name;
  }
  return "Unknown";
}

export default useReportName;