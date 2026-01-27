"use client";

import {
  Calendar,
  Edit2,
  Heart,
  MapPin,
  Save,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState("This is my bio");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const profile = {
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    bio: "This is my bio",
    followersCount: 10,
    followingCount: 20,
    _id: "1",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    website: "https://johndoe.blog",
  };

  const updateProfile = (bio: string) => {
    setBioValue(bio);
    setIsEditingBio(false);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-16 w-16 text-white" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {profile.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center">
                  <span className="mr-2">@</span>
                  {profile.email.split("@")[0]}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {profile.joinDate}
                  </div>
                  <a
                    href={profile.website}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>

              {/* Bio Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-900 dark:text-white">
                    About
                  </label>
                  {!isEditingBio ? (
                    <button
                      onClick={() => {
                        setBioValue(profile.bio || "");
                        setIsEditingBio(true);
                      }}
                      className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Bio
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateProfile(bioValue)}
                        className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingBio(false);
                          setBioValue("");
                        }}
                        className="flex items-center px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isEditingBio ? (
                  <textarea
                    value={bioValue}
                    onChange={(e) => setBioValue(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profile.bio || "No bio yet. Click edit to add one!"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          {showConfirmation && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 text-green-800 dark:text-green-200 rounded-2xl border border-green-200 dark:border-green-700 animate-fade-in">
              <div className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Profile updated successfully!
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {profile.followersCount}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Followers
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {profile.followingCount}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Following
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                42
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Posts
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                1.2K
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Views
              </p>
            </div>
            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Posts
              </h2>
              <div className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Getting Started with Multi-Tenant Blogging
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Learn how to create and manage multiple blogs under one
                    account with Taleon...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />2 days ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    24 likes
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    The Future of Content Creation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Exploring new trends in blogging and how AI is changing the
                    landscape...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />1 week ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    18 likes
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Building a Community Around Your Writing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Tips for engaging readers and growing your audience on
                    Taleon...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />2 weeks ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    31 likes
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Posts
              </h2>
              <div className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Getting Started with Multi-Tenant Blogging
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Learn how to create and manage multiple blogs under one
                    account with Taleon...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />2 days ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    24 likes
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    The Future of Content Creation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Exploring new trends in blogging and how AI is changing the
                    landscape...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />1 week ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    18 likes
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Building a Community Around Your Writing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Tips for engaging readers and growing your audience on
                    Taleon...
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />2 weeks ago
                    <Heart className="h-4 w-4 ml-4 mr-1" />
                    31 likes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
