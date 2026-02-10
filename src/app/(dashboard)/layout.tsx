"use client";

import { Search, SquarePen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { NotificationDropdown } from "@/core/components/molecule/dashboard/NotificationDropdown";
import { Sidebar } from "@/core/components/molecule/Sidebar";
import type { Post } from "@/core/lib/api-client";
import { useMyPosts, usePublishedPosts } from "@/hook/useStories";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Post | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch both published posts and user's own posts for search
  const { data: publishedData } = usePublishedPosts(1, 50);
  const { data: myPostsData } = useMyPosts(1, 50);

  // Combine and deduplicate posts for search
  const allPosts = [
    ...(publishedData?.posts || []),
    ...(myPostsData?.posts || []),
  ];
  const uniquePosts = allPosts.filter(
    (post, index, self) => index === self.findIndex((p) => p._id === post._id),
  );

  const filteredStories = uniquePosts
    .filter((story) => {
      const query = searchQuery.toLowerCase();
      const title = story.title?.toLowerCase() || "";
      const content =
        story.content?.blocks
          ?.map((block: any) => block.data?.text || "")
          .join(" ")
          .toLowerCase() || "";
      return title.includes(query) || content.includes(query);
    })
    .sort((a, b) => {
      const query = searchQuery.toLowerCase();
      const aTitle = a.title?.toLowerCase() || "";
      const bTitle = b.title?.toLowerCase() || "";
      const aContent =
        a.content?.blocks
          ?.map((block: any) => block.data?.text || "")
          .join(" ")
          .toLowerCase() || "";
      const bContent =
        b.content?.blocks
          ?.map((block: any) => block.data?.text || "")
          .join(" ")
          .toLowerCase() || "";

      const aTitleMatch = aTitle.includes(query);
      const bTitleMatch = bTitle.includes(query);
      const aContentMatch = aContent.includes(query);
      const bContentMatch = bContent.includes(query);

      // Title matches before content matches
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      // Exact title match first
      if (aTitle === query) return -1;
      if (bTitle === query) return 1;

      // Title starts with query
      const aTitleStarts = aTitle.startsWith(query);
      const bTitleStarts = bTitle.startsWith(query);
      if (aTitleStarts && !bTitleStarts) return -1;
      if (!aTitleStarts && bTitleStarts) return 1;

      // Alphabetical by title
      return aTitle.localeCompare(bTitle);
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStoryClick = (story: any) => {
    setSearchQuery("");
    setShowResults(false);
    setSelectedStory(story);
  };

  const clearSelectedStory = () => {
    setSelectedStory(null);
  };

  // Helper to get author name from authorId (which can be populated object or string)
  const getAuthorName = (story: any) => {
    if (typeof story.authorId === "object" && story.authorId?.name) {
      return story.authorId.name;
    }
    return "Unknown";
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Minimal Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-12 shrink-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />

              {/* Search Results Dropdown */}
              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50 divide-y divide-gray-100">
                  {filteredStories.length > 0 ? (
                    filteredStories.slice(0, 10).map((story: any) => (
                      <button
                        key={story._id}
                        type="button"
                        onClick={() => handleStoryClick(story)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                          {story.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          by {getAuthorName(story)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No stories found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Write Button */}
            <Link
              href="/new-story"
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <SquarePen className="w-4 h-4" />
              Write
            </Link>

            {/* User Profile */}
            <Link
              href="/me/profile"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
              title="Profile"
            >
              {user?.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Selected Story from Search */}
            {selectedStory && (
              <div className="mb-8 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Story Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-3">
                        Search Result
                      </p>
                      <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                        {selectedStory.title || "Untitled"}
                      </h1>
                      {selectedStory.subtitle && (
                        <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                          {selectedStory.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">
                            by {getAuthorName(selectedStory)}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{selectedStory.readingTime || 1} min read</span>
                        {selectedStory.publishedAt && (
                          <>
                            <span>•</span>
                            <span className="font-medium">
                              {new Date(
                                selectedStory.publishedAt,
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedStory}
                      className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-8">
                  <div className="prose prose-lg prose-gray max-w-none">
                    {selectedStory.content?.blocks?.map((block: any) => {
                      const blockKey =
                        block.id ||
                        `${block.type}-${block.data?.text?.slice(0, 20) || Math.random()}`;
                      if (block.type === "paragraph") {
                        return (
                          <p
                            key={blockKey}
                            className="text-gray-700 leading-relaxed mb-6 text-lg"
                          >
                            {block.data?.text || ""}
                          </p>
                        );
                      }
                      if (block.type === "header") {
                        const HeadingTag =
                          `h${block.data?.level || 2}` as keyof React.JSX.IntrinsicElements;
                        return (
                          <HeadingTag
                            key={blockKey}
                            className="font-bold text-gray-900 mt-8 mb-4 leading-tight"
                          >
                            {block.data?.text || ""}
                          </HeadingTag>
                        );
                      }
                      if (block.type === "list") {
                        const ListTag =
                          block.data?.style === "ordered" ? "ol" : "ul";
                        return (
                          <ListTag
                            key={blockKey}
                            className="list-inside mb-6 text-gray-700 text-lg leading-relaxed"
                          >
                            {block.data?.items?.map((item: string) => (
                              <li key={item} className="mb-2">
                                {item}
                              </li>
                            ))}
                          </ListTag>
                        );
                      }
                      if (block.type === "image") {
                        const imgSrc = block.data?.file?.url || block.data?.url;
                        return imgSrc ? (
                          <Image
                            key={blockKey}
                            src={imgSrc}
                            alt={block.data?.caption || "Story image"}
                            width={800}
                            height={450}
                            className="rounded-xl my-8 max-w-full h-auto shadow-md"
                            unoptimized
                          />
                        ) : null;
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Story Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {selectedStory.viewCount !== undefined && (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">
                          {selectedStory.viewCount}
                        </span>{" "}
                        views
                      </span>
                    )}
                    {selectedStory.likeCount !== undefined && (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">
                          {selectedStory.likeCount}
                        </span>{" "}
                        likes
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/story/${selectedStory.slug}`)}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}
