import React from "react";

const FinancialStatCard = ({ title, value, icon, colorClasses }) => {
  return (
    <div
      className={`p-4 rounded-xl shadow-sm flex items-center gap-4 ${colorClasses.bg}`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colorClasses.iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-sm font-medium ${colorClasses.title}`}>{title}</p>
        <p className={`text-2xl font-bold ${colorClasses.value}`}>{value}</p>
      </div>
    </div>
  );
};

export default FinancialStatCard;
