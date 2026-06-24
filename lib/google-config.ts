export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  // We'll dynamically determine the host, but default to localhost for dev
  redirectUriPath: "/api/auth/callback/google"
}
