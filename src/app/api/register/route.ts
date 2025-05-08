import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    // Ensure the user is authenticated with Clerk
    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate the input
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, company } = result.data;

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      // Update existing user with new information
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, company },
      });

      return NextResponse.json(
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            company: updatedUser.company,
          },
        },
        { status: 200 }
      );
    }

    // Create new user record in our database linked to Clerk user
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        company,
        email: "user@example.com", // This would be fetched from Clerk in a real implementation
      },
    });

    // Return success
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          company: user.company,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
