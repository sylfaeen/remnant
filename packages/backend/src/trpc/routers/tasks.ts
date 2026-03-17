import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { router } from '@remnant/backend/trpc';
import { requirePermission } from '@remnant/backend/trpc/middlewares/auth';
import { rateLimitedPermission } from '@remnant/backend/trpc/middlewares/rate-limit';
import { db } from '@remnant/backend/db';
import { scheduledTasks, taskExecutions, type TaskConfig } from '@remnant/backend/db/schema';
import { ServerService } from '@remnant/backend/services/server_service';
import { taskScheduler } from '@remnant/backend/services/task_scheduler';
import { auditService } from '@remnant/backend/services/audit_service';

const serverService = new ServerService();
const ONE_MINUTE = 60 * 1000;

const createTaskSchema = z.object({
  serverId: z.number(),
  name: z.string().min(1).max(100),
  type: z.enum(['restart', 'backup', 'command']),
  cron_expression: z
    .string()
    .max(100)
    .regex(/^(\S+\s+){5}\S+$/, 'Invalid cron expression (expected 6 fields)'),
  enabled: z.boolean().optional().default(true),
  config: z
    .object({
      command: z.string().max(1000).optional(),
      backup_paths: z.array(z.string()).optional(),
      warn_players: z.boolean().optional(),
      warn_message: z.string().optional(),
      warn_seconds: z.number().int().min(5).max(300).optional(),
    })
    .optional(),
});

const updateTaskSchema = z.object({
  serverId: z.number(),
  taskId: z.number(),
  name: z.string().min(1).max(100).optional(),
  cron_expression: z.string().min(9).max(100).optional(),
  enabled: z.boolean().optional(),
  config: z
    .object({
      command: z.string().max(1000).optional(),
      backup_paths: z.array(z.string()).optional(),
      warn_players: z.boolean().optional(),
      warn_message: z.string().optional(),
      warn_seconds: z.number().int().min(5).max(300).optional(),
    })
    .optional(),
});

async function getServerOrThrow(serverId: number) {
  const server = await serverService.getServerById(serverId);
  if (!server) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Server not found' });
  }
  return server;
}

const serverControl = requirePermission('server:control');
const serverControlLimited = rateLimitedPermission(10, ONE_MINUTE, 'server:control');

export const tasksRouter = router({
  list: serverControl.input(z.object({ serverId: z.number() })).query(async ({ input }) => {
    await getServerOrThrow(input.serverId);

    const tasks = await db.select().from(scheduledTasks).where(eq(scheduledTasks.server_id, input.serverId));

    return { tasks };
  }),

  create: serverControlLimited.input(createTaskSchema).mutation(async ({ input, ctx }) => {
    await getServerOrThrow(input.serverId);

    const { serverId, name, type, cron_expression, enabled, config } = input;

    const [newTask] = await db
      .insert(scheduledTasks)
      .values({
        server_id: serverId,
        name,
        type,
        cron_expression,
        enabled: enabled ?? true,
        config: config as TaskConfig,
      })
      .returning();

    if (newTask.enabled) {
      await taskScheduler.scheduleTask(newTask);
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'create',
      resourceType: 'task',
      resourceId: String(newTask.id),
      details: { name, type, serverId },
      ip: ctx.req.ip,
    });

    return newTask;
  }),

  update: serverControlLimited.input(updateTaskSchema).mutation(async ({ input, ctx }) => {
    const { serverId, taskId, ...data } = input;

    const [existingTask] = await db
      .select()
      .from(scheduledTasks)
      .where(and(eq(scheduledTasks.id, taskId), eq(scheduledTasks.server_id, serverId)))
      .limit(1);

    if (!existingTask) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.cron_expression !== undefined) updateData.cron_expression = data.cron_expression;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.config !== undefined) updateData.config = data.config;

    const [updatedTask] = await db.update(scheduledTasks).set(updateData).where(eq(scheduledTasks.id, taskId)).returning();

    await taskScheduler.unscheduleTask(taskId);
    if (updatedTask.enabled) {
      await taskScheduler.scheduleTask(updatedTask);
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'update',
      resourceType: 'task',
      resourceId: String(taskId),
      ip: ctx.req.ip,
    });

    return updatedTask;
  }),

  delete: serverControlLimited.input(z.object({ serverId: z.number(), taskId: z.number() })).mutation(async ({ input, ctx }) => {
    const [existingTask] = await db
      .select()
      .from(scheduledTasks)
      .where(and(eq(scheduledTasks.id, input.taskId), eq(scheduledTasks.server_id, input.serverId)))
      .limit(1);

    if (!existingTask) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
    }

    await taskScheduler.unscheduleTask(input.taskId);
    await db.delete(scheduledTasks).where(eq(scheduledTasks.id, input.taskId));

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'delete',
      resourceType: 'task',
      resourceId: String(input.taskId),
      ip: ctx.req.ip,
    });

    return { message: 'Task deleted' };
  }),

  toggle: serverControlLimited.input(z.object({ serverId: z.number(), taskId: z.number() })).mutation(async ({ input, ctx }) => {
    const [existingTask] = await db
      .select()
      .from(scheduledTasks)
      .where(and(eq(scheduledTasks.id, input.taskId), eq(scheduledTasks.server_id, input.serverId)))
      .limit(1);

    if (!existingTask) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
    }

    const newEnabled = !existingTask.enabled;

    const [updatedTask] = await db
      .update(scheduledTasks)
      .set({
        enabled: newEnabled,
        updated_at: new Date().toISOString(),
      })
      .where(eq(scheduledTasks.id, input.taskId))
      .returning();

    await taskScheduler.unscheduleTask(input.taskId);
    if (newEnabled) {
      await taskScheduler.scheduleTask(updatedTask);
    }

    await auditService.log({
      userId: ctx.user.sub,
      username: ctx.user.username,
      action: 'toggle',
      resourceType: 'task',
      resourceId: String(input.taskId),
      details: { enabled: newEnabled },
      ip: ctx.req.ip,
    });

    return updatedTask;
  }),

  history: serverControl.input(z.object({ serverId: z.number(), taskId: z.number() })).query(async ({ input }) => {
    const [task] = await db
      .select()
      .from(scheduledTasks)
      .where(and(eq(scheduledTasks.id, input.taskId), eq(scheduledTasks.server_id, input.serverId)))
      .limit(1);

    if (!task) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
    }

    const executions = await db
      .select()
      .from(taskExecutions)
      .where(eq(taskExecutions.task_id, input.taskId))
      .orderBy(desc(taskExecutions.created_at))
      .limit(100);

    return { executions };
  }),
});
