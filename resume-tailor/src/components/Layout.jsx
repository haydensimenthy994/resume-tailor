// src/components/Layout.jsx
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <nav className="space-x-4">
            <a href="#" className="text-sm font-medium">
              Home
            </a>
            <a href="#" className="text-sm font-medium">
              About
            </a>
            <a href="#" className="text-sm font-medium">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Resume Tailor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
