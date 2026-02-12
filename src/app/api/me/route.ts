export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const token = authHeader.substring(7);
  const parts = token.split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
  const tenantId = payload.tenantId;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://taleon-7rwt.onrender.com";
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const token = authHeader.substring(7);
  const parts = token.split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
  const tenantId = payload.tenantId;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://taleon-7rwt.onrender.com";
  const body = await request.json();
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
