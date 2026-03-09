import { withAuth } from "next-auth/middleware";

// This default export wraps your entire app in NextAuth's authentication check
export default withAuth({
  pages: {
    signIn: "/", // If unauthenticated, redirect them to your home page (or custom sign-in page)
  },
});

// The matcher explicitly defines which routes require authentication
export const config = {
  matcher: [
    "/dashboard/:path*", // Protects /dashboard and any sub-pages like /dashboard/settings
    "/video/:path*",    // Protects your recording studio route
  ],
};