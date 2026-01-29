import { debounce } from "lodash";
import { useCallback, useState } from "react";
import { fetcher } from "@/core/lib/api-client";

export function useEditorAutosave(postId: string) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const debouncedSave = useCallback(
    debounce(async (content: any, title: string) => {
      if (!postId) return;
      setSaveStatus("saving");
      try {
        // Send both content and title to the autosave endpoint
        await fetcher.patch(`/posts/${postId}/autosave`, { content, title });
        setSaveStatus("saved");
      } catch (error) {
        console.error("Autosave failed", error);
        setSaveStatus("error");
      }
    }, 1500), // Reduced to 1.5s for better UX
    [],
  );

  return { debouncedSave, saveStatus };
}
