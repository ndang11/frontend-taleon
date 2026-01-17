"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { EditorComponent } from "../../components/EditorComponent";
import { fetchPost } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

export default function EditEditorPage() {
  const { id } = useParams();
  const token = getToken();

  const { data, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id as string, token || ""),
    enabled: !!id && !!token,
  });

  if (isLoading) return <div>Loading...</div>;

  return <EditorComponent post={data} />;
}
