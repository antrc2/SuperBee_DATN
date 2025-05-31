import PageBreadcrumb from "@components/Admin/common/PageBreadCrumb";
import ComponentCard from "@components/Admin/common/ComponentCard";
import LineChartOne from "@components/Admin/charts/line/LineChartOne";
import PageMeta from "@components/Admin/common/PageMeta";

export default function LineChart() {
  return (
    <>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Line Chart" />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </>
  );
}
