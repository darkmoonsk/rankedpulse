"use client";

import { useUser } from "@clerk/nextjs";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading user profile...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="flex items-center space-x-4">
      {user.imageUrl && (
        <img
          src={user.imageUrl}
          alt="Profile"
          className="h-10 w-10 rounded-full"
        />
      )}
      <div>
        <div className="font-medium text-gray-900">{user.fullName}</div>
        <div className="text-sm text-gray-500">
          {user.primaryEmailAddress?.emailAddress}
        </div>
      </div>
    </div>
  );
}
