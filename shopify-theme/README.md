# Secret Weapon DSP Shopify Theme

A custom Shopify theme that matches the Secret Weapon DSP website design, featuring a dark, modern aesthetic with gradient accents and smooth animations.

## Features

- **Dark Theme Design**: Matches your existing Secret Weapon DSP branding
- **Responsive Layout**: Mobile-first design that works on all devices
- **Custom Sections**: Hero banner and featured products sections
- **AJAX Cart**: Add to cart without page refresh
- **Smooth Animations**: Subtle animations and transitions
- **VST3 Badge**: Windows VST3 compatibility prominently displayed

## Installation

1. **Download the Theme**
   - Compress the `shopify-theme` folder into a ZIP file

2. **Upload to Shopify**
   - Go to your Shopify Admin > Online Store > Themes
   - Click "Upload theme"
   - Select your ZIP file
   - Click "Upload"

3. **Add Your Logo**
   - Copy your SVG logo to the assets folder
   - Name it `secret-weapon-dsp-logo.svg`

4. **Customize Theme Settings**
   - Click "Customize" on the theme
   - Configure colors, fonts, and social media links
   - Add your footer description

## Theme Structure

```
shopify-theme/
├── assets/                # CSS, JS, and image files
│   ├── secret-weapon-theme.css
│   └── secret-weapon-theme.js
├── config/               # Theme settings
│   └── settings_schema.json
├── layout/              # Main theme layout
│   └── theme.liquid
├── sections/            # Reusable page sections
│   ├── hero-banner.liquid
│   └── featured-products.liquid
├── snippets/            # Reusable components
│   └── product-card.liquid
└── templates/           # Page templates
    ├── cart.liquid
    ├── collection.liquid
    ├── index.json
    └── product.liquid
```

## Customization Guide

### Colors
The theme uses CSS custom properties for easy color customization:
- `--primary-gradient`: Main gradient (purple to pink)
- `--dark-bg`: Background color
- `--text-primary`: Main text color
- `--border-color`: Border colors

### Sections

#### Hero Banner
- Customizable badge text
- Split title with gradient text
- Two call-to-action buttons
- Font Awesome icon support

#### Featured Products
- Product grid display
- AJAX add to cart
- Hover effects
- Price display with sale badges

### Navigation
- Fixed header with blur effect
- Scroll-triggered styling
- Cart count indicator
- Mobile-responsive menu

## Recommended Apps

Since this theme follows "The Curator" path, you can enhance it with:
- **Page builders** (if needed): PageFly, GemPages, or Shogun
- **Reviews**: Judge.me or Stamped.io
- **Email capture**: Klaviyo or Privy
- **Live chat**: Tidio or Gorgias

## Development Tips

1. **Test Locally**: Use Shopify Theme Kit or CLI for local development
2. **Version Control**: Keep backups before making changes
3. **Performance**: The theme is optimized for speed - avoid heavy apps
4. **Updates**: Check theme files after Shopify platform updates

## Support

For theme customization or issues:
- Review Shopify's theme documentation
- Check the theme code comments
- Consider hiring a Shopify Expert for complex modifications

## License

This theme is created specifically for Secret Weapon DSP.
All rights reserved.