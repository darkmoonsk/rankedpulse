import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({ clockSkewInMs: 120000 });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
