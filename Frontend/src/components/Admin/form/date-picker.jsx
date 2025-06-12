import React, { useEffect } from "react"; // Import React and useEffect for JSX
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label"; // Assuming Label is in the same directory
import { CalenderIcon } from "@assets/icons"; // Assuming CalenderIcon is available at this path

// No need for type definitions in JSX, they are implicitly handled by JavaScript.
// Hook and DateOption types from flatpickr are for TypeScript only.

export default function DatePicker({
  id,
  mode,
  onChange, // This will be a function or array of functions
  label,
  defaultDate, // This will be a Date object, string, or array of dates/strings
  placeholder
}) {
  useEffect(() => {
    // Initialize flatpickr on the input element with the given ID
    const flatPickrInstance = flatpickr(`#${id}`, {
      mode: mode || "single", // Default to 'single' mode if not specified
      static: true, // Keep the calendar fixed on the screen
      monthSelectorType: "static", // Always show month selector as static dropdown
      dateFormat: "Y-m-d", // Standard date format
      defaultDate, // Set the default selected date(s)
      onChange // Attach the onChange event handler(s)
    });

    // Cleanup function to destroy the flatpickr instance when the component unmounts
    return () => {
      // flatpickr can return an array of instances in some modes (e.g., multiple inputs).
      // Ensure we destroy the correct instance(s).
      if (!Array.isArray(flatPickrInstance)) {
        flatPickrInstance.destroy();
      } else {
        // If it's an array, iterate and destroy each instance
        flatPickrInstance.forEach((instance) => instance.destroy());
      }
    };
  }, [mode, onChange, id, defaultDate]); // Dependencies for useEffect

  return (
    <div>
      {/* Render Label component if label prop is provided */}
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        {/* Input field for the date picker */}
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />

        {/* Calendar icon positioned inside the input field */}
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
