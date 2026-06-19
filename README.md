<div align="center">

# profile-counter

**Your own GitHub profile views counter. Free forever. Can't break.**

A drop-in replacement for [komarev.com/ghpvc](https://komarev.com) — except you own
the URL, you own the data, and there's no third-party service that can go down
on a random Tuesday.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fothmarodev%2Fprofile-counter&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&envDescription=Upstash%20Redis%20REST%20credentials%20%E2%80%94%20free%20tier%2C%20signup%20at%20console.upstash.com&envLink=https%3A%2F%2Fgithub.com%2Fothmarodev%2Fprofile-counter%23setup&project-name=profile-counter&repository-name=profile-counter)

![MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Vercel](https://img.shields.io/badge/runs%20on-Vercel%20Edge-000?style=flat-square&logo=vercel)
![Upstash](https://img.shields.io/badge/storage-Upstash%20Redis-00E9A3?style=flat-square)
![Zero deps](https://img.shields.io/badge/dependencies-1-FF6B35?style=flat-square)

<sub>Built by [@othmarodev](https://github.com/othmarodev) — [othmaro.dev](https://othmaro.dev)</sub>

</div>

---

## Why this exists

If your GitHub profile README has ever displayed a `Profile views: ?` broken
image — that's because the free third-party counter you were using went down.
Or got rate-limited. Or moved server. Or just disappeared.

It's not their fault. They're free services run by individuals, often hosted in
a single region, with no SLA. When they break, **your counter resets to zero**.
Your historical count — months or years of pride — is gone.

**profile-counter** is the same idea, but you own the deployment:

- Runs on **your** Vercel project (free tier, never charged)
- Stores count in **your** Upstash Redis (free tier, never charged)
- Exposes a URL you control: `your-project.vercel.app/api/views`
- Migrate from komarev/laobi by seeding the counter (no zero reset)
- 100% open source — fork it, audit it, modify the badge style, do whatever

If it ever breaks, it's because **you** broke it. And you can fix it.

## Live demo

[![Profile views](https://counter.othmaro.dev/api/views?id=demo&label=Live%20demo%20views&rightColor=FF6B35)](https://counter.othmaro.dev/api/views?id=demo)

That badge above is rendered by **this exact code**, deployed to
[counter.othmaro.dev](https://counter.othmaro.dev). Every time you reload this
README, it counts up.

## Setup (5 minutes)

> The TL;DR: click the **Deploy with Vercel** button above, sign up to Upstash
> for the free Redis, paste the two env vars, done. The walkthrough below is
> just the same thing with screenshots.

### 1. Create a free Upstash Redis database

[Upstash](https://upstash.com) gives you a free Redis with 10,000 commands/day
— enough for ~5,000 daily profile visits, far more than any individual profile
needs.

1. Go to [console.upstash.com](https://console.upstash.com/) and sign up
   (GitHub login is fine — they don't ask for a credit card).
2. Click **Create Database**.
3. Name it `profile-counter`. Region: pick the one closest to your Vercel
   region (usually `us-east-1`). Type: **Regional** (cheapest, free).
4. Open the database → **REST API** tab. You'll see two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

   Keep this tab open — you'll paste them in the next step.

### 2. Deploy to Vercel

Click the button — Vercel will fork this repo into your account and prompt for
the two env vars from step 1:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fothmarodev%2Fprofile-counter&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&envDescription=Upstash%20Redis%20REST%20credentials%20%E2%80%94%20free%20tier%2C%20signup%20at%20console.upstash.com&envLink=https%3A%2F%2Fgithub.com%2Fothmarodev%2Fprofile-counter%23setup&project-name=profile-counter&repository-name=profile-counter)

Or do it from the CLI:

```bash
git clone https://github.com/othmarodev/profile-counter.git
cd profile-counter
vercel
# When prompted, paste your two UPSTASH_* values
vercel --prod
```

When the deploy finishes, you'll get a URL like:

```
https://profile-counter-yourname.vercel.app
```

### 3. (Optional) Migrate your count from komarev

If you had 623 views on komarev and want to keep counting from there instead
of restarting at zero:

```bash
# Locally — install deps, then seed
npm install
cp .env.example .env
# Edit .env with your Upstash credentials
node scripts/seed.js 623
```

Now your counter starts at 624 on the next visit.

> **Don't know your old komarev count?** If your profile is in [Wayback
> Machine](https://web.archive.org/), open the most recent snapshot, find the
> badge, and use that number. Otherwise, just pick any number that feels
> honest — it's *your* counter.

### 4. Add the badge to your profile README

Replace your old komarev badge with your new URL:

```markdown
![Profile views](https://your-project.vercel.app/api/views?id=YOUR_USERNAME)
```

That's it. The counter increments on every README render.

## Customization

All options are URL query parameters — no rebuild needed.

| Param | Default | Description |
|-------|---------|-------------|
| `id` | `default` | Bucket key. Use different ids to track different pages from one deployment (e.g., `?id=othmarodev`, `?id=my-project`). |
| `label` | `Profile views` | Text on the left side. URL-encode spaces. Max 40 chars. |
| `leftColor` | `#555` | Left background. Hex or named (`blue`, `red`, `blueviolet`, ...). |
| `rightColor` | `#4c1` | Right background. Same accepted formats. |
| `style` | `flat` | `flat` (shields.io-style with gradient) or `flat-square`. |

### Examples

```markdown
<!-- Default -->
![Views](https://your-project.vercel.app/api/views?id=mypage)
```
![flat default](docs/preview/flat-default.svg)

```markdown
<!-- Custom label + blueviolet -->
![Views](https://your-project.vercel.app/api/views?id=mypage&label=Profile%20views&rightColor=blueviolet)
```
![flat blueviolet](docs/preview/flat-blueviolet.svg)

```markdown
<!-- Brand colors (dark + orange) -->
![Page views](https://your-project.vercel.app/api/views?id=mypage&label=Page%20views&leftColor=1F2937&rightColor=FF6B35)
```
![flat orange](docs/preview/flat-orange.svg)

```markdown
<!-- flat-square style -->
![Views](https://your-project.vercel.app/api/views?id=mypage&style=flat-square&rightColor=blue)
```
![flat-square blue](docs/preview/flat-square-blue.svg)

## Tracking multiple pages

Use distinct `id`s. Each id is an independent counter:

```markdown
<!-- Your GitHub profile -->
![](https://your-project.vercel.app/api/views?id=othmarodev)

<!-- A project README -->
![](https://your-project.vercel.app/api/views?id=morph-hero&label=Repo%20views)

<!-- A blog post -->
![](https://your-project.vercel.app/api/views?id=2026-llm-memory&label=Reads)
```

All three count separately. One deployment, infinite buckets.

## How it works

```
┌──────────────────────┐    HTTPS    ┌──────────────────────┐
│ Reader's browser     │ ──────────▶ │ camo.githubusercontent│
│ loading your README  │             │   .com proxy          │
└──────────────────────┘             └─────────┬────────────┘
                                                │ on cache miss
                                                ▼
                                  ┌──────────────────────────┐
                                  │ your Vercel edge function│
                                  │      /api/views          │
                                  └─────────┬────────────────┘
                                            │ INCR
                                            ▼
                                  ┌──────────────────────────┐
                                  │      Upstash Redis       │
                                  │  profile-counter:{id}    │
                                  └──────────────────────────┘
```

- **Edge runtime** for low latency (Vercel routes the request to the closest
  region — usually 30-80ms for the increment + render).
- **Atomic INCR** so concurrent requests can't lose increments.
- **No GitHub API calls** — the counter is purely your storage.
- **camo cache** is the one thing you can't control — GitHub re-proxies the
  badge image only when the cache TTL expires (usually a few minutes), so the
  number you see is monotonically increasing but not "every-pageview-exact".
  This is the same limitation that komarev, hits.sh, visitor-badge.laobi.icu
  and every other counter on the planet has.

## Comparison

| | profile-counter | komarev.com | visitor-badge.laobi.icu | hits.sh |
|---|:---:|:---:|:---:|:---:|
| **You own the URL** | ✅ | ❌ | ❌ | ❌ |
| **You own the data** | ✅ | ❌ | ❌ | ❌ |
| **Can't be turned off by a third party** | ✅ | ❌ went down 2024, 2025, 2026 | ❌ | ❌ |
| **Migrate from komarev (seed initial count)** | ✅ | n/a | ❌ | ❌ |
| **Open source** | ✅ MIT | ❌ | ❌ | ❌ |
| **Multiple counters per deployment** | ✅ | ❌ | ❌ | ❌ |
| **Free** | ✅ Vercel + Upstash free tiers | ✅ | ✅ | ✅ |
| **Setup time** | 5 min | 0 min | 0 min | 0 min |

The trade-off is honest: free third-party services beat self-hosted on
"time to first badge". Self-hosted wins on **every** other axis.

## FAQ

<details>
<summary><b>Why Vercel and not Cloudflare Workers?</b></summary>

Both work. Vercel was picked because most devs already have a Vercel account
and the **Deploy with Vercel** button gets you to a working counter in one
click. If you prefer Cloudflare, the Edge function adapts in ~20 lines — see
[Issue #1](https://github.com/othmarodev/profile-counter/issues) (PR welcome).

</details>

<details>
<summary><b>Why Upstash and not [other Redis]?</b></summary>

Upstash Redis is HTTP-based, which is required for Vercel Edge functions
(no TCP at the edge). Their free tier (10k commands/day) is generous and they
don't ask for a credit card. If you already use a different HTTP-callable KV
(Cloudflare KV, Redis Cloud HTTP API), swapping is one import change away.

</details>

<details>
<summary><b>Can I run this with no Redis (in-memory only)?</b></summary>

Vercel Edge functions are stateless — every invocation is a fresh isolate, so
in-memory state is lost between requests. You need *some* external storage.
Upstash is the lowest-friction option (free, no CC, no servers to manage), but
the storage call is one line so you can swap it for anything.

</details>

<details>
<summary><b>Is the count accurate?</b></summary>

It's accurate up to GitHub's camo image cache. GitHub re-proxies the badge
when its cache expires (usually a few minutes), and only THEN does our function
get called and increment the count. Two visits within camo's cache window
register as one increment.

This is the same limitation every counter has, including komarev. Counting
exact pageviews would require GitHub to embed something other than a cached
image, which isn't a thing.

</details>

<details>
<summary><b>Will this stay free?</b></summary>

Vercel Hobby plan: free, with 100k function invocations per month. A wildly
popular profile gets ~1,000 daily views = ~30k/month. You'd have to be in the
GitHub top-1000 to outgrow the free tier.

Upstash free: 10k commands/day. Each visit = 1 INCR = 1 command, so 10k daily
visits. Same story.

If you somehow exceed both: the paid tiers are cheap (~$1/month) or you can
swap to Cloudflare Workers (100k/day requests free).

</details>

<details>
<summary><b>Why is the badge always shown as `flat` style and not the GitHub-native one?</b></summary>

GitHub README image badges are static images — the platform doesn't have a
"native" badge concept. What you're used to seeing is the
[shields.io](https://shields.io) flat style, which is what we mimic in
`api/views.js`. The `flat-square` variant is also supported (`?style=flat-square`).

</details>

<details>
<summary><b>Can I use this for non-GitHub pages?</b></summary>

Yes. It's just an `<img>` tag serving an SVG. Put it in your personal site, in
a blog post, in a project README hosted on GitLab, anywhere. Use different
`?id=` values to track separate pages.

</details>

## Contributing

PRs welcome. The codebase is intentionally tiny — under 300 lines of JS total.
Good first PRs:

- Cloudflare Workers adapter (`api/views.cloudflare.js`)
- Additional badge styles (`plastic`, `social`, `for-the-badge`)
- Storage adapters (Vercel KV, Redis Cloud, MongoDB Atlas, Postgres)
- A `top.txt` recipe for the [shields.io endpoint format](https://shields.io/endpoint),
  so users who prefer can route through shields.io for extra styles

## Roadmap

- [x] Edge function with Upstash Redis
- [x] `flat` and `flat-square` styles
- [x] Migration script from third-party counters
- [x] Multiple counters per deployment via `?id=`
- [ ] `for-the-badge` and `plastic` styles
- [ ] Cloudflare Workers adapter
- [ ] Privacy-friendly analytics endpoint (`/api/stats?id=...`, requires auth)
- [ ] Webhook on milestone counts (Discord/Slack)

## License

[MIT](./LICENSE) © 2026 [Othmaro Fallas Rojas](https://othmaro.dev)

If you deploy this and your counter works, consider a star — it's the
GitHub-native equivalent of the badge.
