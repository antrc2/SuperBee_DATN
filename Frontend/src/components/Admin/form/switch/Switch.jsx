import React, { useState } from "react"; // Import React and useState for JSX

const Switch = ({
  label,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue" // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  // Handles the toggle action for the switch
  const handleToggle = () => {
    if (disabled) return; // Do nothing if the switch is disabled
    const newCheckedState = !isChecked; // Toggle the checked state
    setIsChecked(newCheckedState); // Update the internal state
    if (onChange) {
      onChange(newCheckedState); // Notify the parent component of the change
    }
  };

  // Determine the colors for the switch background and knob based on 'color' prop and 'isChecked' state
  const switchColors =
    color === "blue"
      ? {
          // Blue theme colors
          background: isChecked
            ? "bg-brand-500" // Background when checked
            : "bg-gray-200 dark:bg-white/10", // Background when unchecked
          knob: isChecked
            ? "translate-x-full bg-white" // Knob position and color when checked
            : "translate-x-0 bg-white" // Knob position and color when unchecked
        }
      : {
          // Gray theme colors
          background: isChecked
            ? "bg-gray-800 dark:bg-white/10" // Background when checked
            : "bg-gray-200 dark:bg-white/10", // Background when unchecked
          knob: isChecked
            ? "translate-x-full bg-white" // Knob position and color when checked
            : "translate-x-0 bg-white" // Knob position and color when unchecked
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"
      }`}
      onClick={handleToggle} // Toggle the switch when the label is clicked
    >
      <div className="relative">
        {/* The switch track/background */}
        <div
          className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800" // Disabled background
              : switchColors.background // Active background based on color theme
          }`}
        ></div>
        {/* The switch knob/circle */}
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {/* The label text for the switch */}
      {label}
    </label>
  );
  // This component provides a custom-styled toggle switch.
  // It handles its own checked state, disabled state, and offers two color themes (blue and gray).
  // The 'onChange' prop allows a parent component to react to state changes.
};

export default Switch;
