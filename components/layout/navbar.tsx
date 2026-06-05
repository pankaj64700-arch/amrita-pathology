"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        
        {/* Logo */}
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-blue-600">
            AMRITA PATHOLOGY
          </span>

          <span className="text-xs text-slate-500">
            Ankit Kumar Yadav
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/tests"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Tests
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Contact
          </Link>

          <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Book Test
          </button>
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-6 w-6 text-slate-700" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            <Link href="/" className="text-slate-700">
              Home
            </Link>

            <Link href="/tests" className="text-slate-700">
              Tests
            </Link>

            <Link href="/about" className="text-slate-700">
              About
            </Link>

            <Link href="/contact" className="text-slate-700">
              Contact
            </Link>

            <button className="rounded-xl bg-blue-600 px-4 py-2 text-white">
              Book Test
            </button>
          </div>
        </div>
      )}
    </header>
  );
}