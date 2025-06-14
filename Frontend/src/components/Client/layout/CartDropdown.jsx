import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
export default function CartDropdown({
  cartItems,
  isOpen,
  onClose,
  isMobile = false,
}) {
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, isMobile]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`${
        isMobile
          ? "h-full flex flex-col"
          : "absolute right-0 top-full z-20 mt-2 w-80 sm:w-96 rounded-md border bg-white shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-md font-semibold text-gray-800">Giỏ hàng</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>
      <div className={`overflow-y-auto ${isMobile ? "flex-grow" : "max-h-80"}`}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <Link
              to={`/acc/${item?.product?.sku}`}
              key={item.id}
              className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={onClose} // Close dropdown on item click
            >
              <img
                src={`${import.meta.env.VITE_BACKEND_IMG}${
                  item?.product?.images[0]?.image_url
                }`}
                alt={item?.name}
                className="h-16 w-16 rounded object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/60x60/E2E8F0/4A5568?text=Err";
                }}
              />
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-800">
                  {item?.product?.category?.name}
                </p>
                <p className="text-sm text-red-600 font-semibold">
                  {item?.product?.price}đ
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="p-4 text-sm text-gray-500 text-center">
            Giỏ hàng của bạn trống.
          </p>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="p-3 border-t">
          <a
            href="/cart"
            className="block w-full text-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Xem giỏ hàng ({cartItems.length})
          </a>
        </div>
      )}
    </div>
  );
}
