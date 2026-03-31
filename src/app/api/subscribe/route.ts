import prisma from "@/db/prisma";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await prisma.subscriber.create({
      data: { email },
    });
    return Response.json({ ok: true });
  } catch {
    // unique constraint means they're already subscribed
    return Response.json({ error: "Already subscribed" }, { status: 409 });
  }
}