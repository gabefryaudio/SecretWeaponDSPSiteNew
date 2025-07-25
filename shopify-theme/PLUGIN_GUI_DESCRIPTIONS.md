# Plugin GUI Visual Descriptions

## LUT Compressor GUI

### Visual Layout:
- **Background**: Dark gradient from #1a1a2e to #0a0a0a (dark purple to black)
- **Title**: "LUT COMPRESSOR" with cyan gradient (#00b4d8 to #0077b6)
- **Layout**: Two-column design

#### Left Panel (Controls - 280px width):
- **Background**: Semi-transparent white (5%) with blur effect
- **Border Radius**: 20px rounded corners
- **Contents**:
  1. **Preset Selector** dropdown
  2. **Input Gain** slider (-24dB to +24dB)
  3. **Attack** slider (0.1ms to 100ms)
  4. **Release** slider (1ms to 1000ms)
  5. **Attack Depth** slider (-2 to +2)
  6. **Release Depth** slider (-2 to +2)
  7. **Makeup Gain** slider (-24dB to +24dB)
  8. **Mix** slider (0% to 100%)
  9. **Waveshaper Mix** slider (0% to 100%)
  10. **Metering Section**: Shows envelope, gain reduction, output level

#### Right Panel (Curve Editor):
- **Two switchable views**: 
  - Compression Curve
  - Waveshaper Curve
- **Switcher**: Rounded pill-style toggle buttons
- **Grid Background**: Dark with subtle grid lines
- **8 Draggable Points**: Cyan colored (#00b4d8)
- **Curve Line**: Smooth gradient line connecting points
- **Reset Button**: Gradient button below curve

### Color Scheme:
- Primary: Cyan (#00b4d8)
- Background: Dark purple to black gradient
- Text: White with various opacity levels
- Accents: Blue gradients for active elements

---

## Quantum EQ GUI

### Visual Layout:
- **Background**: Pure black (#000)
- **Title**: "QUANTUM EQ" (likely with gradient text)
- **Layout**: Single panel with spectrum analyzer

#### Main Display:
- **Spectrum Analyzer**: 
  - Real-time FFT visualization
  - Frequency range: 20Hz to 20kHz
  - Amplitude range: -80dB to +10dB
  - Smooth animated spectrum display

#### EQ Bands (10 total):
- **Band Colors**: Each band has unique gradient:
  1. Purple gradient (#667eea to #764ba2)
  2. Pink gradient (#f093fb to #f5576c)
  3. Blue gradient (#4facfe to #00f2fe)
  4. Green gradient (#43e97b to #38f9d7)
  5. Yellow-pink gradient (#fa709a to #fee140)
  6. Deep blue gradient (#30cfd0 to #330867)
  7. Light blue-pink (#a8edea to #fed6e3)
  8. Pink gradient (#ff9a9e to #fecfef)
  9. Orange gradient (#ffecd2 to #fcb69f)
  10. Red-blue gradient (#ff6e7f to #bfe9ff)

#### Band Controls:
- **Visual Points**: Draggable frequency/gain nodes on the spectrum
- **Band Buttons**: Color-coded selection buttons (1-10)
- **Per-Band Controls**:
  - Filter Type selector
  - Frequency knob
  - Gain slider
  - Q (bandwidth) control
  - Slope selector (for shelves/cuts)
  - Proportional Q toggle
  - Asymmetric curve toggle

#### Additional Controls:
- **Input/Output Gain** sliders
- **Bypass** button
- **Keyboard Shortcuts**: Numbers 1-0 for band selection

### Visual Style:
- **Modern/Premium**: Clean, minimalist interface
- **Dark Theme**: Black background for reduced eye strain
- **Colorful Accents**: Each band has distinctive gradient
- **Smooth Animations**: Real-time spectrum with smoothing
- **Professional Layout**: Similar to high-end EQ plugins

---

## Key Visual Differences:

**LUT Compressor**:
- Cyan/blue color scheme
- Two-panel layout
- Focus on curve editing
- More traditional knob/slider arrangement

**Quantum EQ**:
- Multi-color gradient system
- Single integrated display
- Spectrum analyzer prominent
- More modern, flat design

Both plugins feature:
- Dark backgrounds for studio use
- Smooth gradients and animations
- Professional control layouts
- High contrast for visibility