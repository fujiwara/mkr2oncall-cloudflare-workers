/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

type Bindings = {
	ONCALL_URL: string;
	CRITICAL_ONLY: boolean;
}

import { Hono } from 'hono'
import {
	MackerelWebhook,
	newMackerelWebhook,
	GrafanaOnCallFormattedWebhook,
	GrafanaOnCallFormattedWebhookTestPayload,
} from './types/mackerel'
const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
	const hook = newMackerelWebhook(await c.req.json<MackerelWebhook>())
	console.log(`[info] received webhook: ${JSON.stringify(hook)}`)
	let grafanaHook: GrafanaOnCallFormattedWebhook
	if (hook.isTestPayload()) {
		console.log(`[info] This is a test payload ${hook.getID()}`)
		grafanaHook = GrafanaOnCallFormattedWebhookTestPayload
	} else if (hook.isAlertEvent()) {
		console.log(`[info] processing an alert payload ${hook.getID()}`)
		grafanaHook = hook.toGrafanaOnCallFormattedWebhook()
		if (c.env.CRITICAL_ONLY && !hook.isCriticalOrOK()) {
			console.log(`[info] ignoring non-critical alert ${hook.getID()}`)
			return c.body(null, 204)
		}
	} else {
		console.log(`[warn] ignoring unknown payload`)
		return c.body(null, 204)
	}
	const res = await fetch(c.env.ONCALL_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(grafanaHook),
	})
	if (res.status != 200) {
		console.log(`[error] failed to send webhook: ${res.status} ${res.statusText}`)
		return c.json({ status: 'failed to send webhook' }, 500)
	}
	console.log(`[info] sent webhook: ${hook.getID()} ${hook.getIncidentTitle()}-> ${maskURL(c.env.ONCALL_URL)}`)
	return c.json({ status: 'OK' }, 200)
})

app.get('/health', async (c) => {
	return c.json({ status: 'OK' }, 200)
})

export default app

function maskURL(s: string): string {
	return s.replace(/.{12}$/, "************");
}
