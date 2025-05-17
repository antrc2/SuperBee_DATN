// src/components/Admin/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/categories", label: "Quản lý danh mục" },
    { path: "/admin/products", label: "Quản lý sản phẩm" },
    // thêm route nếu cần
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white h-full p-4">
      <h2 className="text-lg font-bold mb-4">Quản trị</h2>
      <ul className="space-y-2">
        {menuItems.map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.path}
              className={`block p-2 rounded hover:bg-blue-700 ${
                location.pathname === item.path ? "bg-blue-700" : ""
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const Sidebar = () => {
//   const location = useLocation();

//   const menuItems = [
//     { path: '/admin/categories', label: 'Quản lý danh mục' },
//     { path: '/admin/products', label: 'Quản lý sản phẩm' },
//     // Thêm các mục khác nếu cần
//   ];

//   return (
//     <aside className="w-64 bg-blue-900 text-white h-screen p-4 fixed top-0 left-0">
//       <h2 className="text-lg font-bold mb-4">Quản trị</h2>
//       <ul className="space-y-2">
//         {menuItems.map((item, idx) => (
//           <li key={idx}>
//             <Link
//               to={item.path}
//               className={`block p-2 rounded hover:bg-blue-700 ${
//                 location.pathname === item.path ? 'bg-blue-700' : ''
//               }`}
//             >
//               {item.label}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </aside>
//   );
// };

// export default Sidebar;
