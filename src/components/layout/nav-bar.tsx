"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChartLine, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/auth/user-profile";

export function NavBar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = "/login";
    });
  };

  return (
    <nav className="bg-white shadow border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                RankedPulse
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/dashboard" isActive={isActive("/dashboard")}>
                <FaHome className="mr-2" />
                Dashboard
              </NavLink>
              <NavLink
                href="/dashboard/reports"
                isActive={isActive("/dashboard/reports")}
              >
                <FaChartLine className="mr-2" />
                Reports
              </NavLink>
              <NavLink
                href="/dashboard/settings"
                isActive={isActive("/dashboard/settings")}
              >
                <FaCog className="mr-2" />
                Settings
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <UserProfile />
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
            >
              <FaSignOutAlt className="mr-2" />
              Sign out
            </button>
          </div>
          <div className="flex items-center sm:hidden">
            <Link
              href="#"
              className="text-sm px-3 py-1 rounded bg-blue-600 text-white"
            >
              Menu
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium",
        isActive
          ? "border-blue-500 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      )}
    >
      {children}
    </Link>
  );
}
