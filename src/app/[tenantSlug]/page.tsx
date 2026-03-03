"use client";

import { useState } from "react";
import PostForm from "@/components/PostForm";

export default function TenantPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const [editingPost, setEditingPost] = useState<any>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {params.tenantSlug}
      </h1>

      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
            <PostForm
              post={editingPost}
              onSuccess={() => setEditingPost(null)}
              onCancel={() => setEditingPost(null)}
            />
          </div>
        </div>
      )}

      {/* Rest of the page content */}
    </div>
  );
}
