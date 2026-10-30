import type { Register } from 'claude-code'

const BASE = '/Users/takahashi_yuya/workspace/agentic-solution/logs/cloud/raw'
const SERVER = 'remote-devices'
const TOOL = 'Desktop_Commander__write_file'

const jstDate = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
const jstTime = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(11, 19)

export const register: Register = (on) => {
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) return result // サブエージェントは対象外
    try {
      const sid = await $.session.id()
      const key = `idx:${sid}`
      const done = Number((await $.store.get(key)) ?? 0)
      const msgs = await $.session.messages()
      if (!Array.isArray(msgs) || msgs.length <= done) return result
      const fresh = msgs.slice(done)
      const body = fresh
        .map((m) => {
          const tools = (m.toolUses ?? []).map((t) => t.tool)
          const head = m.role === 'user' ? '### yuya' : '### Claude'
          const toolLine = tools.length ? `\n_tools: ${tools.join(', ')}_` : ''
          return m.text || toolLine ? `${head}\n${m.text}${toolLine}\n` : ''
        })
        .filter(Boolean)
        .join('\n')
      if (!body) {
        await $.store.set(key, msgs.length)
        return result
      }
      const header = done === 0 ? `# ${sid}\n\n` : ''
      const content = `${header}<!-- ${jstDate()} ${jstTime()} JST turn ${e.turnId} -->\n${body}\n`
      await $.mcp.call(SERVER, 'Desktop_Commander__create_directory', { path: BASE })
      const r = await $.mcp.call(SERVER, TOOL, {
        path: `${BASE}/${jstDate()}_${sid}.md`,
        content,
        mode: 'append',
      })
      if (r.isError) {
        $.ui.log('cloud-log-to-mac: Macへの書き込みに失敗（次のターンで再送）: ' + JSON.stringify(r.content).slice(0, 300), { to: 'transcript' })
      } else {
        await $.store.set(key, msgs.length) // 成功時だけ進める＝失敗分は次ターンで再送
      }
    } catch (err) {
      $.ui.log(`cloud-log-to-mac: ${String(err)}`, { to: 'transcript' })
    }
    return result
  })
}
