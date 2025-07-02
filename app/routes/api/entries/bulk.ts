import { createRoute } from 'honox/factory';
import { db, entries } from '@/db';
import { inArray, eq } from 'drizzle-orm';
import { z } from 'zod';
import { handleApiError } from '@/utils/errorHandler';

const BulkOperationSchema = z.object({
  operation: z.enum(['delete', 'star', 'unstar']),
  ids: z.array(z.number()).min(1)
});

export const POST = createRoute(async (c) => {
  try {
    const body = await c.req.json();
    const validated = BulkOperationSchema.parse(body);
    
    const { operation, ids } = validated;
    
    switch (operation) {
      case 'delete':
        await db()
          .delete(entries)
          .where(inArray(entries.id, ids));
        break;
        
      case 'star':
        await db()
          .update(entries)
          .set({ starred: true, updatedAt: new Date() })
          .where(inArray(entries.id, ids));
        break;
        
      case 'unstar':
        await db()
          .update(entries)
          .set({ starred: false, updatedAt: new Date() })
          .where(inArray(entries.id, ids));
        break;
    }
    
    return c.json({ 
      success: true, 
      message: `${ids.length}件の案件を${
        operation === 'delete' ? '削除' : 
        operation === 'star' ? 'スター付け' : 
        'スター解除'
      }しました` 
    });
  } catch (error) {
    return handleApiError(error, c);
  }
});