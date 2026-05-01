import {
  buildAuthorizeUrl,
  getPendingAuth,
  exchangeCodeForTokens,
  findOrCreateUser,
  getUserBySub,
  decodeIdToken,
  fetchUserProfile,
  clearUserTokens,
  refreshTokenIfNeeded,
} from "../services/auth.service.js";
import logger from "../lib/logger.js";

export async function login(req, res) {
  const clientId = process.env.QURAN_CLIENT_ID;
  const redirectUri = process.env.QURAN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: "OAuth configuration missing" });
  }

  const { url, state } = buildAuthorizeUrl(clientId, redirectUri);

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 60 * 1000,
  });

  res.redirect(url);
}

export async function callback(req, res) {
  const { code, error, error_description, state } = req.query;

  if (error) {
    return res.status(400).json({ error: error_description || error });
  }

  if (!code || typeof code !== "string" || code.length > 1000) {
    return res.status(400).json({ error: "Authorization code missing or invalid" });
  }

  if (typeof state !== "string" || state.length > 200) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  const storedState = req.cookies.oauth_state;
  if (!storedState || storedState !== state) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  const pendingAuth = getPendingAuth(state);
  if (!pendingAuth) {
    return res.status(400).json({ error: "Invalid or expired state" });
  }

  const { codeVerifier, redirectUri } = pendingAuth;
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: "OAuth configuration missing" });
  }

  res.clearCookie("oauth_state");

  try {
    const tokens = await exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri,
      codeVerifier
    );

    const idToken = decodeIdToken(tokens.idToken);
    if (!idToken || !idToken.payload || !idToken.payload.sub) {
      throw new Error("Invalid ID token");
    }

    const sub = idToken.payload.sub;

    const profile = {
      email: idToken.payload.email || null,
      username: idToken.payload.username || null,
      firstName: idToken.payload.first_name || null,
      lastName: idToken.payload.last_name || null,
      avatar: idToken.payload.avatar || null,
    };

    const user = await findOrCreateUser(sub, tokens.accessToken, tokens.refreshToken, profile);

    fetchUserProfile(tokens.accessToken, clientId)
      .then((apiProfile) => {
        if (apiProfile) {
          findOrCreateUser(sub, tokens.accessToken, tokens.refreshToken, {
            email: apiProfile.email || profile.email,
            username: apiProfile.username || profile.username,
            firstName: apiProfile.first_name || profile.firstName,
            lastName: apiProfile.last_name || profile.lastName,
            avatar: apiProfile.photoUrl || profile.avatar,
          }).then(() => logger.info("User profile updated"))
            .catch((err) => logger.error("Failed to update user:", err.message));
        }
      })
      .catch((err) => logger.error("Failed to fetch profile:", err.message));

    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("user_sub", sub, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000/dashboard");
  } catch (err) {
    logger.error("OAuth callback error:", err.message);
    res.status(500).json({ error: "Failed to complete authentication" });
  }
}

export async function status(req, res) {
  const userSub = req.cookies.user_sub;
  const accessToken = req.cookies.access_token;

  if (!userSub || !accessToken) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const user = await getUserBySub(userSub);
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    const tokenResult = await refreshTokenIfNeeded(userSub, accessToken, user.refresh_token);

    res.json({
      authenticated: true,
      tokenRefreshed: tokenResult?.needsRefresh || false,
      user: {
        sub: user.sub,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    logger.error("Status error:", err.message);
    res.status(401).json({ authenticated: false });
  }
}

export async function logout(req, res) {
  const userSub = req.cookies.user_sub;

  try {
    if (userSub) {
      await clearUserTokens(userSub);
    }
  } catch (err) {
    logger.error("Error clearing tokens:", err.message);
  }

  res.clearCookie("access_token");
  res.clearCookie("user_sub");
  res.json({ loggedOut: true });
}