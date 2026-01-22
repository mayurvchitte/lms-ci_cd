import { serverUrl } from "../App";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = "http://localhost:5173/auth/callback";
const SCOPE = "openid email profile";

class GoogleAuth {
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      state: state ? JSON.stringify(state) : undefined
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleCallback(code) {
    const response = await fetch(`${serverUrl}/api/auth/google/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Google authentication failed");
    }

    return response.json(); // { user }
  }
}

export default new GoogleAuth();
