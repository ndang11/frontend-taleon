"use client";

import Cookies from "js-cookie";
import {
  Calendar,
  Check,
  Edit3,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import {
  fetchUserStories,
  getUserProfile,
  type Post,
  type UserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "@/core/lib/api-client";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
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
  const [uploadingImage, setUploadingImage] = useState(false);

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

        // Load user stories
        setStoriesLoading(true);
        try {
          const storiesData = await fetchUserStories(userId, token);
          setStories(storiesData);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const result = await uploadProfileImage(file);

      const userId = authUser?._id || authUser?.id;
      if (userId) {
        const updatedProfile = await updateUserProfile(
          userId,
          { ...formData, avatar: result.url },
          localStorage.getItem("access_token") || undefined,
        );
        setProfile(updatedProfile);
        setFormData((prev) => ({ ...prev, avatar: result.url }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
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
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                {profile.name?.charAt(0) || "U"}
              </div>
            )}
            {isEditing && (
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer rounded-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Edit3 size={20} className="text-white" />
                )}
              </label>
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent pb-1"
                placeholder="Your name"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
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
            </div>
          </div>
        </div>

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

        <div className="md:col-span-2 border-t pt-6 md:border-t-0 md:pt-0">
          <h2 className="text-xl font-bold mb-6">Latest Stories</h2>

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
              {stories.slice(0, 5).map((story) => (
                <div
                  key={story.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <Link href={`/story/${story.slug}`} className="block">
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
                      Views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      Likes
                    </span>
                    <span>
                      {new Date(story.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {stories.length > 5 && (
                <Link
                  href="/me/stories"
                  className="block text-center text-blue-600 hover:underline text-sm mt-4"
                >
                  View all {stories.length} stories
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
