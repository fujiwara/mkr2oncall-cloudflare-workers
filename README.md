# mkr2oncall-cloudflare-workers

## Description

This is a port of [mackerel-to-grafana-oncall](https://github.com/fujiwara/mackerel-to-grafana-oncall) to Cloudflare Workers.

## Usage

1. Create a new Cloudflare Worker in this repository. `wrangler publish`.
2. Set a secret `ONCALL_URL` (Grafana OnCall webhook integration URL) to the worker. `wrangler secret put ONCALL_URL`.
3. Send webhook from Mackerel to the worker URL.

## Considerations

This is a proof of concept. It works but not tested well.

## License

MIT
