"use client";

import { useRouter } from "next/navigation";
import { usePublishPost } from "../../hook/useStories";

export function PublishButton({ postId }: { postId: string }) {
  const router = useRouter();
  const { mutate: publish, isPending: isPublishing } = usePublishPost();

  const handlePublish = () => {
    if (!confirm("Ready to go live?")) return;

    publish(postId, {
      onSuccess: () => {
        alert("Successfully published!");
        router.push("/dashboard");
      },
      onError: (error) => {
        alert(`Error publishing: ${error.message}`);
      },
    });
  };

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50"
    >
      {isPublishing ? "Publishing..." : "Publish"}
    </button>
  );
}
