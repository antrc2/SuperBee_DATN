import { Link } from "react-router-dom";

export default function Breadcrumbs({ category }) {
  // We no longer need useLocation() or to parse URL segments directly if
  // we're relying on the 'category' prop for names and slugs.

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol
          style={{ listStyle: "none", display: "flex", padding: 0, margin: 0 }}
        >
          {/* Always show "Trang chủ" */}
          <li>
            <Link to="/">Trang chủ</Link>
          </li>

          {/* Display the current category if it's available */}
          {category && (
            <li key={category.slug} style={{ marginLeft: 8 }}>
              <span style={{ margin: "0 8px" }}>{">"}</span>
              {/* This links to the category's slug. Adjust '/products' if your base path is different. */}
              <Link to={`/mua-acc/${category.slug}`}>{category.name}</Link>
            </li>
          )}
        </ol>
      </nav>
      <div className="text-2xl font-medium mt-2">{category?.name}</div>
    </div>
  );
}
