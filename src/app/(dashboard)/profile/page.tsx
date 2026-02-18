"use client";

import Cookies from "js-cookie";
import {
  Calendar,
  Check,
  Edit3,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { CoverImage } from "@/core/components/molecule/CoverImage";
import { ProfileImage } from "@/core/components/molecule/ProfileImage";
import {
  fetchUserStories,
  getUserProfile,
  type Post,
  type UserProfile,
  updateUserProfile,
} from "@/core/lib/api-client";

export default function ProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showPostsModal, setShowPostsModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = Cookies.get("auth_token");
      const userId = authUser?._id || authUser?.id;

      if (!userId || !token) {
        if (authUser) {
          setProfile({
            _id: authUser._id || authUser.id,
            name: authUser.name || "User",
            email: authUser.email || "",
            avatar: authUser.avatar,
            coverImage: authUser.coverImage,
            bio: authUser.bio,
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
          });
          setFormData({
            name: authUser.name || "",
            bio: authUser.bio || "",
          });
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserProfile(userId, token);
        setProfile(data);
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
        });
        setCoverImage(data.coverImage || null);

        setStoriesLoading(true);
        try {
          const storiesData = await fetchUserStories(userId, token);
          setStories(storiesData.posts || []);
        } catch (storyErr) {
          console.error("Failed to load stories:", storyErr);
        } finally {
          setStoriesLoading(false);
        }
      } catch (err: any) {
        if (authUser) {
          setProfile({
            _id: authUser._id || authUser.id || "",
            name: authUser.name || "User",
            email: authUser.email || "",
            avatar: authUser.avatar,
            coverImage: authUser.coverImage,
            bio: authUser.bio,
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
          });
          setFormData({
            name: authUser.name || "",
            bio: authUser.bio || "",
          });
          setError("");
        } else {
          setError(err.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadProfile, 100);
    return () => clearTimeout(timer);
  }, [authUser]);

  // Refresh profile when page becomes visible (e.g., after navigating back from following someone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-trigger the profile load
        const token = Cookies.get("auth_token");
        const userId = authUser?._id || authUser?.id;
        if (userId && token) {
          getUserProfile(userId, token)
            .then((data) => {
              setProfile(data);
            })
            .catch(console.error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authUser]);

  const handleCoverImageChange = async (url: string) => {
    const token = localStorage.getItem("access_token");
    const userId = authUser?._id || authUser?.id;

    if (!token || !userId) {
      setCoverImage(url);
      return;
    }

    try {
      setUploadingCover(true);
      const updatedProfile = await updateUserProfile(
        userId,
        { ...formData, coverImage: url },
        token,
      );
      setCoverImage(updatedProfile.coverImage || null);
      setProfile(updatedProfile);
      await refreshUser(); // Refresh auth user data
    } catch (err: any) {
      setError(err.message || "Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");
    const userId = authUser?._id || authUser?.id;

    if (!token || !userId) {
      setProfile((prev) =>
        prev ? { ...prev, name: formData.name, bio: formData.bio } : null,
      );
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await updateUserProfile(userId, formData, token);
      setProfile(updatedProfile);
      await refreshUser(); // Refresh auth user data
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: "name" | "bio", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (url: string) => {
    const token = localStorage.getItem("access_token");
    const userId = authUser?._id || authUser?.id;

    setAvatar(url);

    if (!token || !userId) {
      return;
    }

    try {
      const updatedProfile = await updateUserProfile(
        userId,
        { ...formData, avatar: url },
        token,
      );
      setProfile(updatedProfile);
      await refreshUser(); // Refresh auth user data
    } catch (err: any) {
      setError(err.message || "Failed to update avatar");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="animate-pulse">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return <div className="text-red-500 text-center pt-20">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-gray-500 text-center pt-20">
        No profile data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10">
      <CoverImage
        coverImage={coverImage || profile.coverImage}
        onCoverImageChange={handleCoverImageChange}
        isEditing={isEditing}
        uploading={uploadingCover}
      />

      <div className="relative flex justify-center -mt-12 mb-10">
        <ProfileImage
          avatar={avatar || profile.avatar}
          name={profile.name || "User"}
          onAvatarChange={handleAvatarChange}
          isEditing={isEditing}
          uploading={uploadingCover}
        />
        <div className="ml-6">
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent pb-1"
              placeholder="Your name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          )}
          <p className="text-gray-500">
            @{profile.email?.split("@")[0] || "user"}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm">
              <b>{profile.followersCount}</b> Followers
            </span>
            <span className="text-sm">
              <b>{profile.followingCount}</b> Following
            </span>
            <button
              onClick={() => {
                setShowPostsModal(true);
                document
                  .getElementById("published-posts")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm hover:text-blue-600 transition-colors cursor-pointer"
            >
              <b>{stories.length}</b> Published
            </button>
          </div>
        </div>
        <div className="ml-auto">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 border cursor-pointer rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              About
            </h3>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>

          {profile.location && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {profile.location}
            </div>
          )}
          {profile.website && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Website:</span>{" "}
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Joined{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div
          className="md:col-span-2 border-t pt-6 md:border-t-0 md:pt-0"
          id="published-posts"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Published Posts</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {stories.length} {stories.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {storiesLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-gray-400 italic py-10 border-2 border-dashed rounded-xl text-center">
              No stories published yet. Start writing to share your stories!
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => {
                const authorName =
                  typeof story.authorId === "object" && story.authorId !== null
                    ? (story.authorId as any).name
                    : "Unknown Author";
                const authorAvatar =
                  typeof story.authorId === "object" && story.authorId !== null
                    ? (story.authorId as any).avatar
                    : undefined;
                const isOwnPost =
                  profile._id ===
                  (typeof story.authorId === "object" && story.authorId !== null
                    ? (story.authorId as any)._id
                    : story.authorId);

                return (
                  <div
                    key={story._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    {/* Author info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {authorAvatar ? (
                          <Image
                            src={authorAvatar}
                            alt={authorName}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {authorName}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            •
                            {story.publishedAt
                              ? new Date(story.publishedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : new Date(story.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                          </span>
                        </div>
                      </div>
                      {!isOwnPost && (
                        <button className="text-sm px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                          Follow
                        </button>
                      )}
                    </div>

                    <Link href={`/post/${story._id}`} className="block">
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {story.title || "Untitled Story"}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        No content preview available...
                      </p>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {story.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {story.likeCount || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Published Posts Modal */}
      {showPostsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                Published Posts ({stories.length})
              </h2>
              <button
                onClick={() => setShowPostsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {stories.length === 0 ? (
                <div className="text-gray-400 italic py-10 text-center">
                  No published posts yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <Link
                      key={story._id}
                      href={`/post/${story._id}`}
                      onClick={() => setShowPostsModal(false)}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {story.title || "Untitled Story"}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {story.publishedAt
                            ? new Date(story.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : new Date(story.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {story.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {story.likeCount || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
