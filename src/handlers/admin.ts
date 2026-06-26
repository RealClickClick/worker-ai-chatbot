import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import type { Env } from '../types/env.d.ts';
import {
  getAnalytics, getAllChatIds, getActiveUsersLastDay,
  blockUser, unblockUser, getBlockedUsers,
  cleanupOldData, getRateLimitStats
} from '../services/index.ts';

export async function handleAdmin(chatId: number | string, args: string, env: Env, lang: string): Promise<any> {
  const adminIds = (env.ADMIN_IDS || '').split(',').map(s => s.trim());
  if (!adminIds.includes(String(chatId))) {
    return await sendMessage(chatId, t(lang, 'admin_forbidden'), env);
  }

  const subCmd = args.split(' ')[0].toLowerCase();
  const subArgs = args.substring(subCmd.length).trim();

  switch (subCmd) {
    case 'stats': {
      const analytics = await getAnalytics(env);
      const active = await getActiveUsersLastDay(env);
      return await sendMessage(chatId, t(lang, 'admin_stats', {
        messages: String(analytics.total_messages || 0),
        users: String(analytics.total_users || 0),
        images: String(analytics.total_images || 0),
        searches: String(analytics.total_searches || 0),
        active: String(active),
        good: String(analytics.total_feedback_good || 0),
        bad: String(analytics.total_feedback_bad || 0)
      }), env, 'Markdown');
    }
    case 'broadcast': {
      if (!subArgs) return await sendMessage(chatId, t(lang, 'admin_broadcast_usage'), env);
      const ids = await getAllChatIds(env);
      let sent = 0;
      const CONCURRENCY = 5;
      for (let i = 0; i < ids.length; i += CONCURRENCY) {
        const batch = ids.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
          batch.map((id: any) => sendMessage(id, `📢 *Broadcast:*\n${subArgs}`, env, 'Markdown'))
        );
        sent += results.filter(r => r.status === 'fulfilled').length;
        if (i + CONCURRENCY < ids.length) await new Promise(r => setTimeout(r, 1000));
      }
      return await sendMessage(chatId, t(lang, 'admin_broadcast_done', { count: String(sent) }), env);
    }
    case 'block': {
      const parts = subArgs.split(' ');
      const tid = parts[0];
      if (!tid) return await sendMessage(chatId, t(lang, 'admin_block_usage'), env);
      await blockUser(env, tid, parts.slice(1).join(' ') || null);
      return await sendMessage(chatId, t(lang, 'admin_blocked_done', { id: tid }), env);
    }
    case 'unblock': {
      if (!subArgs) return await sendMessage(chatId, t(lang, 'admin_unblock_usage'), env);
      await unblockUser(env, subArgs);
      return await sendMessage(chatId, t(lang, 'admin_unblocked_done', { id: subArgs }), env);
    }
    case 'blocked': {
      const bl = await getBlockedUsers(env);
      if (!bl.length) return await sendMessage(chatId, t(lang, 'admin_blocked_empty'), env);
      return await sendMessage(chatId, t(lang, 'admin_blocked_title', { list: bl.map(b => `• \`${b.chat_id}\`${b.reason ? ' — ' + b.reason : ''}`).join('\n') }), env, 'Markdown');
    }
    case 'cleanup': {
      const days = parseInt(subArgs || '30', 10);
      const deleted = await cleanupOldData(env, days);
      return await sendMessage(chatId, t(lang, 'admin_cleanup_done', { deleted: String(deleted), days: String(days) }), env, 'Markdown');
    }
    case 'violations': {
      const violators = await getRateLimitStats(env);
      if (!violators.length) return await sendMessage(chatId, t(lang, 'admin_violations_empty'), env);
      const text = violators.map((v: any) => `• \`${v.chat_id}\` — ${v.violations}x violations (tier: ${v.tier})`).join('\n');
      return await sendMessage(chatId, t(lang, 'admin_violations_title', { list: text }), env, 'Markdown');
    }
    default:
      return await sendMessage(chatId, t(lang, 'admin_panel'), env, 'Markdown');
  }
}
