"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { usePublishPost } from "../../hook/useStories";

export function PublishButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: publish, isPending: isPublishing } = usePublishPost();

  const handlePublish = () => {
    if (!confirm("Ready to go live?")) return;

    publish(postId, {
      onSuccess: () => {
        setShowSuccess(true);
      },
      onError: (error) => {
        setErrorMessage(error.message);
        setShowError(true);
      },
    });
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/dashboard");
  };

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPublishing ? "Publishing..." : "Publish"}
      </button>
      <AlertDialog
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Published!"
        message="Your post has been published successfully."
        buttonText="Go to Dashboard"
        type="success"
        onButtonClick={handleSuccessClose}
      />
      <AlertDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Publish Failed"
        message={
          errorMessage || "An error occurred while publishing your post."
        }
        buttonText="Try Again"
        type="error"
        onButtonClick={() => setShowError(false)}
      />
    </>
  );
}
