import { Hono } from 'hono';
import { db, entries } from '../db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const apiRouter = new Hono();

const UpdateSchema = z.object({
  status: z.enum(['new', 'reviewed', 'rejected']).optional(),
  comment: z.string().optional(),
  starred: z.boolean().optional(),
});

// Update entry status/comment/starred
apiRouter.patch('/entries/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  const result = UpdateSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error }, 400);
  }

  const updateData = {
    ...result.data,
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(entries)
    .set(updateData)
    .where(eq(entries.id, id))
    .returning();

  if (!updated) {
    return c.notFound();
  }

  return c.json(updated);
});

// Health check
apiRouter.get('/health', (c) => {
  return c.json({ status: 'ok' });
});