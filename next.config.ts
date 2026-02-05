import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  transpilePackages: [
    "@tiptap/pm",
    "@tiptap/core",
    "@tiptap/react",
    "@tiptap/starter-kit",
    "@tiptap/extension-image",
    "@tiptap/extension-link",
    "@tiptap/extension-placeholder",
    "@tiptap/extension-table",
    "@tiptap/extension-table-cell",
    "@tiptap/extension-table-header",
    "@tiptap/extension-table-row",
    "@tiptap/extension-underline",
    "@tiptap/extension-bubble-menu",
    "@tiptap/extension-floating-menu",
  ],
};

export default nextConfig;
