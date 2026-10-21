// Demo-only routes behind the Live check page. Not part of FestPass itself.
import { Router } from 'express'
import { checks, runCheck } from './checks.js'
import { rush } from './rush.js'
import { scenarios } from './scenarios.js'

const router = Router()

router.get('/checks', (req, res) => {
  res.json(checks.map(({ id, rule, title, expect }) => ({ id, rule, title, expect })))
})

router.post('/checks/:id', async (req, res) => {
  const check = checks.find((c) => c.id === req.params.id)
  if (!check) return res.status(404).json({ error: 'check_not_found' })
  res.json({ id: check.id, ...(await runCheck(check)) })
})

router.post('/rush', async (req, res) => {
  res.json(await rush())
})

router.post('/scenarios/:id', async (req, res) => {
  const run = scenarios[req.params.id]
  if (!run) return res.status(404).json({ error: 'scenario_not_found' })
  res.json(await run())
})

export default router
