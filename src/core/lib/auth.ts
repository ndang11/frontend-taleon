import Cookies from "js-cookie";
import type { AuthResponse } from "../../core/types/auth.types";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  tenantId?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  username?: string;
  subdomain?: string;
  customDomain?: string;
  digestFrequency?: "daily" | "weekly" | "off";
  feedbackOptIn?: boolean;
  allowPrivateNotes?: boolean;
  allowEmailReplies?: boolean;
  replyToEmail?: string;
  notifNewMediumDigest?: boolean;
  notifRecommendedReading?: boolean;
  notifSavedListStories?: boolean;
  notifFollowsHighlights?: boolean;
  notifRepliesToResponses?: boolean;
  notifStoryMentions?: "in_network" | "off";
  notifActivityOnPublished?: boolean;
  notifActivityOnLists?: boolean;
  notifEditorsFeatureStories?: boolean;
  notifNewSubmissions?: boolean;
  notifSubmissionStatusChanges?: boolean;
  notifNewProductFeatures?: boolean;
  notifMembershipInfo?: boolean;
  googleConnected?: boolean;
  mastodonAccountCreated?: boolean;
  mastodonConnected?: boolean;
  facebookConnected?: boolean;
  xConnected?: boolean;
  lastSignOutOthersAt?: string | null;
  followersCount?: number;
  followingCount?: number;
}

export function setAuthData(data: AuthResponse) {
  // Store both the token and user info
  // Use localStorage for token
  localStorage.setItem("access_token", data.accessToken);

  Cookies.set("auth_user", JSON.stringify(data.user), { expires: 7 });
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getUser(): User | null {
  try {
    const userCookie = Cookies.get(USER_KEY);

    // Check if cookie exists and is not the string "undefined"
    if (!userCookie || userCookie === "undefined" || userCookie.trim() === "") {
      return null;
    }

    // Safely parse JSON
    const user = JSON.parse(userCookie);

    // Validate the user object has required properties
    if (
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      typeof user.email === "string" &&
      typeof user.name === "string"
    ) {
      return user as User;
    }

    // If validation fails, log in development and return null
    if (process.env.NODE_ENV === "development") {
      console.warn("Invalid user data in cookie:", user);
    }

    return null;
  } catch (error) {
    // Log parsing errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to parse user cookie:", error);
    }
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
