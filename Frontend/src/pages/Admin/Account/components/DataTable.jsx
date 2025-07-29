import React from "react";

const DataTable = ({ columns, data, emptyMessage = "Không có dữ liệu." }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="even:bg-zinc-50 dark:even:bg-white/5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default DataTable;
