import prisma from "@/db/prisma";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await prisma.subscriber.delete({
      where: { email },
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Subscriber not found" }, { status: 404 });
  }
}