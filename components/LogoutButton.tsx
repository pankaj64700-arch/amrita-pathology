"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export default function LogoutButton({
  className = "",
  label = "Logout",
}: LogoutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className}
    >
      {label}
    </button>
  );
}