import React, { useState } from "react"; // Import React and useState for JSX

const Select = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = ""
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  // Handles the change event for the select element
  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value); // Update internal state
    onChange(value); // Trigger parent handler with the new value
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue // Apply text color based on whether an option is selected
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue} // Control the select element's value
      onChange={handleChange} // Attach the change handler
    >
      {/* Placeholder option, displayed when no value is selected */}
      <option
        value=""
        disabled // Make the placeholder option unselectable
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over the provided options to create individual <option> elements */}
      {options.map((option) => (
        <option
          key={option.value} // Unique key for each option
          value={option.value} // The actual value of the option
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label} {/* The text displayed for the option */}
        </option>
      ))}
    </select>
  );
  // This component provides a custom-styled select dropdown.
  // It manages its selected value internally and notifies the parent component of changes.
  // It includes a placeholder option and dynamically renders options based on the 'options' prop.
};

export default Select;
