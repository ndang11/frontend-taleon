"use client";

import Cookies from "js-cookie";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { getUserProfile, updateUserProfile } from "@/core/lib/api-client";
import { clearAuthData } from "@/core/lib/auth";

type SettingsTab =
  | "account"
  | "publishing"
  | "notifications"
  | "membership"
  | "security";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "publishing", label: "Publishing" },
  { id: "notifications", label: "Notifications" },
  { id: "membership", label: "Membership and payment" },
  { id: "security", label: "Security and apps" },
];

type DigestFrequency = "daily" | "weekly" | "off";
type ConfirmAction = "deactivate" | "delete" | null;
type StoryMentionsSetting = "in_network" | "off";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [subdomain, setSubdomain] = useState(user?.subdomain || "");
  const [customDomain, setCustomDomain] = useState(user?.customDomain || "");
  const [isEditingCustomDomain, setIsEditingCustomDomain] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState<DigestFrequency>(
    (user?.digestFrequency as DigestFrequency) || "daily",
  );
  const [feedbackOptIn, setFeedbackOptIn] = useState<boolean>(
    !!user?.feedbackOptIn,
  );
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [profileLocation, setProfileLocation] = useState(user?.location || "");
  const [profileWebsite, setProfileWebsite] = useState(user?.website || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [allowPrivateNotes, setAllowPrivateNotes] = useState<boolean>(
    !!user?.allowPrivateNotes,
  );
  const [allowEmailReplies, setAllowEmailReplies] = useState<boolean>(
    !!user?.allowEmailReplies,
  );
  const [replyToEmail, setReplyToEmail] = useState(
    user?.replyToEmail || user?.email || "",
  );
  const [isEditingReplyToEmail, setIsEditingReplyToEmail] = useState(false);
  const [isSavingPublishing, setIsSavingPublishing] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notifNewTaleonDigest, setNotifNewTaleonDigest] = useState<boolean>(
    user?.notifNewTaleonDigest ?? true,
  );
  const [notifRecommendedReading, setNotifRecommendedReading] =
    useState<boolean>(user?.notifRecommendedReading ?? true);
  const [notifSavedListStories, setNotifSavedListStories] = useState<boolean>(
    user?.notifSavedListStories ?? true,
  );
  const [notifFollowsHighlights, setNotifFollowsHighlights] = useState<boolean>(
    user?.notifFollowsHighlights ?? true,
  );
  const [notifRepliesToResponses, setNotifRepliesToResponses] =
    useState<boolean>(user?.notifRepliesToResponses ?? true);
  const [notifStoryMentions, setNotifStoryMentions] =
    useState<StoryMentionsSetting>(
      (user?.notifStoryMentions as StoryMentionsSetting) || "in_network",
    );
  const [notifActivityOnPublished, setNotifActivityOnPublished] =
    useState<boolean>(user?.notifActivityOnPublished ?? true);
  const [notifActivityOnLists, setNotifActivityOnLists] = useState<boolean>(
    user?.notifActivityOnLists ?? true,
  );
  const [notifEditorsFeatureStories, setNotifEditorsFeatureStories] =
    useState<boolean>(user?.notifEditorsFeatureStories ?? true);
  const [notifNewSubmissions, setNotifNewSubmissions] = useState<boolean>(
    user?.notifNewSubmissions ?? true,
  );
  const [notifSubmissionStatusChanges, setNotifSubmissionStatusChanges] =
    useState<boolean>(user?.notifSubmissionStatusChanges ?? true);
  const [notifNewProductFeatures, setNotifNewProductFeatures] =
    useState<boolean>(user?.notifNewProductFeatures ?? true);
  const [notifMembershipInfo, setNotifMembershipInfo] = useState<boolean>(
    user?.notifMembershipInfo ?? true,
  );
  const [googleConnected, setGoogleConnected] = useState<boolean>(
    user?.googleConnected !== false,
  );
  const [mastodonAccountCreated, setMastodonAccountCreated] = useState<boolean>(
    !!user?.mastodonAccountCreated,
  );
  const [mastodonConnected, setMastodonConnected] = useState<boolean>(
    !!user?.mastodonConnected,
  );
  const [facebookConnected, setFacebookConnected] = useState<boolean>(
    !!user?.facebookConnected,
  );
  const [xConnected, setXConnected] = useState<boolean>(!!user?.xConnected);
  const [lastSignOutOthersAt, setLastSignOutOthersAt] = useState<string | null>(
    user?.lastSignOutOthersAt || null,
  );
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const userId = user?._id || user?.id || "";
  const normalizedUsername = useMemo(
    () =>
      username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9._-]/g, ""),
    [username],
  );

  const normalizedSubdomain = useMemo(
    () =>
      subdomain
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    [subdomain],
  );

  const normalizedCustomDomain = useMemo(
    () =>
      customDomain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, ""),
    [customDomain],
  );

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="text-center py-10">
          <p className="text-gray-500">Please log in to view your settings.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const token = localStorage.getItem("access_token") || undefined;

    if (!token || !userId) {
      setStatus("You must be logged in to update settings.");
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);

      await updateUserProfile(
        userId,
        {
          username: normalizedUsername,
          subdomain: normalizedSubdomain,
          customDomain: normalizedCustomDomain,
          digestFrequency,
          feedbackOptIn,
        },
        token,
      );

      const freshProfile = await getUserProfile(userId, token);
      Cookies.set("auth_user", JSON.stringify(freshProfile), { expires: 7 });
      await refreshUser();

      setStatus("Settings updated successfully.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const openProfileModal = () => {
    setProfileName(user?.name || "");
    setProfileBio(user?.bio || "");
    setProfileLocation(user?.location || "");
    setProfileWebsite(user?.website || "");
    setProfilePhone(user?.phone || "");
    setIsProfileModalOpen(true);
  };

  const handleSaveProfileInformation = async () => {
    const token = localStorage.getItem("access_token") || undefined;

    if (!token || !userId) {
      setStatus("You must be logged in to update your profile information.");
      return;
    }

    try {
      setIsSavingProfile(true);
      setStatus(null);

      await updateUserProfile(
        userId,
        {
          name: profileName.trim(),
          bio: profileBio.trim(),
          location: profileLocation.trim(),
          website: profileWebsite.trim(),
          phone: profilePhone.trim(),
        },
        token,
      );

      const freshProfile = await getUserProfile(userId, token);
      Cookies.set("auth_user", JSON.stringify(freshProfile), { expires: 7 });
      await refreshUser();

      setIsProfileModalOpen(false);
      setStatus("Profile information updated successfully.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to update profile information.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const persistPublishing = async (
    patch: Partial<{
      allowPrivateNotes: boolean;
      allowEmailReplies: boolean;
      replyToEmail: string;
    }>,
  ) => {
    const token = localStorage.getItem("access_token") || undefined;
    if (!token || !userId) {
      setStatus("You must be logged in to update publishing settings.");
      return;
    }

    try {
      setIsSavingPublishing(true);
      setStatus(null);

      await updateUserProfile(
        userId,
        {
          allowPrivateNotes,
          allowEmailReplies,
          replyToEmail,
          ...patch,
        },
        token,
      );

      const freshProfile = await getUserProfile(userId, token);
      Cookies.set("auth_user", JSON.stringify(freshProfile), { expires: 7 });
      await refreshUser();

      setStatus("Publishing settings updated.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to update publishing settings.");
    } finally {
      setIsSavingPublishing(false);
    }
  };

  const handlePrivateNotesToggle = async (next: boolean) => {
    setAllowPrivateNotes(next);
    await persistPublishing({ allowPrivateNotes: next });
  };

  const handleEmailRepliesToggle = async (next: boolean) => {
    setAllowEmailReplies(next);
    await persistPublishing({ allowEmailReplies: next });
  };

  const handleSaveReplyToEmail = async () => {
    const normalized = replyToEmail.trim().toLowerCase();
    if (!normalized) {
      setStatus("Reply-to email cannot be empty.");
      return;
    }
    await persistPublishing({ replyToEmail: normalized });
    setIsEditingReplyToEmail(false);
  };

  const handleImportSubscribers = () => {
    if (typeof document === "undefined") return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.txt,text/csv,text/plain";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setStatus(`Selected file for import: ${file.name}`);
    };
    input.click();
  };

  const persistNotifications = async (
    patch: Partial<{
      notifNewMediumDigest: boolean;
      notifRecommendedReading: boolean;
      notifSavedListStories: boolean;
      notifFollowsHighlights: boolean;
      notifRepliesToResponses: boolean;
      notifStoryMentions: StoryMentionsSetting;
      notifActivityOnPublished: boolean;
      notifActivityOnLists: boolean;
      notifEditorsFeatureStories: boolean;
      notifNewSubmissions: boolean;
      notifSubmissionStatusChanges: boolean;
      notifNewProductFeatures: boolean;
      notifMembershipInfo: boolean;
    }>,
  ) => {
    const token = localStorage.getItem("access_token") || undefined;
    if (!token || !userId) {
      setStatus("You must be logged in to update notification settings.");
      return;
    }

    try {
      setIsSavingNotifications(true);
      setStatus(null);

      await updateUserProfile(
        userId,
        {
          notifNewTaleonDigest,
          notifRecommendedReading,
          notifSavedListStories,
          notifFollowsHighlights,
          notifRepliesToResponses,
          notifStoryMentions,
          notifActivityOnPublished,
          notifActivityOnLists,
          notifEditorsFeatureStories,
          notifNewSubmissions,
          notifSubmissionStatusChanges,
          notifNewProductFeatures,
          notifMembershipInfo,
          ...patch,
        },
        token,
      );

      const freshProfile = await getUserProfile(userId, token);
      Cookies.set("auth_user", JSON.stringify(freshProfile), { expires: 7 });
      await refreshUser();

      setStatus("Notification settings updated.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to update notification settings.");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const renderNotificationsSection = () => {
    const toggleClasses = "h-4 w-4 rounded border-gray-300 mt-1";

    return (
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Story recommendations
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              New Taleon Digest
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              The best stories on Taleon personalized based on your interests,
              as well as outstanding stories selected by our editors.
            </p>
          </div>
          <input
            type="checkbox"
            checked={notifNewTaleonDigest}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifNewTaleonDigest(next);
              await persistNotifications({ notifNewTaleonDigest: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Recommended reading
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Featured stories, columns, and collections that we think you’ll
              enjoy based on your reading history.
            </p>
          </div>
          <input
            type="checkbox"
            checked={notifRecommendedReading}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifRecommendedReading(next);
              await persistNotifications({ notifRecommendedReading: next });
            }}
          />
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            From writers and publications
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              New stories added to lists you’ve saved
            </h3>
          </div>
          <input
            type="checkbox"
            checked={notifSavedListStories}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifSavedListStories(next);
              await persistNotifications({ notifSavedListStories: next });
            }}
          />
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Social activity
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Follows and matching highlights
          </h3>
          <input
            type="checkbox"
            checked={notifFollowsHighlights}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifFollowsHighlights(next);
              await persistNotifications({ notifFollowsHighlights: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Replies to your responses
          </h3>
          <input
            type="checkbox"
            checked={notifRepliesToResponses}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifRepliesToResponses(next);
              await persistNotifications({ notifRepliesToResponses: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Story mentions
          </h3>
          <select
            value={notifStoryMentions}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-green-700 focus:outline-none focus:ring-2"
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.value as StoryMentionsSetting;
              setNotifStoryMentions(next);
              await persistNotifications({ notifStoryMentions: next });
            }}
          >
            <option value="in_network">In network</option>
            <option value="off">Off</option>
          </select>
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">For writers</h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Activity on your published stories
          </h3>
          <input
            type="checkbox"
            checked={notifActivityOnPublished}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifActivityOnPublished(next);
              await persistNotifications({ notifActivityOnPublished: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Activity on your lists
          </h3>
          <input
            type="checkbox"
            checked={notifActivityOnLists}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifActivityOnLists(next);
              await persistNotifications({ notifActivityOnLists: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            From editors about featuring your stories
          </h3>
          <input
            type="checkbox"
            checked={notifEditorsFeatureStories}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifEditorsFeatureStories(next);
              await persistNotifications({ notifEditorsFeatureStories: next });
            }}
          />
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            For publications
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            New submissions
          </h3>
          <input
            type="checkbox"
            checked={notifNewSubmissions}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifNewSubmissions(next);
              await persistNotifications({ notifNewSubmissions: next });
            }}
          />
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            For submissions
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Submission status changes
          </h3>
          <input
            type="checkbox"
            checked={notifSubmissionStatusChanges}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifSubmissionStatusChanges(next);
              await persistNotifications({
                notifSubmissionStatusChanges: next,
              });
            }}
          />
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Others from Taleon
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            New product features from Taleon
          </h3>
          <input
            type="checkbox"
            checked={notifNewProductFeatures}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifNewProductFeatures(next);
              await persistNotifications({ notifNewProductFeatures: next });
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Information about Taleon membership
          </h3>
          <input
            type="checkbox"
            checked={notifMembershipInfo}
            className={toggleClasses}
            disabled={isSavingNotifications}
            onChange={async (event) => {
              const next = event.target.checked;
              setNotifMembershipInfo(next);
              await persistNotifications({ notifMembershipInfo: next });
            }}
          />
        </div>
      </div>
    );
  };

  const persistSecurity = async (
    patch: Partial<{
      googleConnected: boolean;
      mastodonAccountCreated: boolean;
      mastodonConnected: boolean;
      facebookConnected: boolean;
      xConnected: boolean;
      lastSignOutOthersAt: string | null;
    }>,
  ) => {
    const token = localStorage.getItem("access_token") || undefined;
    if (!token || !userId) {
      setStatus("You must be logged in to update security settings.");
      return;
    }

    try {
      setIsSavingSecurity(true);
      setStatus(null);

      await updateUserProfile(
        userId,
        {
          googleConnected,
          mastodonAccountCreated,
          mastodonConnected,
          facebookConnected,
          xConnected,
          lastSignOutOthersAt,
          ...patch,
        },
        token,
      );

      const freshProfile = await getUserProfile(userId, token);
      Cookies.set("auth_user", JSON.stringify(freshProfile), { expires: 7 });
      await refreshUser();
      setStatus("Security settings updated.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to update security settings.");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSignOutOtherSessions = async () => {
    const now = new Date().toISOString();
    setLastSignOutOthersAt(now);
    await persistSecurity({ lastSignOutOthersAt: now });
  };

  const handleDownloadInformation = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        username,
        subdomain,
      },
      profile: {
        bio: user.bio,
        location: user.location,
        website: user.website,
      },
      settings: {
        digestFrequency,
        feedbackOptIn,
        allowPrivateNotes,
        allowEmailReplies,
        replyToEmail,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "taleon-account-export.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Your information download has started.");
  };

  const connectAction = async (
    provider: "mastodon-create" | "mastodon" | "facebook" | "x" | "google",
  ) => {
    if (provider === "mastodon-create") {
      setMastodonAccountCreated(true);
      window.open("https://joinmastodon.org", "_blank", "noopener,noreferrer");
      await persistSecurity({ mastodonAccountCreated: true });
      return;
    }

    if (provider === "mastodon") {
      const next = !mastodonConnected;
      setMastodonConnected(next);
      await persistSecurity({ mastodonConnected: next });
      return;
    }

    if (provider === "facebook") {
      const next = !facebookConnected;
      setFacebookConnected(next);
      await persistSecurity({ facebookConnected: next });
      return;
    }

    if (provider === "x") {
      const next = !xConnected;
      setXConnected(next);
      await persistSecurity({ xConnected: next });
      return;
    }

    if (provider === "google") {
      const next = !googleConnected;
      setGoogleConnected(next);
      await persistSecurity({ googleConnected: next });
    }
  };

  const renderSecuritySection = () => {
    const actionClass =
      "text-sm font-semibold text-gray-900 hover:text-black disabled:opacity-60";

    return (
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <div className="p-5">
          <button
            type="button"
            onClick={handleSignOutOtherSessions}
            className="text-sm font-semibold text-red-500 hover:text-red-600"
            disabled={isSavingSecurity}
          >
            Sign out of all other sessions
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Sign out of sessions in other browsers or on other computers.
          </p>
          {lastSignOutOthersAt && (
            <p className="text-xs text-gray-400 mt-1">
              Last action: {new Date(lastSignOutOthersAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="p-5">
          <button
            type="button"
            onClick={handleDownloadInformation}
            className={actionClass}
            disabled={isSavingSecurity}
          >
            Download your information
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Download a copy of the information you’ve shared on Taleon to a
            .json file.
          </p>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Create Mastodon account on @me.dm
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Join our premium instance exclusively for members at me.dm.
            </p>
          </div>
          <button
            type="button"
            onClick={() => connectAction("mastodon-create")}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Create Mastodon account"
            disabled={isSavingSecurity}
          >
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Connect Mastodon
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add an existing Mastodon account from another instance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => connectAction("mastodon")}
            className={actionClass}
            disabled={isSavingSecurity}
          >
            {mastodonConnected ? "Connected" : "Connect"}
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Connect Facebook
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              We will never post to Facebook or message your friends without
              your permission.
            </p>
          </div>
          <button
            type="button"
            onClick={() => connectAction("facebook")}
            className={actionClass}
            disabled={isSavingSecurity}
          >
            {facebookConnected ? "Connected" : "Connect"}
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Connect X</h3>
            <p className="text-sm text-gray-500 mt-1">
              We will never post to X or message your followers without your
              permission.
            </p>
          </div>
          <button
            type="button"
            onClick={() => connectAction("x")}
            className={actionClass}
            disabled={isSavingSecurity}
          >
            {xConnected ? "Connected" : "Connect"}
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <button
              type="button"
              onClick={() => connectAction("google")}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
              disabled={isSavingSecurity}
            >
              {googleConnected ? "Disconnect Google" : "Connect Google"}
            </button>
            <p className="text-sm text-gray-500 mt-1">
              {googleConnected
                ? "You can now sign in to Taleon using your Google account."
                : "Google account is currently disconnected."}
            </p>
          </div>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    );
  };

  const handleDeactivateAccount = async () => {
    if (isDeactivating || isDeleting) return;
    setConfirmAction("deactivate");
  };

  const executeDeactivateAccount = async () => {
    if (isDeactivating || isDeleting) return;

    try {
      setIsDeactivating(true);
      setConfirmAction(null);
      clearAuthData();
      setStatus("Your account has been deactivated for this session.");
      router.push("/login");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeleting || isDeactivating) return;
    setConfirmAction("delete");
  };

  const executeDeleteAccount = async () => {
    if (isDeleting || isDeactivating) return;

    const token = localStorage.getItem("access_token");

    if (!token || !userId) {
      setStatus("You must be logged in to delete your account.");
      return;
    }

    try {
      setIsDeleting(true);
      setConfirmAction(null);
      setStatus(null);

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://taleon-7rwt.onrender.com/api";

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      clearAuthData();
      setStatus("Your account has been deleted.");
      router.push("/register");
    } catch (error: any) {
      setStatus(error?.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "deactivate") {
      await executeDeactivateAccount();
      return;
    }

    if (confirmAction === "delete") {
      await executeDeleteAccount();
    }
  };

  const renderAccountSection = () => {
    return (
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Email address
            </h2>
          </div>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div className="w-full max-w-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              Username and subdomain
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Choose your profile handle and public subdomain.
            </p>
          </div>
          <div className="w-full max-w-md space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
            <input
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value)}
              placeholder="your-subdomain"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
            <p className="text-xs text-gray-500">
              @{normalizedUsername || "username"}
            </p>
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Profile information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Edit your photo, name, pronouns, short bio, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={openProfileModal}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Edit
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Custom domain
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Upgrade to redirect your profile to a custom domain.
            </p>
          </div>
          <div className="w-full max-w-md space-y-2 text-right">
            {isEditingCustomDomain ? (
              <>
                <input
                  value={customDomain}
                  onChange={(event) => setCustomDomain(event.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDomain(user?.customDomain || "");
                      setIsEditingCustomDomain(false);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomDomain(false)}
                    className="text-xs font-medium text-gray-900 hover:text-black"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <p className="text-sm text-gray-500">
                  {normalizedCustomDomain || "None"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingCustomDomain(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Your Digest frequency
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Adjust how often you see a new Digest.
            </p>
          </div>
          <select
            value={digestFrequency}
            onChange={(event) =>
              setDigestFrequency(event.target.value as DigestFrequency)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-green-700 focus:outline-none focus:ring-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="off">Off</option>
          </select>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Provide feedback
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Receive occasional invitations to share feedback.
            </p>
          </div>
          <input
            type="checkbox"
            checked={feedbackOptIn}
            onChange={(event) => setFeedbackOptIn(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 mt-1"
          />
        </div>

        <div className="p-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>
    );
  };

  const renderPlaceholderSection = (title: string) => {
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          This section follows the same settings structure and can be expanded
          with dedicated backend actions.
        </p>
      </div>
    );
  };

  const renderPublishingSection = () => {
    return (
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Manage publications
          </h2>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Allow readers to leave private notes on your stories
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Private notes are visible to you and (if left in a publication)
              all Editors of the publication.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowPrivateNotes}
            onChange={(event) => handlePrivateNotesToggle(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 mt-1"
            disabled={isSavingPublishing}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Manage tipping on your stories
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Readers can send you tips through the third-party platform of your
              choice.
            </p>
          </div>
          <p className="text-sm text-gray-400">Disabled</p>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Allow email replies
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Let readers reply to your stories directly from their email.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowEmailReplies}
            onChange={(event) => handleEmailRepliesToggle(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 mt-1"
            disabled={isSavingPublishing}
          />
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              ‘Reply To’ email address
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Shown to your subscribers when they reply.
            </p>
          </div>
          <div className="w-full max-w-xs text-right">
            {isEditingReplyToEmail ? (
              <div className="space-y-2">
                <input
                  value={replyToEmail}
                  onChange={(event) => setReplyToEmail(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  placeholder="you@example.com"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setReplyToEmail(user?.replyToEmail || user?.email || "");
                      setIsEditingReplyToEmail(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-gray-900 hover:text-black"
                    onClick={handleSaveReplyToEmail}
                    disabled={isSavingPublishing}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingReplyToEmail(true)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {replyToEmail || user.email}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 p-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Import email subscribers
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV or TXT file containing up to 25,000 email addresses.
            </p>
          </div>
          <button
            type="button"
            onClick={handleImportSubscribers}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Import subscribers"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6 pb-12">
      <div className="border-b border-gray-200">
        <nav className="flex items-center gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm whitespace-nowrap border-b transition-colors ${
                activeTab === tab.id
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "account" && renderAccountSection()}
        {activeTab === "publishing" && renderPublishingSection()}
        {activeTab === "notifications" && renderNotificationsSection()}
        {activeTab === "membership" &&
          renderPlaceholderSection("Membership and payment")}
        {activeTab === "security" && renderSecuritySection()}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6 space-y-4">
        <div>
          <button
            type="button"
            onClick={handleDeactivateAccount}
            disabled={isDeactivating || isDeleting}
            className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-60"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate account"}
          </button>
          <p className="text-sm text-gray-500">
            Deactivating will suspend your account until you sign back in.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || isDeactivating}
            className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete account"}
          </button>
          <p className="text-sm text-gray-500">
            Permanently delete your account and all your content.
          </p>
        </div>
      </div>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setIsProfileModalOpen(false)}
          />

          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit profile information
              </h3>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Keep your public profile details up to date.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profileBio}
                  onChange={(event) => setProfileBio(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="Tell people about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  value={profileLocation}
                  onChange={(event) => setProfileLocation(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="+123..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  value={profileWebsite}
                  onChange={(event) => setProfileWebsite(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  placeholder="https://your-site.com"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSavingProfile}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfileInformation}
                className="px-4 py-2 rounded-full bg-black text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setConfirmAction(null)}
          />

          <div className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmAction === "delete"
                    ? "Delete account?"
                    : "Deactivate account?"}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {confirmAction === "delete"
                    ? "This action is permanent and cannot be undone. Your account and content will be removed."
                    : "You will be signed out and can reactivate your account by signing in again."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeactivating || isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-full bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={isDeactivating || isDeleting}
              >
                {confirmAction === "delete"
                  ? isDeleting
                    ? "Deleting..."
                    : "Yes, delete"
                  : isDeactivating
                    ? "Deactivating..."
                    : "Yes, deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
