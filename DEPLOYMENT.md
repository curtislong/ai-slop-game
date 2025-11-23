# Deployment Guide for AI Slop Game

This guide will help you deploy the game to Vercel with secure API key handling.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- OpenAI API key (from https://platform.openai.com/api-keys)
- FAL API key (from https://fal.ai/dashboard/keys)
- Custom domain configured (aislopgame.com)

## Architecture

The app uses **Vercel Edge Functions** to securely proxy API calls:
- All API keys stay server-side (never exposed to browser)
- Edge runtime for global low latency (~10-30ms)
- Three API routes handle all external calls

## Step 1: Push to GitHub

Make sure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Add secure API proxy with Edge Functions"
git push origin feature/ai-sabotage
```

## Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `ai-slop-game` repository
4. Choose the `feature/ai-sabotage` branch (or merge to main first)

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required Variables

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
| `FAL_API_KEY` | `c328466d-...` | https://fal.ai/dashboard/keys |

**Important:**
- ✅ Do NOT include `NEXT_PUBLIC_` prefix (these are server-only)
- ✅ Add them in Vercel dashboard → Settings → Environment Variables
- ✅ Apply to Production, Preview, and Development environments

## Step 4: Deploy

Click **Deploy** button. Vercel will:
1. Build your Next.js app
2. Deploy API routes as Edge Functions globally
3. Give you a temporary URL (e.g., `ai-slop-game-abc123.vercel.app`)

## Step 5: Configure Custom Domain

1. Go to project Settings → Domains
2. Add `aislopgame.com` and `www.aislopgame.com`
3. Follow Vercel's DNS instructions to update your domain registrar
4. Wait for DNS propagation (~5-60 minutes)

### DNS Configuration

Point these records to Vercel:

```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

## Step 6: Test Production

Visit https://aislopgame.com and test:

1. ✅ Game loads without errors
2. ✅ Can generate images
3. ✅ AI corruption works
4. ✅ Scoring calculates properly
5. ✅ Check browser dev tools → No API keys visible

## Monitoring & Costs

### Vercel Edge Functions (Free Tier)
- 500,000 requests/month free
- Then $20/month + $0.65 per million requests

### OpenAI Costs
- GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Embeddings: ~$0.02 per 1M tokens
- Estimated: ~$0.005-0.01 per game (5-10 players)

### FAL AI Costs
- Flux Schnell: ~$0.003 per image
- Estimated: ~$0.015-0.03 per game

### Total per game: ~$0.02-0.04

## Troubleshooting

### Error: "API key not configured"
- Check environment variables in Vercel dashboard
- Redeploy after adding variables

### Edge Function timeout
- Edge Functions have 30s timeout
- If hitting limit, switch to serverless (remove `export const runtime = 'edge'`)

### High latency
- Edge Functions should be <50ms globally
- Check Vercel Analytics for performance data

## Rollback Plan

If deployment has issues:

1. Go to Vercel → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Security Checklist

- ✅ API keys are server-side only (no `NEXT_PUBLIC_` prefix)
- ✅ Edge Functions validate requests
- ✅ No API keys in git repository (.env.local in .gitignore)
- ✅ HTTPS enabled by default
- ✅ Rate limiting available (can add if needed)

## Next Steps (Optional)

### Add Rate Limiting
Prevent abuse by limiting requests per IP:

```typescript
// In API routes
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### Add Analytics
Track usage with Vercel Analytics:

```bash
npm install @vercel/analytics
```

### Add Monitoring
Use Vercel's built-in monitoring or add Sentry:

```bash
npm install @sentry/nextjs
```

## Support

If you run into issues:
- Check Vercel logs: Dashboard → Deployments → [deployment] → Logs
- Check browser console for errors
- Verify environment variables are set correctly
