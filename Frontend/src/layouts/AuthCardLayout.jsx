import React from "react";
import SuperBeeLogo from "@components/Client/layout/SuperBeeLogo"; // Giả sử đường dẫn logo
import { Link } from "react-router-dom";

export default function AuthCardLayout({ title, icon, children }) {
  const Icon = icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="w-full max-w-md">
        <div className="bg-content-bg border border-themed rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            {Icon && (
              <div className="w-16 h-16 bg-accent/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Icon className="w-9 h-9 text-accent" />
              </div>
            )}
            <h1 className="font-heading text-2xl font-bold text-primary">
              {title}
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
