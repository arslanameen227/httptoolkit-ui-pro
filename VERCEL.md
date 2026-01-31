# Deploy HTTP Toolkit UI on Vercel

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel

## Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Configure in Vercel Dashboard**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js Version: `20.x`

## Environment Variables

Set these in Vercel → Settings → Environment Variables:

```env
NODE_ENV=production
```

## Build Configuration

The project includes `vercel.json` with:
- Static build configuration
- Proper routing for SPA
- Security headers
- Asset caching

## What Works

- ✅ All 16+ developer tools (local processing)
- ✅ Responsive design
- ✅ Dark/light themes
- ✅ Export/import functionality
- ✅ Mobile optimization

## What Doesn't Work

- ❌ HTTP interception (requires server)
- ❌ Real-time monitoring
- ❌ Server connection

## Deployment URL

Your app will be available at: `https://your-app-name.vercel.app`

## Support

For issues, check the Vercel deployment logs in your dashboard.
