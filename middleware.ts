import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pathologist/:path*",
    "/reports/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/request-sample/:path*",
  ],
};