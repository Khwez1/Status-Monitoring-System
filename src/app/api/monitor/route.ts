// app/api/monitor/route.ts
import { checkSite } from '@/../service/statusService';

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await checkSite();
  return Response.json({ ok: true });
}