# Local Testing Guide for Secret Weapon DSP Shopify Theme

## Option 1: Shopify CLI (Recommended)

The Shopify CLI is the official tool for local theme development.

### Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Version 14 or higher required

2. **Install Shopify CLI**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

### Setup

1. **Create a Development Store** (if you don't have one)
   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Create a free partner account
   - Create a development store

2. **Login to Shopify**
   ```bash
   shopify login --store your-store-name.myshopify.com
   ```

3. **Navigate to Theme Directory**
   ```bash
   cd "C:\Users\gabef\OneDrive\Documents\New Secret Weapon DSP Website\shopify-theme"
   ```

4. **Start Development Server**
   ```bash
   shopify theme dev
   ```

This will:
- Upload your theme to the store as a development theme
- Start a local server (usually http://127.0.0.1:9292)
- Hot reload changes as you edit files
- Use your store's real product data

## Option 2: Theme Kit (Alternative)

Theme Kit is another official Shopify tool for theme development.

### Installation

1. **Windows (using Chocolatey)**
   ```bash
   choco install themekit
   ```

   **Or download directly:**
   - Visit [shopify.github.io/themekit](https://shopify.github.io/themekit/)
   - Download the Windows executable

2. **Create config.yml**
   ```yaml
   development:
     password: your-private-app-password
     theme_id: "123456789"
     store: your-store-name.myshopify.com
     directory: .
     ignore_files:
       - config/settings_data.json
   ```

3. **Watch for Changes**
   ```bash
   theme watch
   ```

## Option 3: Direct Preview (Quickest)

If you just want to see how it looks without local development:

1. **Zip the Theme**
   - Compress the `shopify-theme` folder
   - Make sure the files are in the root of the ZIP (not in a subfolder)

2. **Upload to Shopify**
   - Go to Online Store > Themes
   - Click "Upload theme"
   - Select your ZIP file

3. **Preview Without Publishing**
   - Click "Actions" > "Preview"
   - This opens the theme without affecting your live store
   - You can customize it in the Theme Editor

## Testing Checklist

Once you have local testing set up, check these key areas:

### Visual Elements
- [ ] Logo displays correctly at 180px height
- [ ] Dark background with gradient animations
- [ ] Navigation sticky scroll effect
- [ ] Mobile menu functionality

### Homepage
- [ ] Hero banner section customization
- [ ] Featured products grid
- [ ] Gradient text effects
- [ ] Button hover states

### Product Pages
- [ ] Product images and gallery
- [ ] Add to cart functionality
- [ ] Quantity selector
- [ ] Price display

### Cart
- [ ] AJAX cart updates
- [ ] Quantity adjustments
- [ ] Remove items
- [ ] Cart notifications

### Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)  
- [ ] Test on desktop (1440px)

## Troubleshooting

### Common Issues

1. **CLI Installation Fails**
   - Run PowerShell as Administrator
   - Try: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

2. **Theme Won't Upload**
   - Ensure all Liquid files have correct syntax
   - Check file size (must be under 50MB)
   - Verify folder structure

3. **Styles Not Loading**
   - Clear browser cache
   - Check asset file names match references
   - Verify CSS file is in assets folder

### Development Tips

1. **Use Chrome DevTools**
   - Inspect elements to debug styling
   - Check Console for JavaScript errors
   - Test responsive views

2. **Enable Theme Inspector**
   - Chrome extension for Shopify themes
   - Shows which Liquid files render each element

3. **Test with Real Data**
   - Add sample products to your dev store
   - Test with multiple variants
   - Check edge cases (long titles, no images)

## Quick Start Commands

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Navigate to theme
cd "C:\Users\gabef\OneDrive\Documents\New Secret Weapon DSP Website\shopify-theme"

# Login to your store
shopify login --store your-store.myshopify.com

# Start development
shopify theme dev

# Your theme will be available at http://127.0.0.1:9292
```

## Resources

- [Shopify CLI Documentation](https://shopify.dev/themes/tools/cli)
- [Theme Development Guide](https://shopify.dev/themes)
- [Liquid Reference](https://shopify.dev/api/liquid)
- [Theme Inspector Chrome Extension](https://chrome.google.com/webstore/detail/shopify-theme-inspector/fndnankcflemoafdeboboehphmiijkgp)