# Contributing

First — thanks for considering a contribution. This project is small on
purpose (the entire counter is one ~200-line Edge function), so almost any PR
is easy to review and merge.

## Ways to contribute

There's no "right" way, but here are the things that consistently move the
project forward:

- **Bug reports** — open an [issue](https://github.com/othmarodev/profile-counter/issues/new)
  with a minimal repro. The [Troubleshooting](./README.md#troubleshooting)
  section already covers the most common surprises; if your problem isn't
  there, please open an issue *and* I'll add it.
- **Documentation fixes** — typos, broken links, unclear wording. README is
  the project's surface area, so even small clarity wins count.
- **New storage adapters** — the Edge function only uses `redis.incr(key)`,
  so swapping Upstash for [Vercel KV](https://vercel.com/docs/storage/vercel-kv),
  Cloudflare KV, Redis Cloud, or anything else is a ~10-line PR.
- **New runtime adapters** — Cloudflare Workers, Deno Deploy, Bun, Hono,
  whatever you use. The current adapter targets Vercel Edge; an alternative
  doesn't have to replace it, it can sit next to it.
- **New badge styles** — `flat` and `flat-square` are shipped. Shields.io
  also has `plastic`, `for-the-badge`, and `social`. PRs for any of those
  are welcome.
- **Translations of the README** — the project is read globally and
  community translations help discoverability. Open a PR with
  `README.<lang>.md` and a link from the main README.

## Development setup

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/profile-counter.git
cd profile-counter

# 2. Install dependencies
npm install

# 3. Copy the env template and fill in your Upstash credentials
cp .env.example .env

# 4. (Optional) regenerate the docs/preview/*.svg assets
npm run test:render

# 5. Verify the seed CLI still works
node scripts/seed.js --help
```

There is no test suite (yet). If you change the renderer in `api/views.js`,
please regenerate `docs/preview/*.svg` with `npm run test:render` and visually
confirm the output looks the same shape as the old one (or better).

## Sending a Pull Request

1. **Fork** the repo and create a feature branch from `main`:
   `git checkout -b add/cool-thing`
2. Make your change. Keep commits small and the rationale clear in the
   commit message.
3. **Update README** if you added or changed a user-facing flag, query
   parameter, or behavior. The README is the only docs source.
4. **Open the PR** with a description that explains *why* the change is
   useful and *what* a reviewer should look at first.

If you're new to open source: GitHub has a great [walkthrough on opening a
PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests),
and a small typo PR is a perfectly fine first one.

## Code style

There's no linter or formatter. The code style is "vanilla JavaScript, lots
of comments, no clever tricks." Match the surrounding style of whatever you
touch.

## Questions

If anything is unclear, [open an issue](https://github.com/othmarodev/profile-counter/issues/new)
and ask. I'd much rather answer a question than have someone bounce off a
contribution.

— [@othmarodev](https://github.com/othmarodev)
