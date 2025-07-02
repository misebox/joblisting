import { createRoute } from 'honox/factory';
import { db, entries } from '@/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { handleApiError, validateId, AppError } from '@/utils/errorHandler';

const UpdateEntrySchema = z.object({
  status: z.enum(['new', 'reviewed', 'rejected']).optional(),
  comment: z.string().optional(),
  starred: z.boolean().optional()
});

export const PATCH = createRoute(async (c) => {
  try {
    const id = validateId(c.req.param('id'));
    const body = await c.req.json();
    const validated = UpdateEntrySchema.parse(body);
    
    // Check if entry exists
    const [existingEntry] = await db()
      .select({ id: entries.id })
      .from(entries)
      .where(eq(entries.id, id))
      .limit(1);
      
    if (!existingEntry) {
      throw new AppError('Entry not found', 404);
    }
    
    // Update entry
    await db()
      .update(entries)
      .set({
        ...validated,
        updatedAt: new Date()
      })
      .where(eq(entries.id, id));
    
    return c.json({ 
      success: true, 
      message: '案件を更新しました' 
    });
  } catch (error) {
    return handleApiError(error, c);
  }
});