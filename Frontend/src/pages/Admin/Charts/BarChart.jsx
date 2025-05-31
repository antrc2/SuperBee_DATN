import PageBreadcrumb from "@components/Admin/common/PageBreadCrumb";
import ComponentCard from "@components/Admin/common/ComponentCard";
import BarChartOne from "@components/Admin/charts/bar/BarChartOne";
import PageMeta from "@components/Admin/common/PageMeta";

export default function BarChart() {
  return (
    <div>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
