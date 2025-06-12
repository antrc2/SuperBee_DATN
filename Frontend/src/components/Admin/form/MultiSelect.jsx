import React, { useState } from "react"; // Import React and useState for JSX

const MultiSelect = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);

  // Toggles the dropdown's open/close state, unless disabled
  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  // Handles selecting/deselecting an option
  const handleSelect = (optionValue) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue) // Deselect if already selected
      : [...selectedOptions, optionValue]; // Select if not already selected

    setSelectedOptions(newSelectedOptions); // Update internal state
    onChange?.(newSelectedOptions); // Notify parent component of the change
  };

  // Handles removing a selected option from the displayed tags
  const removeOption = (value) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions); // Update internal state
    onChange?.(newSelectedOptions); // Notify parent component of the change
  };

  // Map selected option values to their corresponding text for display
  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full">
      {/* Label for the multi-select component */}
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div className="relative z-20 inline-block w-full">
        <div className="relative flex flex-col items-center">
          {/* Clickable area to toggle the dropdown */}
          <div onClick={toggleDropdown} className="w-full">
            <div className="mb-2 flex h-11 rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300">
              <div className="flex flex-wrap flex-auto gap-2">
                {/* Display selected options as tags or a placeholder input */}
                {selectedValuesText.length > 0 ? (
                  selectedValuesText.map((text, index) => (
                    <div
                      key={index} // Using index as key here, but a unique ID from option.value would be better if available
                      className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                    >
                      <span className="flex-initial max-w-full">{text}</span>
                      <div className="flex flex-row-reverse flex-auto">
                        {/* Remove button for each selected option tag */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown from toggling when removing an option
                            removeOption(selectedOptions[index]); // Remove the option by its value
                          }}
                          className="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
                        >
                          {/* SVG for the close icon */}
                          <svg
                            className="fill-current"
                            role="button"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Placeholder input when no options are selected
                  <input
                    placeholder="Select option"
                    className="w-full h-full p-1 pr-2 text-sm bg-transparent border-0 outline-hidden appearance-none placeholder:text-gray-800 focus:border-0 focus:outline-hidden focus:ring-0 dark:placeholder:text-white/90"
                    readOnly
                    value="Select option" // Display "Select option" as value
                  />
                )}
              </div>
              {/* Dropdown arrow button */}
              <div className="flex items-center py-1 pl-1 pr-1 w-7">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400"
                >
                  {/* SVG for the dropdown arrow, rotates when open */}
                  <svg
                    className={`stroke-current ${isOpen ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown options list, shown when isOpen is true */}
          {isOpen && (
            <div
              className="absolute left-0 z-40 w-full overflow-y-auto bg-white rounded-lg shadow-sm top-full max-h-select dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking inside it
            >
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <div
                    key={index} // Using index as key here, a unique ID from option.value would be better
                    className={`hover:bg-primary/5 w-full cursor-pointer rounded-t border-b border-gray-200 dark:border-gray-800`}
                    onClick={() => handleSelect(option.value)} // Select/deselect option on click
                  >
                    <div
                      className={`relative flex w-full items-center p-2 pl-2 ${
                        selectedOptions.includes(option.value)
                          ? "bg-primary/10" // Highlight if selected
                          : ""
                      }`}
                    >
                      <div className="mx-2 leading-6 text-gray-800 dark:text-white/90">
                        {option.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  // This component provides a multi-select dropdown with custom styling.
  // It allows users to select multiple options from a list, which are then displayed as removable tags.
  // It handles dropdown visibility, option selection/deselection, and notifies the parent component of changes.
};

export default MultiSelect;
