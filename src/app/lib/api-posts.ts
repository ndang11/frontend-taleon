export async function publishPost(postId: string) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/publish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to publish post");
  }

  return response.json();
}
