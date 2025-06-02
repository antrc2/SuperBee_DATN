import React from "react"; // Import React for JSX

const Radio = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "text-gray-700 dark:text-gray-400"
      } ${className}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)} // Prevent onChange when disabled
        className="sr-only" // Visually hide the default radio input
        disabled={disabled} // Disable the input element
      />
      {/* Custom visual representation of the radio button */}
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${
          checked
            ? "border-brand-500 bg-brand-500" // Checked state styling
            : "bg-transparent border-gray-300 dark:border-gray-700" // Unchecked state styling
        } ${
          disabled
            ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700" // Disabled state styling
            : ""
        }`}
      >
        {/* Inner circle for checked state */}
        <span
          className={`h-2 w-2 rounded-full bg-white ${
            checked ? "block" : "hidden" // Show/hide inner circle based on checked state
          }`}
        ></span>
      </span>
      {/* Label text for the radio button */}
      {label}
    </label>
  );
  // This component provides a custom-styled radio button.
  // It handles checked state, disabled state, and includes a label.
  // The actual input is hidden using 'sr-only' and a custom span is used for visual styling.
};

export default Radio;
