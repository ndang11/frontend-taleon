export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  blogName: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    _id?: string;
    email: string;
    name: string;
    tenantId: string;
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
  };
}
