# Deployment Checklist for Vercel

## Pre-Deployment Checks

- [ ] **Test all pages locally** - Make sure hamburger menu works on mobile
- [ ] **Check all links** - Ensure no broken links between pages
- [ ] **Verify images load** - Check that all images in `images/` folder are present
- [ ] **Test contact form locally** using `vercel dev`
- [ ] **Check WASM plugins** - Ensure Canvas Comp and Quantum EQ demos work

## Environment Variables to Set in Vercel Dashboard

Go to Settings → Environment Variables and add:

- [ ] `RESEND_API_KEY`: `re_EjjWUr62_Ef7worsXexpVj4dybZcSVkKi`
- [ ] `CONTACT_EMAIL`: `gabefry@gmail.com`

## Files That Should NOT Be Deployed

These are already in .gitignore:
- `.env.local` (contains your API key)
- `node_modules/` (will be installed by Vercel)
- `.vercel/` (Vercel's local config)

## Deployment Commands

1. **First time setup**:
   ```bash
   npm install -g vercel
   vercel link  # or just 'vercel' for new project
   ```

2. **Test locally**:
   ```bash
   vercel dev
   ```

3. **Deploy preview**:
   ```bash
   vercel
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Tests

- [ ] Visit your live site
- [ ] Test mobile responsiveness
- [ ] Submit a test contact form
- [ ] Check that you receive the email
- [ ] Test WASM plugins on mobile and desktop
- [ ] Verify Shopify buy buttons work

## Domain Setup (if needed)

If you have a custom domain:
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## Rollback Plan

If something goes wrong:
```bash
# List all deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```