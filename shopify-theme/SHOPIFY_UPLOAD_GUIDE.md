# How to Upload Your Theme to Shopify

## Step-by-Step Upload Guide

### 1. First, Create the Theme ZIP File

Before uploading, you need to prepare your theme:

1. Navigate to: `C:\Users\gabef\OneDrive\Documents\New Secret Weapon DSP Website\`
2. Right-click on the `shopify-theme` folder
3. Select "Send to" > "Compressed (zipped) folder"
4. This creates `shopify-theme.zip`

**Important**: Make sure the theme files are in the root of the ZIP, not nested in a folder.

### 2. Access Your Shopify Admin

1. Go to your Shopify admin URL: `https://your-store-name.myshopify.com/admin`
2. Log in with your credentials

### 3. Navigate to Themes

The location varies slightly based on your Shopify plan:

**Option A - Standard Navigation:**
1. In the left sidebar, look for **"Online Store"**
2. Click on **"Online Store"**
3. You'll see **"Themes"** as a sub-menu item - click it

**Option B - If you don't see "Online Store":**
1. Look for **"Sales channels"** in the left sidebar
2. Click the **"+"** button next to Sales channels
3. Add **"Online Store"** if it's not already added
4. Once added, click **"Online Store"** > **"Themes"**

### 4. Upload Your Theme

Once you're on the Themes page:

1. Look for the **"Upload theme"** button
   - It's usually in the top right area
   - Or under "Theme library" section
   - Sometimes it's a dropdown: "Add theme" > "Upload zip file"

2. Click **"Upload theme"** or **"Add theme"**

3. In the dialog that appears:
   - Click **"Choose File"** or **"Browse"**
   - Select your `shopify-theme.zip` file
   - Click **"Upload"**

4. Wait for the upload to complete (usually 10-30 seconds)

### 5. Preview Your Theme

After upload:
1. Find your theme in the "Theme library" section
2. Click **"Actions"** (three dots menu) next to your theme
3. Select **"Preview"**

## Alternative: Using Shopify CLI (Easier for Development)

If you can't find the upload button or want an easier development workflow:

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Navigate to your theme folder
cd "C:\Users\gabef\OneDrive\Documents\New Secret Weapon DSP Website\shopify-theme"

# Push theme to your store
shopify theme push --unpublished

# This will prompt you to:
# 1. Log in to your store
# 2. Select which store to push to
# 3. Upload the theme
```

## Troubleshooting

### "I don't see Online Store"
- You need to add it as a sales channel
- Click "+" next to "Sales channels"
- Add "Online Store"

### "I don't have a Themes option"
- Check your Shopify plan - all plans should have themes
- Try logging out and back in
- Clear browser cache

### "Upload failed"
Common reasons:
- ZIP file is too large (max 50MB)
- Files are nested in a subfolder
- Missing required files (theme.liquid)
- Syntax errors in Liquid files

### Need a Test Store?

If you don't have a Shopify store yet:

1. **Create a Development Store** (Free):
   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Sign up for a free Partner account
   - Create a "Development store"
   - This gives you a full Shopify store for testing

2. **Start a Free Trial**:
   - Go to [shopify.com](https://shopify.com)
   - Start a 14-day free trial
   - No credit card required initially

## Visual Guide

The Themes page typically looks like this:

```
Shopify Admin
├── Online Store
│   ├── Themes          <-- Click here
│   │   ├── Current theme
│   │   │   └── [Customize] [Actions]
│   │   └── Theme library
│   │       └── [Upload theme] button  <-- Upload here
│   ├── Blog posts
│   ├── Pages
│   └── Navigation
```

## Getting Help

If you're still having trouble finding the upload option:

1. **Shopify Support**: Available 24/7 via chat in your admin
2. **Screenshot**: Take a screenshot of your admin sidebar
3. **Store Type**: Check if you have a regular Shopify store or Shopify Plus

The exact interface can vary based on:
- Your Shopify plan (Basic, Shopify, Advanced, Plus)
- Admin interface version
- Enabled features/sales channels