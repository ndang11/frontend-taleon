"use client";

import { Clock, Search, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchPosts } from "@/core/lib/api-client";
import type { Post } from "@/core/types/post";

interface SearchDropdownProps {
  onClose?: () => void;
}

export function SearchDropdown({ onClose }: SearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      const updated = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);

      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    },
    [recentSearches],
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await searchPosts(query, 1, 5);
          setResults(response.posts || []);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handlePostClick = () => {
    saveSearch(query);
    setIsOpen(false);
    onClose?.();
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      saveSearch(query);
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stories..."
          className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="py-2">
              {/* Show typed query at the top - clickable to search all */}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  saveSearch(query);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 bg-gray-50/50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Search for:{" "}
                    <span className="text-blue-600 font-semibold">
                      &quot;{query}&quot;
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Press Enter or click to see all results
                  </p>
                </div>
              </Link>

              {results.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 bg-gray-50">
                    <TrendingUp className="w-3 h-3" />
                    Top Results ({results.length})
                  </div>
                  {results.map((post) => (
                    <Link
                      key={post._id}
                      href={`/story/${post.slug}`}
                      onClick={handlePostClick}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      {post.image ? (
                        <div className="w-12 h-12 rounded-md overflow-hidden relative shrink-0">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-blue-600">
                            {post.title?.[0]?.toUpperCase() || "S"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {post.subtitle || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span className="font-medium text-gray-600">
                            {typeof post.authorId === "object"
                              ? post.authorId.name
                              : "Unknown"}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {results.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">
                    No posts found for &quot;{query}&quot;
                  </p>
                  <p className="text-xs mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          ) : (
            recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between bg-gray-50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
