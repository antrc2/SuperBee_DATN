// Breadcrumbs.jsx
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  // tách các segment, bỏ các giá trị rỗng
  const segments = location.pathname.split("/").filter(Boolean);

  // helper để ghép lại đường dẫn tới segment hiện tại
  const buildPath = (index) => "/" + segments.slice(0, index + 1).join("/");

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol
          style={{ listStyle: "none", display: "flex", padding: 0, margin: 0 }}
        >
          {/* Luôn có “Trang chủ” ở đầu */}
          <li>
            <Link to="/">Trang chủ</Link>
          </li>

          {segments.map((seg, idx) => {
            const path = buildPath(idx);
            const isLast = idx === segments.length - 1;
            // hiển thị dấu phân cách
            return (
              <li key={path} style={{ marginLeft: 8 }}>
                <span style={{ margin: "0 8px" }}>{">"}</span>
                {isLast ? (
                  // segment cuối cùng thì không là link
                  <Link to={path}>{decodeURIComponent(seg)}</Link>
                ) : (
                  <Link to={path}>{decodeURIComponent(seg)}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="text-2xl font-medium mt-2">Danh sách Shop Account</div>
    </div>
  );
}
