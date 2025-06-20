// ViewImage.jsx
import React from "react";

export default function Image({ url, alt = "Image", className = "" }) {
  const urlBE = import.meta.env.VITE_BACKEND_IMG;
  const imageUrl = `${urlBE}${url}`;

  return <img src={imageUrl} alt={alt} className={className} />;
}
