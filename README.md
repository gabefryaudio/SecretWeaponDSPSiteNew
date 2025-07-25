# Secret Weapon DSP Website

A professional website for Secret Weapon DSP audio plugins company.

## Pages

- **Homepage** (`secretweapon-homepage.html`) - Main landing page
- **Plugins Overview** (`plugins-overview.html`) - Product catalog
- **LUT Compressor** (`lut-compressor-page.html`) - Individual product page
- **Quantum EQ** (`quantum-eq-page.html`) - Individual product page 
- **Contact** (`contact-page.html`) - Contact form and information
- **Support** (`support-page.html`) - Documentation and FAQ

## Preview Options

### Option 1: Simple File Preview
1. Open `index.html` in your browser
2. Use the preview cards to navigate between pages
3. Note: Navigation menus won't work properly without a web server

### Option 2: VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` 
3. Select "Open with Live Server"
4. Navigate through the site (navigation will partially work)

### Option 3: Local Web Server
Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server
```

### Option 4: Fix Navigation Links
To make navigation work without a server, update links in all HTML files:
- Change `href="/"` to `href="secretweapon-homepage.html"`
- Change `href="/plugins"` to `href="plugins-overview.html"`
- Change `href="/lut-compressor"` to `href="lut-compressor-page.html"`
- Change `href="/quantum-eq"` to `href="quantum-eq-page.html"`
- Change `href="/contact"` to `href="contact-page.html"`
- Change `href="/support"` to `href="support-page.html"`

## Features

- Modern dark theme with gradient accents
- Responsive design
- Interactive elements (forms, tabs, accordions)
- Smooth animations and transitions
- No external dependencies except fonts and icons

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Notes

- Form submissions are simulated (no backend)
- External links (social media, etc.) are placeholders
- Images referenced but not included (plugin previews)