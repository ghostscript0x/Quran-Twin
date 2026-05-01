import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL || "https://prelive-oauth2.quran.foundation";
const API_BASE_URL = process.env.API_BASE_URL || "https://apis-prelive.quran.foundation";

function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generatePkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = base64url(hash);
  return { codeVerifier, codeChallenge };
}

function randomString(bytes = 16) {
  return base64url(crypto.randomBytes(bytes));
}

let pendingAuth = {};
const AUTH_EXPIRY_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const state in pendingAuth) {
    if (now - pendingAuth[state].createdAt > AUTH_EXPIRY_MS) {
      delete pendingAuth[state];
    }
  }
}, AUTH_EXPIRY_MS);

export async function findOrCreateUser(sub, accessToken, refreshToken, profile) {
  const existing = await prisma.user.findUnique({ where: { sub } });

  if (existing) {
    return prisma.user.update({
      where: { sub },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        ...(profile.email && { email: profile.email }),
        ...(profile.username && { username: profile.username }),
        ...(profile.firstName && { firstName: profile.firstName }),
        ...(profile.lastName && { lastName: profile.lastName }),
        ...(profile.avatar && { avatar: profile.avatar }),
      },
    });
  }

  return prisma.user.create({
    data: {
      sub,
      email: profile.email || null,
      username: profile.username || null,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      avatar: profile.avatar || null,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserBySub(sub) {
  return prisma.user.findUnique({
    where: { sub },
  });
}

export async function updateUserTokens(sub, accessToken, refreshToken) {
  return prisma.user.update({
    where: { sub },
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
}

export async function clearUserTokens(sub) {
  return prisma.user.update({
    where: { sub },
    data: {
      access_token: null,
      refresh_token: null,
    },
  });
}

export function decodeIdToken(idToken) {
  try {
    return jwt.decode(idToken, { complete: true });
  } catch {
    return null;
  }
}

export async function fetchUserProfile(accessToken, clientId) {
  const url = `${API_BASE_URL}/quran-reflect/v1/users/profile`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-auth-token": accessToken,
        "x-client-id": clientId,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No response body");
      logger.error(`fetchUserProfile failed [${response.status}]: ${errorText}`);
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeout);
    logger.error("fetchUserProfile error:", err.message);
    throw err;
  }
}

export function buildAuthorizeUrl(clientId, redirectUri) {
  const state = randomString(16);
  const nonce = randomString(16);
  const { codeVerifier, codeChallenge } = generatePkcePair();

  pendingAuth[state] = { codeVerifier, nonce, redirectUri, createdAt: Date.now() };

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid offline_access user note",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { url: `${OAUTH_BASE_URL}/oauth2/auth?${params.toString()}`, state };
}

export function getPendingAuth(state) {
  const auth = pendingAuth[state];
  delete pendingAuth[state];
  return auth;
}

export async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri, codeVerifier) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("code_verifier", codeVerifier);

  const response = await fetch(`${OAUTH_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to exchange code for tokens");
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
  };
}

export async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const response = await fetch(`${OAUTH_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to refresh token");
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

export async function refreshTokenIfNeeded(sub, accessToken, refreshToken) {
  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    const decoded = jwt.decode(accessToken);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const expiresIn = decoded.exp * 1000 - Date.now();
    if (expiresIn > 5 * 60 * 1000) {
      return { accessToken, needsRefresh: false };
    }

    logger.info(`Token expiring soon for user ${sub}, refreshing...`);
    const clientId = process.env.QURAN_CLIENT_ID;
    const clientSecret = process.env.QURAN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    const newTokens = await refreshAccessToken(refreshToken, clientId, clientSecret);
    await updateUserTokens(sub, newTokens.accessToken, newTokens.refreshToken);

    logger.info(`Token refreshed for user ${sub}`);
    return { accessToken: newTokens.accessToken, needsRefresh: true };
  } catch (err) {
    logger.error("Token refresh failed:", err.message);
    return null;
  }
}