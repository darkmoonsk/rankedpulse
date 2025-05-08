import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Function to get the Prisma user associated with the current Clerk user
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find the user in the database
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

// Helper function to ensure user exists in our database
export async function ensureUserInDatabase() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // If not, create a new user record
  if (!user) {
    // Get user info from Clerk (this would require additional API calls
    // that we can't implement here without the actual Clerk API keys)
    // For now, we'll create a minimal record
    user = await prisma.user.create({
      data: {
        id: userId,
        email: "user@example.com", // This would be replaced with actual user email from Clerk
        name: "User", // This would be replaced with actual user name from Clerk
      },
    });
  }

  return user;
}
