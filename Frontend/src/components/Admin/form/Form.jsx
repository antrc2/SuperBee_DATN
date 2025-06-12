import React from "react"; // Import React for JSX

const Form = ({ onSubmit, children, className }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault(); // Prevent default browser form submission behavior
        onSubmit(event); // Call the onSubmit handler passed as a prop
      }}
      className={` ${className}`} // Apply any additional custom classes
    >
      {children} {/* Render child components passed to the Form */}
    </form>
  );
};

export default Form;
