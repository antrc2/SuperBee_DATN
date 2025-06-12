import React from "react"; // Import React for JSX

const RadioSm = ({
  id, // Unique ID for the radio button
  name, // Radio group name
  value, // Value of the radio button
  checked, // Whether the radio button is checked
  label, // Label text for the radio button
  onChange, // Handler for when the radio button is toggled
  className = "" // Optional custom classes for styling
  // Note: The original RadioSm component did not include 'disabled' prop in its interface or usage.
  // If 'disabled' functionality is desired, it would need to be added to the props and logic.
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer select-none items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span className="relative">
        {/* Hidden HTML radio input */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)} // Call onChange with the radio button's value
          className="sr-only" // Visually hide the default radio input
          // disabled={disabled} // Add this if you want to support disabled state for RadioSm
        />
        {/* Custom styled radio circle */}
        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${
            checked
              ? "border-brand-500 bg-brand-500" // Styling when checked
              : "bg-transparent border-gray-300 dark:border-gray-700" // Styling when unchecked
          }`}
        >
          {/* Inner dot for the checked state */}
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? "bg-white" : "bg-white dark:bg-[#1e2636]" // Dot color based on checked state and dark mode
            }`}
          ></span>
        </span>
      </span>
      {/* Label text displayed next to the radio button */}
      {label}
    </label>
  );
  // This component creates a custom-styled radio button with a smaller size.
  // It hides the default HTML radio input and uses custom spans for visual representation.
  // It handles the checked state and displays a label.
};

export default RadioSm;
