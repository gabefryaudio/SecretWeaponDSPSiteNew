let firstDraw = true;

export default function createPatchView(patchConnection) {
    console.log('Creating patch view...');
    const container = document.createElement("div");
    container.style.cssText = `
        background: #000;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-sizing: border-box;
        position: relative;
    `;
    
    // Set explicit plugin dimensions - FIXED at 1200x600
    container.style.width = '1200px';
    container.style.height = '600px';
    container.style.display = 'block';
    container.style.boxSizing = 'border-box';
    container.style.background = '#000';
    container.style.position = 'relative';
    
    // Mobile scaling factor
    let mobileScale = 1;
    window.updateTouchScale = (scale) => {
        mobileScale = scale;
    };
    
    // State management
    const bands = new Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        enabled: i < 3,  // Only first 3 bands enabled by default
        filterType: 0,
        frequency: [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000][i],
        gain: 0,
        q: 0.7,
        slope: 12,
        proportionalQ: false,
        asymmetric: false,
        asymmetryAmt: 1.3,
        selected: false,
        color: null
    }));
    
    let selectedBand = 0;
    let isDragging = false;
    let isSliding = false;
    let isCreatingBand = false;
    let mouseDownPos = null;
    let isSoloing = false;
    let soloedBand = 0;
    let bypassState = false;
    let inputGain = 0;
    let outputGain = 0;
    
    // FFT data storage
    let fftData = [];
    let smoothedFftData = new Array(256).fill(0);
    const smoothingFactor = 0.85;
    
    // FFT zoom state
    let fftMinFreq = 20;
    let fftMaxFreq = 20000;
    let defaultMinFreq = 20;
    let defaultMaxFreq = 20000;
    
    // FFT amplitude range
    let fftMinDb = -80;
    let fftMaxDb = 10;
    let defaultMinDb = -80;
    let defaultMaxDb = 10;
    
    // Premium color palette with gradients
    const bandColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
    ];
    
    const bandColorsSolid = [
        '#667eea', '#f5576c', '#00f2fe', '#38f9d7', '#fee140',
        '#330867', '#fed6e3', '#fecfef', '#fcb69f', '#bfe9ff'
    ];
    
    bands.forEach((band, i) => {
        band.color = bandColorsSolid[i];
        band.gradient = bandColors[i];
    });
    
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            /* Animated background */
            .bg-animation {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(255, 219, 98, 0.08) 0%, transparent 50%);
                pointer-events: none;
                opacity: 0.5;
                animation: bgPulse 20s ease-in-out infinite;
                z-index: 0;
            }
            
            @keyframes bgPulse {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(1.05); }
            }
            
            .header {
                position: relative;
                height: 60px;
                min-height: 60px;
                background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                padding: 0 30px;
                justify-content: space-between;
                backdrop-filter: blur(40px) saturate(150%);
                z-index: 10;
                flex-shrink: 0;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .logo {
                font-size: 22px;
                font-weight: 300;
                letter-spacing: 6px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-transform: uppercase;
                position: relative;
            }
            
            .controls-section {
                display: flex;
                align-items: center;
                gap: 25px;
            }
            
            .gain-control {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: rgba(255,255,255,0.03);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.06);
                transition: all 0.3s;
            }
            
            .gain-control:hover {
                background: rgba(255,255,255,0.05);
                border-color: rgba(255,255,255,0.1);
                transform: translateY(-1px);
            }
            
            .gain-label {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: rgba(255,255,255,0.4);
            }
            
            .gain-knob-container {
                position: relative;
                width: 48px;
                height: 48px;
            }
            
            .gain-knob-track {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40px;
                height: 40px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: conic-gradient(
                    from 225deg,
                    rgba(102, 126, 234, 0.3) 0deg,
                    rgba(102, 126, 234, 0.8) 270deg,
                    rgba(102, 126, 234, 0.3) 270deg
                );
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .gain-knob {
                position: relative;
                width: 40px;
                height: 40px;
                background: 
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), rgba(255,255,255,0.05)),
                    linear-gradient(145deg, #1a1a2e, #0a0a15);
                border-radius: 50%;
                cursor: grab;
                box-shadow: 
                    0 6px 20px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.1),
                    inset 0 -2px 4px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            }
            
            .gain-knob:hover {
                transform: scale(1.05);
            }
            
            .gain-knob:hover ~ .gain-knob-track {
                opacity: 1;
            }
            
            .gain-knob::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 30px;
                height: 30px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
            }
            
            .gain-knob::after {
                content: '';
                position: absolute;
                width: 3px;
                height: 16px;
                background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
                top: 6px;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);
            }
            
            .gain-value {
                font-size: 12px;
                font-weight: 600;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                min-width: 50px;
                text-align: center;
            }
            
            .bypass-button {
                width: 48px;
                height: 48px;
                background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 50%;
                color: rgba(255,255,255,0.7);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                box-shadow: 
                    0 6px 20px rgba(0,0,0,0.3),
                    inset 0 2px 4px rgba(255,255,255,0.1);
                position: relative;
                overflow: hidden;
            }
            
            .bypass-button::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(255, 67, 101, 0.8) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                transition: all 0.4s;
                border-radius: 50%;
            }
            
            .bypass-button:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 
                    0 12px 32px rgba(0,0,0,0.4),
                    inset 0 2px 4px rgba(255,255,255,0.15);
                border-color: rgba(255,255,255,0.2);
            }
            
            .bypass-button.active {
                background: linear-gradient(135deg, #ff4365 0%, #ff1744 100%);
                color: white;
                border-color: transparent;
                animation: pulseGlow 2s ease-in-out infinite;
            }
            
            .bypass-button.active::before {
                width: 100px;
                height: 100px;
            }
            
            @keyframes pulseGlow {
                0%, 100% { 
                    box-shadow: 
                        0 8px 24px rgba(255, 67, 101, 0.4),
                        0 0 40px rgba(255, 67, 101, 0.2);
                }
                50% { 
                    box-shadow: 
                        0 8px 24px rgba(255, 67, 101, 0.6),
                        0 0 60px rgba(255, 67, 101, 0.4);
                }
            }
            
            .analyzer-section {
                flex: 1;
                position: relative;
                overflow: hidden;
                min-height: 250px;
                display: flex;
                align-items: stretch;
                padding: 15px;
            }
            
            .analyzer-container {
                flex: 1;
                background: linear-gradient(135deg, #0a0a0f 0%, #14141f 100%);
                border: 1px solid rgba(102, 126, 234, 0.2);
                border-radius: 20px;
                position: relative;
                overflow: hidden;
                box-shadow: 
                    0 0 0 1px rgba(255,255,255,0.06),
                    inset 0 2px 8px rgba(0,0,0,0.5),
                    0 20px 40px rgba(0,0,0,0.5);
                min-height: 200px;
            }
            
            .analyzer-glow {
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, 
                    transparent 30%, 
                    rgba(102, 126, 234, 0.3) 50%, 
                    transparent 70%);
                background-size: 200% 200%;
                animation: glowMove 8s linear infinite;
                border-radius: 24px;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            
            .analyzer-container:hover .analyzer-glow {
                opacity: 1;
            }
            
            @keyframes glowMove {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 200%; }
            }
            
            #analyzerCanvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: crosshair;
                display: block;
            }
            
            .band-strip {
                height: 70px;
                background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
                border-top: 1px solid rgba(255,255,255,0.08);
                padding: 0 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                overflow-x: auto;
                overflow-y: hidden;
                flex-shrink: 0;
                position: relative;
            }
            
            .band-strip::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 20px;
                background: linear-gradient(90deg, #000 0%, transparent 100%);
                pointer-events: none;
                z-index: 1;
            }
            
            .band-strip::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 20px;
                background: linear-gradient(-90deg, #000 0%, transparent 100%);
                pointer-events: none;
                z-index: 1;
            }
            
            .band-strip::-webkit-scrollbar {
                height: 4px;
            }
            
            .band-strip::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .band-strip::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
            }
            
            .band-button {
                min-width: 65px;
                height: 55px;
                background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                flex-shrink: 0;
                overflow: hidden;
            }
            
            .band-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--band-gradient);
                opacity: 0;
                transition: opacity 0.3s;
                border-radius: 16px;
            }
            
            .band-button:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 12px 32px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.15);
            }
            
            .band-button:hover::before {
                opacity: 0.1;
            }
            
            .band-button.selected {
                background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                border-color: var(--band-color);
                box-shadow: 
                    0 0 30px rgba(var(--band-rgb), 0.3),
                    inset 0 0 20px rgba(var(--band-rgb), 0.1);
                transform: translateY(-2px);
            }
            
            .band-button.selected::before {
                opacity: 0.2;
            }
            
            .band-button.disabled {
                opacity: 0.3;
                transform: scale(0.95);
            }
            
            .band-button.disabled:hover {
                transform: scale(0.95);
                box-shadow: none;
            }
            
            .band-number {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 2px;
                position: relative;
                z-index: 1;
            }
            
            .band-type {
                font-size: 9px;
                text-transform: uppercase;
                opacity: 0.6;
                letter-spacing: 1px;
                font-weight: 600;
                position: relative;
                z-index: 1;
            }
            
            .band-color-indicator {
                position: absolute;
                top: 6px;
                right: 6px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                box-shadow: 
                    0 0 12px currentColor,
                    inset 0 0 4px rgba(255,255,255,0.5);
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .properties-section {
                height: 185px;
                min-height: 185px;
                max-height: 185px;
                background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
                border-top: 1px solid rgba(255,255,255,0.08);
                padding: 15px 20px;
                display: flex;
                gap: 20px;
                overflow-x: auto;
                overflow-y: hidden;
                flex-shrink: 0;
                position: relative;
            }
            
            .properties-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(102, 126, 234, 0.5) 50%, 
                    transparent 100%);
            }
            
            .property-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-width: 180px;
                padding: 12px 15px;
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.05);
                transition: all 0.3s;
                height: fit-content;
            }
            
            .property-group:hover {
                background: rgba(255,255,255,0.03);
                border-color: rgba(255,255,255,0.08);
                transform: translateY(-2px);
            }
            
            .properties-section::-webkit-scrollbar {
                height: 6px;
            }
            
            .properties-section::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 3px;
            }
            
            .properties-section::-webkit-scrollbar-thumb {
                background: rgba(102, 126, 234, 0.5);
                border-radius: 3px;
                transition: background 0.2s;
            }
            
            .properties-section::-webkit-scrollbar-thumb:hover {
                background: rgba(102, 126, 234, 0.7);
            }
            
            .property-title {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: rgba(255,255,255,0.5);
                margin-bottom: 8px;
                position: relative;
                padding-left: 16px;
            }
            
            .property-title::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 10px;
                height: 2px;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }
            
            .property-control {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .property-label {
                font-size: 12px;
                color: rgba(255,255,255,0.8);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 500;
            }
            
            .property-value {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 600;
                font-size: 12px;
                min-width: 50px;
                text-align: right;
            }
            
            .property-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 6px;
                background: rgba(255,255,255,0.08);
                border-radius: 3px;
                outline: none;
                transition: all 0.3s;
                position: relative;
                overflow: visible;
            }
            
            .property-slider:hover {
                background: rgba(255,255,255,0.12);
            }
            
            .property-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 
                    0 3px 10px rgba(0,0,0,0.4),
                    0 0 0 2px rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
            }
            
            .property-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 
                    0 0 0 8px rgba(102, 126, 234, 0.1),
                    0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .property-slider::-webkit-slider-thumb:active {
                transform: scale(1.1);
                box-shadow: 
                    0 0 0 12px rgba(102, 126, 234, 0.15),
                    0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .property-slider.dragging {
                background: linear-gradient(90deg, 
                    rgba(102, 126, 234, 0.3) 0%, 
                    rgba(102, 126, 234, 0.1) var(--progress), 
                    rgba(255,255,255,0.08) var(--progress));
            }
            
            .filter-type-select {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                outline: none;
                transition: all 0.3s;
                margin-top: 2px;
            }
            
            .filter-type-select option {
                background: #1a1a1f;
                color: white;
                padding: 8px;
            }
            
            .filter-type-select:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.15);
                transform: translateY(-1px);
            }
            
            .filter-type-select:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
            }
            
            .toggle-switch {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 6px 0;
            }
            
            .toggle-switch label {
                font-size: 12px;
                font-weight: 500;
                color: rgba(255,255,255,0.8);
                cursor: pointer;
                user-select: none;
            }
            
            .toggle-switch input[type="checkbox"] {
                position: relative;
                width: 36px;
                height: 20px;
                -webkit-appearance: none;
                appearance: none;
                background: rgba(255,255,255,0.1);
                outline: none;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .toggle-switch input[type="checkbox"]:checked {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-color: transparent;
            }
            
            .toggle-switch input[type="checkbox"]::before {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                top: 1px;
                left: 1px;
                background: white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .toggle-switch input[type="checkbox"]:checked::before {
                transform: translateX(16px);
                box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            }
            
            .control-point {
                position: absolute;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 3px solid white;
                cursor: grab;
                transform: translate(-50%, -50%);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 100;
                box-shadow: 
                    0 0 20px rgba(0,0,0,0.4),
                    0 0 30px currentColor,
                    inset 0 0 8px rgba(255,255,255,0.3);
                pointer-events: all;
                backdrop-filter: blur(10px);
            }
            
            .control-point::before {
                content: '';
                position: absolute;
                top: -12px;
                left: -12px;
                right: -12px;
                bottom: -12px;
                border-radius: 50%;
                background: radial-gradient(circle, currentColor 0%, transparent 60%);
                opacity: 0.2;
                pointer-events: none;
                animation: pointPulse 3s ease-in-out infinite;
            }
            
            @keyframes pointPulse {
                0%, 100% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.3); opacity: 0.1; }
            }
            
            .control-point:hover {
                transform: translate(-50%, -50%) scale(1.3);
                box-shadow: 
                    0 0 30px rgba(0,0,0,0.5),
                    0 0 60px currentColor,
                    inset 0 0 15px rgba(255,255,255,0.5);
            }
            
            .control-point:active,
            .control-point.dragging {
                cursor: grabbing;
                transform: translate(-50%, -50%) scale(1.2);
                transition: none !important;
            }
            
            .control-point.selected {
                animation: selectedPulse 1.5s ease-in-out infinite;
            }
            
            @keyframes selectedPulse {
                0%, 100% { 
                    box-shadow: 
                        0 0 30px rgba(0,0,0,0.5),
                        0 0 60px currentColor,
                        inset 0 0 15px rgba(255,255,255,0.5);
                }
                50% { 
                    box-shadow: 
                        0 0 40px rgba(0,0,0,0.6),
                        0 0 80px currentColor,
                        inset 0 0 20px rgba(255,255,255,0.7);
                }
            }
            
            .tooltip {
                position: fixed;
                background: linear-gradient(135deg, rgba(20,20,30,0.98) 0%, rgba(10,10,20,0.98) 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                pointer-events: none;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1000;
                white-space: nowrap;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            }
            
            .tooltip.visible {
                opacity: 1;
                transform: translateY(-4px);
            }
            
            .tooltip::before {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 8px;
                height: 8px;
                background: rgba(10,10,20,0.98);
                border-right: 1px solid rgba(255,255,255,0.1);
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at center, rgba(20,20,30,0.95) 0%, rgba(0,0,0,0.98) 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(20px);
                transition: all 0.5s;
            }
            
            .loading-overlay.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .loading-content {
                text-align: center;
            }
            
            .loading-logo {
                font-size: 36px;
                font-weight: 300;
                letter-spacing: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 30px;
                animation: logoGlow 2s ease-in-out infinite;
            }
            
            @keyframes logoGlow {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                position: relative;
                margin: 0 auto 25px;
            }
            
            .loading-spinner::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50%;
                border: 3px solid rgba(255,255,255,0.1);
            }
            
            .loading-spinner::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #667eea;
                border-right-color: #764ba2;
                animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                font-size: 14px;
                color: rgba(255,255,255,0.6);
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .drag-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9998;
                cursor: grabbing;
                display: none;
            }
            
            .drag-overlay.active {
                display: block;
            }
            
            /* Premium animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .property-group {
                animation: fadeIn 0.5s ease-out;
                animation-fill-mode: both;
            }
            
            .property-group:nth-child(1) { animation-delay: 0.1s; }
            .property-group:nth-child(2) { animation-delay: 0.2s; }
            .property-group:nth-child(3) { animation-delay: 0.3s; }
            .property-group:nth-child(4) { animation-delay: 0.4s; }
            
            /* Glow effects */
            .glow-effect {
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
                animation: glowExpand 0.6s ease-out;
            }
            
            @keyframes glowExpand {
                from {
                    width: 0;
                    height: 0;
                    opacity: 0.8;
                }
                to {
                    width: 100px;
                    height: 100px;
                    opacity: 0;
                }
            }
        </style>
        
        <div class="bg-animation"></div>
        
        <div class="header">
            <div class="logo-section">
                <div class="logo">QUANTUM EQ</div>
            </div>
            
            <div class="controls-section">
                <div class="gain-control">
                    <div class="gain-label">Input</div>
                    <div class="gain-knob-container">
                        <div class="gain-knob-track"></div>
                        <div class="gain-knob" id="inputGainKnob" title="Input Gain | Drag to adjust | Ctrl+Click to reset"></div>
                    </div>
                    <div class="gain-value" id="inputGainValue">0.0 dB</div>
                </div>
                
                <div class="gain-control">
                    <div class="gain-label">Output</div>
                    <div class="gain-knob-container">
                        <div class="gain-knob-track"></div>
                        <div class="gain-knob" id="outputGainKnob" title="Output Gain | Drag to adjust | Ctrl+Click to reset"></div>
                    </div>
                    <div class="gain-value" id="outputGainValue">0.0 dB</div>
                </div>
                
                <button class="bypass-button" id="bypassButton" title="Bypass EQ Processing | Hotkey: B">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="analyzer-section">
            <div class="analyzer-container" id="analyzerContainer">
                <div class="analyzer-glow"></div>
                <canvas id="analyzerCanvas"></canvas>
                <div class="tooltip" id="tooltip"></div>
            </div>
        </div>
        
        <div class="band-strip" id="bandStrip">
            <!-- Band buttons will be added dynamically -->
        </div>
        
        <div class="properties-section" id="propertiesSection">
            <!-- Properties will be shown when a band is selected -->
        </div>
        
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="loading-logo">QUANTUM</div>
                <div class="loading-spinner"></div>
                <div class="loading-text">Initializing Processor</div>
            </div>
        </div>
        
        <div class="drag-overlay" id="dragOverlay"></div>
    `;
    
    console.log('HTML template set, getting DOM elements...');
    
    // Get DOM elements
    const analyzerCanvas = container.querySelector('#analyzerCanvas');
    let ctx = analyzerCanvas.getContext('2d', { 
        alpha: false,
        desynchronized: true
    });
    ctx.imageSmoothingEnabled = true;
    const analyzerContainer = container.querySelector('#analyzerContainer');
    const bandStrip = container.querySelector('#bandStrip');
    const propertiesSection = container.querySelector('#propertiesSection');
    const tooltip = container.querySelector('#tooltip');
    const bypassButton = container.querySelector('#bypassButton');
    const loadingOverlay = container.querySelector('#loadingOverlay');
    const dragOverlay = container.querySelector('#dragOverlay');
    
    // Add listener for FFT data
    patchConnection.addEndpointListener('dftOut', (event) => {
        if (event && event.magnitudes) {
            fftData = event.magnitudes;
            
            // Apply smoothing with adaptive factor
            const adaptiveFactor = isDragging || isSliding ? 0.9 : smoothingFactor;
            for (let i = 0; i < fftData.length && i < smoothedFftData.length; i++) {
                smoothedFftData[i] = smoothedFftData[i] * adaptiveFactor + fftData[i] * (1 - adaptiveFactor);
            }
            
            requestDraw();
        }
    });
    
    // Frequency conversion functions
    function freqToX(freq, leftMargin = 60, rightMargin = 40) {
        const minFreq = Math.log10(fftMinFreq);
        const maxFreq = Math.log10(fftMaxFreq);
        const logFreq = Math.log10(freq);
        const graphWidth = analyzerCanvas.width - leftMargin - rightMargin;
        return leftMargin + ((logFreq - minFreq) / (maxFreq - minFreq)) * graphWidth;
    }
    
    function xToFreq(x, leftMargin = 60, rightMargin = 40) {
        const minFreq = Math.log10(fftMinFreq);
        const maxFreq = Math.log10(fftMaxFreq);
        const graphWidth = analyzerCanvas.width - leftMargin - rightMargin;
        const adjustedX = Math.max(0, x - leftMargin);
        const logFreq = minFreq + (adjustedX / graphWidth) * (maxFreq - minFreq);
        return Math.pow(10, logFreq);
    }
    
    function gainToY(gain, topMargin = 20, bottomMargin = 40) {
        const maxGain = 24;
        const minGain = -24;
        const graphHeight = analyzerCanvas.height - topMargin - bottomMargin;
        const y = topMargin + ((maxGain - gain) / (maxGain - minGain)) * graphHeight;
        return y;
    }
    
    function dbToY(db, topMargin = 20, bottomMargin = 40) {
        const normalized = (fftMaxDb - db) / (fftMaxDb - fftMinDb);
        const graphHeight = analyzerCanvas.height - topMargin - bottomMargin;
        return topMargin + normalized * graphHeight;
    }
    
    function yToGain(y, topMargin = 20, bottomMargin = 40) {
        const maxGain = 24;
        const minGain = -24;
        const graphHeight = analyzerCanvas.height - topMargin - bottomMargin;
        const adjustedY = Math.max(0, y - topMargin);
        return maxGain - (adjustedY / graphHeight) * (maxGain - minGain);
    }
    
    // Calculate filter response
    function calculateFilterResponse(band, freq) {
        if (!band.enabled) return 0;
        
        let gain = 0;
        
        try {
            switch (band.filterType) {
            case 0: // Bell
                const fc = band.frequency;
                const gain_dB = band.gain;
                
                let Q = band.q;
                
                if (band.proportionalQ) {
                    const absGain = Math.abs(gain_dB);
                    if (gain_dB < 0) {
                        Q = Q * (1 + absGain / 12);
                    } else {
                        Q = Q / (1 + absGain / 12);
                    }
                }
                
                if (band.asymmetric && gain_dB !== 0) {
                    const ratio = freq / fc;
                    if (gain_dB > 0) {
                        if (ratio > 1) {
                            Q = Q / band.asymmetryAmt;
                        }
                    } else {
                        if (ratio < 1) {
                            Q = Q / band.asymmetryAmt;
                        }
                    }
                }
                
                const sampleRate = 88200;
                const omega = 2 * Math.PI * fc / sampleRate;
                const sin_omega = Math.sin(omega);
                const cos_omega = Math.cos(omega);
                const A = Math.pow(10, gain_dB / 40);
                const alpha = sin_omega / (2 * Q);
                
                const b0 = 1 + alpha * A;
                const b1 = -2 * cos_omega;
                const b2 = 1 - alpha * A;
                const a0 = 1 + alpha / A;
                const a1 = -2 * cos_omega;
                const a2 = 1 - alpha / A;
                
                const omega_test = 2 * Math.PI * freq / sampleRate;
                const cos_omega_test = Math.cos(omega_test);
                const sin_omega_test = Math.sin(omega_test);
                
                const real_num = b0 + b1 * cos_omega_test + b2 * Math.cos(2 * omega_test);
                const imag_num = b1 * sin_omega_test + b2 * Math.sin(2 * omega_test);
                const real_den = a0 + a1 * cos_omega_test + a2 * Math.cos(2 * omega_test);
                const imag_den = a1 * sin_omega_test + a2 * Math.sin(2 * omega_test);
                
                const mag_num = Math.sqrt(real_num * real_num + imag_num * imag_num);
                const mag_den = Math.sqrt(real_den * real_den + imag_den * imag_den);
                
                gain = 20 * Math.log10(mag_num / mag_den);
                break;
                
            case 1: // High Pass
                const hp_cutoff = band.frequency;
                const hp_order = band.slope / 6;
                const hp_q = band.q || 0.7071; // Default Q for Butterworth response
                
                // Calculate cascaded biquad response for high-pass
                let hp_response = { real: 1, imag: 0 };
                
                for (let stage = 0; stage < hp_order; stage++) {
                    const w0_hp = 2 * Math.PI * hp_cutoff / 48000;
                    const cos_w0_hp = Math.cos(w0_hp);
                    const alpha_hp = Math.sin(w0_hp) / (2 * hp_q);
                    
                    // High-pass biquad coefficients
                    const b0_hp = (1 + cos_w0_hp) / 2;
                    const b1_hp = -(1 + cos_w0_hp);
                    const b2_hp = (1 + cos_w0_hp) / 2;
                    const a0_hp = 1 + alpha_hp;
                    const a1_hp = -2 * cos_w0_hp;
                    const a2_hp = 1 - alpha_hp;
                    
                    // Normalize
                    const b0n_hp = b0_hp / a0_hp;
                    const b1n_hp = b1_hp / a0_hp;
                    const b2n_hp = b2_hp / a0_hp;
                    const a1n_hp = a1_hp / a0_hp;
                    const a2n_hp = a2_hp / a0_hp;
                    
                    // Frequency response at current frequency
                    const w_hp = 2 * Math.PI * freq / 48000;
                    const ejw_hp = { real: Math.cos(w_hp), imag: Math.sin(w_hp) };
                    const ejw2_hp = { real: Math.cos(2 * w_hp), imag: Math.sin(2 * w_hp) };
                    
                    const num_hp = {
                        real: b0n_hp + b1n_hp * ejw_hp.real + b2n_hp * ejw2_hp.real,
                        imag: -b1n_hp * ejw_hp.imag - b2n_hp * ejw2_hp.imag
                    };
                    
                    const den_hp = {
                        real: 1 + a1n_hp * ejw_hp.real + a2n_hp * ejw2_hp.real,
                        imag: -a1n_hp * ejw_hp.imag - a2n_hp * ejw2_hp.imag
                    };
                    
                    // Multiply responses (cascade)
                    const temp_real = hp_response.real * (num_hp.real * den_hp.real + num_hp.imag * den_hp.imag) / (den_hp.real * den_hp.real + den_hp.imag * den_hp.imag) -
                                     hp_response.imag * (num_hp.imag * den_hp.real - num_hp.real * den_hp.imag) / (den_hp.real * den_hp.real + den_hp.imag * den_hp.imag);
                    const temp_imag = hp_response.real * (num_hp.imag * den_hp.real - num_hp.real * den_hp.imag) / (den_hp.real * den_hp.real + den_hp.imag * den_hp.imag) +
                                     hp_response.imag * (num_hp.real * den_hp.real + num_hp.imag * den_hp.imag) / (den_hp.real * den_hp.real + den_hp.imag * den_hp.imag);
                    
                    hp_response.real = temp_real;
                    hp_response.imag = temp_imag;
                }
                
                const hp_magnitude = Math.sqrt(hp_response.real * hp_response.real + hp_response.imag * hp_response.imag);
                gain = 20 * Math.log10(hp_magnitude);
                break;
                
            case 2: // Low Pass
                const lp_cutoff = band.frequency;
                const lp_order = band.slope / 6;
                const lp_q = band.q || 0.7071; // Default Q for Butterworth response
                
                // Calculate cascaded biquad response for low-pass
                let lp_response = { real: 1, imag: 0 };
                
                for (let stage = 0; stage < lp_order; stage++) {
                    const w0_lp = 2 * Math.PI * lp_cutoff / 48000;
                    const cos_w0_lp = Math.cos(w0_lp);
                    const alpha_lp = Math.sin(w0_lp) / (2 * lp_q);
                    
                    // Low-pass biquad coefficients
                    const b0_lp = (1 - cos_w0_lp) / 2;
                    const b1_lp = 1 - cos_w0_lp;
                    const b2_lp = (1 - cos_w0_lp) / 2;
                    const a0_lp = 1 + alpha_lp;
                    const a1_lp = -2 * cos_w0_lp;
                    const a2_lp = 1 - alpha_lp;
                    
                    // Normalize
                    const b0n_lp = b0_lp / a0_lp;
                    const b1n_lp = b1_lp / a0_lp;
                    const b2n_lp = b2_lp / a0_lp;
                    const a1n_lp = a1_lp / a0_lp;
                    const a2n_lp = a2_lp / a0_lp;
                    
                    // Frequency response at current frequency
                    const w_lp = 2 * Math.PI * freq / 48000;
                    const ejw_lp = { real: Math.cos(w_lp), imag: Math.sin(w_lp) };
                    const ejw2_lp = { real: Math.cos(2 * w_lp), imag: Math.sin(2 * w_lp) };
                    
                    const num_lp = {
                        real: b0n_lp + b1n_lp * ejw_lp.real + b2n_lp * ejw2_lp.real,
                        imag: -b1n_lp * ejw_lp.imag - b2n_lp * ejw2_lp.imag
                    };
                    
                    const den_lp = {
                        real: 1 + a1n_lp * ejw_lp.real + a2n_lp * ejw2_lp.real,
                        imag: -a1n_lp * ejw_lp.imag - a2n_lp * ejw2_lp.imag
                    };
                    
                    // Multiply responses (cascade)
                    const temp_real = lp_response.real * (num_lp.real * den_lp.real + num_lp.imag * den_lp.imag) / (den_lp.real * den_lp.real + den_lp.imag * den_lp.imag) -
                                     lp_response.imag * (num_lp.imag * den_lp.real - num_lp.real * den_lp.imag) / (den_lp.real * den_lp.real + den_lp.imag * den_lp.imag);
                    const temp_imag = lp_response.real * (num_lp.imag * den_lp.real - num_lp.real * den_lp.imag) / (den_lp.real * den_lp.real + den_lp.imag * den_lp.imag) +
                                     lp_response.imag * (num_lp.real * den_lp.real + num_lp.imag * den_lp.imag) / (den_lp.real * den_lp.real + den_lp.imag * den_lp.imag);
                    
                    lp_response.real = temp_real;
                    lp_response.imag = temp_imag;
                }
                
                const lp_magnitude = Math.sqrt(lp_response.real * lp_response.real + lp_response.imag * lp_response.imag);
                gain = 20 * Math.log10(lp_magnitude);
                break;
                
            case 3: // High Shelf
                const hs_freq = band.frequency;
                const hs_gain = band.gain;
                const hs_q = band.q || 0.7;
                
                // Biquad high shelf response
                const A_hs = Math.pow(10, hs_gain / 40);
                const w0_hs = 2 * Math.PI * hs_freq / 48000;
                const cos_w0_hs = Math.cos(w0_hs);
                const S_hs = 1; // Shelf slope = 1 for standard response
                const alpha_hs = Math.sin(w0_hs) / 2 * Math.sqrt((A_hs + 1/A_hs) * (1/S_hs - 1) + 2);
                
                const b0_hs = A_hs * ((A_hs + 1) + (A_hs - 1) * cos_w0_hs + 2 * Math.sqrt(A_hs) * alpha_hs);
                const b1_hs = -2 * A_hs * ((A_hs - 1) + (A_hs + 1) * cos_w0_hs);
                const b2_hs = A_hs * ((A_hs + 1) + (A_hs - 1) * cos_w0_hs - 2 * Math.sqrt(A_hs) * alpha_hs);
                const a0_hs = (A_hs + 1) - (A_hs - 1) * cos_w0_hs + 2 * Math.sqrt(A_hs) * alpha_hs;
                const a1_hs = 2 * ((A_hs - 1) - (A_hs + 1) * cos_w0_hs);
                const a2_hs = (A_hs + 1) - (A_hs - 1) * cos_w0_hs - 2 * Math.sqrt(A_hs) * alpha_hs;
                
                // Normalize coefficients
                const b0n_hs = b0_hs / a0_hs;
                const b1n_hs = b1_hs / a0_hs;
                const b2n_hs = b2_hs / a0_hs;
                const a1n_hs = a1_hs / a0_hs;
                const a2n_hs = a2_hs / a0_hs;
                
                // Calculate frequency response at current frequency
                const w_hs = 2 * Math.PI * freq / 48000;
                const ejw_hs = { real: Math.cos(w_hs), imag: Math.sin(w_hs) };
                const ejw2_hs = { real: Math.cos(2 * w_hs), imag: Math.sin(2 * w_hs) };
                
                // H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
                const num_hs = {
                    real: b0n_hs + b1n_hs * ejw_hs.real + b2n_hs * ejw2_hs.real,
                    imag: -b1n_hs * ejw_hs.imag - b2n_hs * ejw2_hs.imag
                };
                
                const den_hs = {
                    real: 1 + a1n_hs * ejw_hs.real + a2n_hs * ejw2_hs.real,
                    imag: -a1n_hs * ejw_hs.imag - a2n_hs * ejw2_hs.imag
                };
                
                const mag_num_hs = Math.sqrt(num_hs.real * num_hs.real + num_hs.imag * num_hs.imag);
                const mag_den_hs = Math.sqrt(den_hs.real * den_hs.real + den_hs.imag * den_hs.imag);
                
                gain = 20 * Math.log10(mag_num_hs / mag_den_hs);
                break;
                
            case 4: // Low Shelf
                const ls_freq = band.frequency;
                const ls_gain = band.gain;
                const ls_q = band.q || 0.7;
                
                // Biquad low shelf response
                const A_ls = Math.pow(10, ls_gain / 40);
                const w0_ls = 2 * Math.PI * ls_freq / 48000;
                const cos_w0_ls = Math.cos(w0_ls);
                const S_ls = 1; // Shelf slope = 1 for standard response
                const alpha_ls = Math.sin(w0_ls) / 2 * Math.sqrt((A_ls + 1/A_ls) * (1/S_ls - 1) + 2);
                
                const b0_ls = A_ls * ((A_ls + 1) - (A_ls - 1) * cos_w0_ls + 2 * Math.sqrt(A_ls) * alpha_ls);
                const b1_ls = 2 * A_ls * ((A_ls - 1) - (A_ls + 1) * cos_w0_ls);
                const b2_ls = A_ls * ((A_ls + 1) - (A_ls - 1) * cos_w0_ls - 2 * Math.sqrt(A_ls) * alpha_ls);
                const a0_ls = (A_ls + 1) + (A_ls - 1) * cos_w0_ls + 2 * Math.sqrt(A_ls) * alpha_ls;
                const a1_ls = -2 * ((A_ls - 1) + (A_ls + 1) * cos_w0_ls);
                const a2_ls = (A_ls + 1) + (A_ls - 1) * cos_w0_ls - 2 * Math.sqrt(A_ls) * alpha_ls;
                
                // Normalize coefficients
                const b0n_ls = b0_ls / a0_ls;
                const b1n_ls = b1_ls / a0_ls;
                const b2n_ls = b2_ls / a0_ls;
                const a1n_ls = a1_ls / a0_ls;
                const a2n_ls = a2_ls / a0_ls;
                
                // Calculate frequency response at current frequency
                const w_ls = 2 * Math.PI * freq / 48000;
                const ejw_ls = { real: Math.cos(w_ls), imag: Math.sin(w_ls) };
                const ejw2_ls = { real: Math.cos(2 * w_ls), imag: Math.sin(2 * w_ls) };
                
                // H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
                const num_ls = {
                    real: b0n_ls + b1n_ls * ejw_ls.real + b2n_ls * ejw2_ls.real,
                    imag: -b1n_ls * ejw_ls.imag - b2n_ls * ejw2_ls.imag
                };
                
                const den_ls = {
                    real: 1 + a1n_ls * ejw_ls.real + a2n_ls * ejw2_ls.real,
                    imag: -a1n_ls * ejw_ls.imag - a2n_ls * ejw2_ls.imag
                };
                
                const mag_num_ls = Math.sqrt(num_ls.real * num_ls.real + num_ls.imag * num_ls.imag);
                const mag_den_ls = Math.sqrt(den_ls.real * den_ls.real + den_ls.imag * den_ls.imag);
                
                gain = 20 * Math.log10(mag_num_ls / mag_den_ls);
                break;
                
            case 5: // Notch
                const notch_freq = band.frequency;
                const notch_q = band.q;
                const bandwidth = notch_freq / notch_q;
                
                if (Math.abs(freq - notch_freq) < bandwidth / 2) {
                    const depth = -60;
                    const x = 2 * (freq - notch_freq) / bandwidth;
                    gain = depth * Math.exp(-x * x);
                }
                break;
        }
        } catch (error) {
            console.error('Error calculating filter response:', error, band);
            return 0;
        }
        
        return gain;
    }
    
    // Animation frame handling
    let rafId = null;
    let lastDrawTime = 0;
    
    function requestDraw() {
        if (rafId) return;
        
        rafId = requestAnimationFrame((timestamp) => {
            rafId = null;
            drawAnalyzer();
            lastDrawTime = timestamp;
        });
    }
    
    // Premium analyzer drawing
    function drawAnalyzer() {
        if (!ctx) {
            ctx = analyzerCanvas.getContext('2d', { 
                alpha: false,
                desynchronized: true
            });
            ctx.imageSmoothingEnabled = true;
        }
        
        const width = analyzerCanvas.width;
        const height = analyzerCanvas.height;
        
        if (width <= 0 || height <= 0) return;
        
        const leftMargin = 60;
        const rightMargin = 40;
        const topMargin = 20;
        const bottomMargin = 40;
        const graphWidth = width - leftMargin - rightMargin;
        const graphHeight = height - topMargin - bottomMargin;
        
        ctx.save();
        
        // Clear with gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#0a0a0f');
        bgGradient.addColorStop(1, '#14141f');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw subtle grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        
        // Frequency grid lines
        const freqLines = [20, 30, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        ctx.font = '11px Inter, -apple-system, sans-serif';
        
        freqLines.forEach(freq => {
            if (freq >= fftMinFreq && freq <= fftMaxFreq) {
                const x = freqToX(freq, leftMargin, rightMargin);
                
                // Grid line with gradient
                const gradient = ctx.createLinearGradient(x, topMargin, x, height - bottomMargin);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
                gradient.addColorStop(0.5, freq === 1000 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
                
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(x, topMargin);
                ctx.lineTo(x, height - bottomMargin);
                ctx.stroke();
                
                // Frequency labels
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.textAlign = 'center';
                ctx.font = '10px Inter, -apple-system, sans-serif';
                ctx.fontWeight = '500';
                const label = freq >= 1000 ? `${freq/1000}k` : freq;
                ctx.fillText(label, x, height - 20);
            }
        });
        
        // Gain grid lines
        ctx.textAlign = 'right';
        
        for (let db = -24; db <= 24; db += 6) {
            const y = gainToY(db, topMargin, bottomMargin);
            
            // Grid line with gradient
            const gradient = ctx.createLinearGradient(leftMargin, y, width - rightMargin, y);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
            gradient.addColorStop(0.5, db === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = db === 0 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(leftMargin, y);
            ctx.lineTo(width - rightMargin, y);
            ctx.stroke();
            
            // dB labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '10px Inter, -apple-system, sans-serif';
            ctx.fillText(`${db > 0 ? '+' : ''}${db} dB`, leftMargin - 8, y + 4);
        }
        
        // Graph area subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(leftMargin, topMargin, graphWidth, graphHeight);
        
        // Clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(leftMargin, topMargin, graphWidth, graphHeight);
        ctx.clip();
        
        // Draw FFT spectrum with premium styling
        if (smoothedFftData && smoothedFftData.length > 0) {
            // Create gradient for spectrum fill
            const spectrumGradient = ctx.createLinearGradient(0, height - bottomMargin, 0, topMargin);
            spectrumGradient.addColorStop(0, 'rgba(255, 67, 101, 0.05)');
            spectrumGradient.addColorStop(0.3, 'rgba(255, 67, 101, 0.1)');
            spectrumGradient.addColorStop(0.6, 'rgba(255, 67, 101, 0.2)');
            spectrumGradient.addColorStop(1, 'rgba(255, 67, 101, 0.3)');
            
            // Draw filled spectrum
            ctx.fillStyle = spectrumGradient;
            ctx.beginPath();
            ctx.moveTo(leftMargin, height - bottomMargin);
            
            const sampleRate = 48000;
            const fftBinHz = sampleRate / 8192;
            
            let previousX = null;
            let previousY = null;
            let firstValidPoint = true;
            
            // Find the first two valid points for interpolation
            let firstPointX = null, firstPointY = null;
            let secondPointX = null, secondPointY = null;
            
            for (let i = 0; i < smoothedFftData.length; i++) {
                let fftBin;
                if (i < 16) {
                    fftBin = i * 2;
                } else if (i < 32) {
                    fftBin = 32 + (i - 16) * 3;
                } else if (i < 64) {
                    fftBin = 80 + (i - 32) * 5;
                } else if (i < 96) {
                    fftBin = 240 + (i - 64) * 10;
                } else if (i < 128) {
                    fftBin = 560 + (i - 96) * 15;
                } else if (i < 160) {
                    fftBin = 1040 + (i - 128) * 20;
                } else if (i < 192) {
                    fftBin = 1680 + (i - 160) * 25;
                } else if (i < 224) {
                    fftBin = 2480 + (i - 192) * 20;
                } else {
                    fftBin = 3120 + (i - 224) * 10;
                }
                
                const freq = Math.min(fftBin * fftBinHz, 20000);
                if (freq < 20 || freq > 20000) continue;
                
                const x = freqToX(freq, leftMargin, rightMargin);
                const magnitude = smoothedFftData[i];
                const db = 20 * Math.log10(Math.max(magnitude, 1e-10)) - 12;
                const y = dbToY(db, topMargin, bottomMargin);
                
                if (firstValidPoint) {
                    // If first point isn't at the left edge, interpolate from 20Hz
                    if (x > leftMargin + 1) {
                        // Store first point for interpolation
                        firstPointX = x;
                        firstPointY = y;
                        // Look for second point
                        for (let j = i + 1; j < smoothedFftData.length; j++) {
                            let fftBin2;
                            if (j < 16) {
                                fftBin2 = j * 2;
                            } else if (j < 32) {
                                fftBin2 = 32 + (j - 16) * 3;
                            } else if (j < 64) {
                                fftBin2 = 80 + (j - 32) * 5;
                            } else {
                                break; // We have enough for interpolation
                            }
                            const freq2 = fftBin2 * fftBinHz;
                            if (freq2 >= 20 && freq2 <= 20000) {
                                const x2 = freqToX(freq2, leftMargin, rightMargin);
                                const magnitude2 = smoothedFftData[j];
                                const db2 = 20 * Math.log10(Math.max(magnitude2, 1e-10)) - 12;
                                const y2 = dbToY(db2, topMargin, bottomMargin);
                                secondPointX = x2;
                                secondPointY = y2;
                                break;
                            }
                        }
                        
                        // Interpolate to find Y value at left margin (20Hz)
                        if (secondPointX !== null) {
                            const slope = (secondPointY - firstPointY) / (secondPointX - firstPointX);
                            const yAtLeftMargin = firstPointY - slope * (firstPointX - leftMargin);
                            ctx.lineTo(leftMargin, yAtLeftMargin);
                        } else {
                            // If no second point, just extend horizontally
                            ctx.lineTo(leftMargin, y);
                        }
                    }
                    firstValidPoint = false;
                }
                
                ctx.lineTo(x, y);
                previousX = x;
                previousY = y;
            }
            
            ctx.lineTo(width - rightMargin, height - bottomMargin);
            ctx.closePath();
            ctx.fill();
            
            // Draw spectrum line with glow
            ctx.strokeStyle = 'rgba(255, 67, 101, 0.9)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(255, 67, 101, 0.8)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            
            let lineFirstPoint = true;
            
            // Reuse the same interpolation logic for the line
            for (let i = 0; i < smoothedFftData.length; i++) {
                let fftBin;
                if (i < 16) {
                    fftBin = i * 2;
                } else if (i < 32) {
                    fftBin = 32 + (i - 16) * 3;
                } else if (i < 64) {
                    fftBin = 80 + (i - 32) * 5;
                } else if (i < 96) {
                    fftBin = 240 + (i - 64) * 10;
                } else if (i < 128) {
                    fftBin = 560 + (i - 96) * 15;
                } else if (i < 160) {
                    fftBin = 1040 + (i - 128) * 20;
                } else if (i < 192) {
                    fftBin = 1680 + (i - 160) * 25;
                } else if (i < 224) {
                    fftBin = 2480 + (i - 192) * 20;
                } else {
                    fftBin = 3120 + (i - 224) * 10;
                }
                
                const freq = Math.min(fftBin * fftBinHz, 20000);
                if (freq < 20 || freq > 20000) continue;
                
                const x = freqToX(freq, leftMargin, rightMargin);
                const magnitude = smoothedFftData[i];
                const db = 20 * Math.log10(Math.max(magnitude, 1e-10)) - 12;
                const y = dbToY(db, topMargin, bottomMargin);
                
                if (lineFirstPoint) {
                    // If first point isn't at the left edge, interpolate from 20Hz
                    if (x > leftMargin + 1) {
                        // Find second point for interpolation
                        let secondX = null, secondY = null;
                        for (let j = i + 1; j < smoothedFftData.length; j++) {
                            let fftBin2;
                            if (j < 16) {
                                fftBin2 = j * 2;
                            } else if (j < 32) {
                                fftBin2 = 32 + (j - 16) * 3;
                            } else if (j < 64) {
                                fftBin2 = 80 + (j - 32) * 5;
                            } else {
                                break;
                            }
                            const freq2 = fftBin2 * fftBinHz;
                            if (freq2 >= 20 && freq2 <= 20000) {
                                const x2 = freqToX(freq2, leftMargin, rightMargin);
                                const magnitude2 = smoothedFftData[j];
                                const db2 = 20 * Math.log10(Math.max(magnitude2, 1e-10)) - 12;
                                const y2 = dbToY(db2, topMargin, bottomMargin);
                                secondX = x2;
                                secondY = y2;
                                break;
                            }
                        }
                        
                        // Interpolate to find Y value at left margin (20Hz)
                        if (secondX !== null) {
                            const slope = (secondY - y) / (secondX - x);
                            const yAtLeftMargin = y - slope * (x - leftMargin);
                            ctx.moveTo(leftMargin, yAtLeftMargin);
                            ctx.lineTo(x, y);
                        } else {
                            // If no second point, just extend horizontally
                            ctx.moveTo(leftMargin, y);
                            ctx.lineTo(x, y);
                        }
                    } else {
                        ctx.moveTo(x, y);
                    }
                    lineFirstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
        
        // Draw solo mode dimming overlay if active
        if (isSoloing && soloedBand > 0) {
            const band = bands[soloedBand - 1];
            const range = getBandFrequencyRange(band);
            
            // Convert frequencies to x coordinates
            const leftX = freqToX(range.low, leftMargin, rightMargin);
            const rightX = freqToX(range.high, leftMargin, rightMargin);
            
            // Draw dimming overlay outside the band range
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            
            // Left side dimming
            if (leftX > leftMargin) {
                ctx.fillRect(leftMargin, topMargin, leftX - leftMargin, height - topMargin - bottomMargin);
            }
            
            // Right side dimming
            if (rightX < width - rightMargin) {
                ctx.fillRect(rightX, topMargin, width - rightMargin - rightX, height - topMargin - bottomMargin);
            }
            
            // Draw frequency range indicators
            ctx.strokeStyle = '#ff4365';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.5;
            
            // Left boundary line
            ctx.beginPath();
            ctx.moveTo(leftX, topMargin);
            ctx.lineTo(leftX, height - bottomMargin);
            ctx.stroke();
            
            // Right boundary line
            ctx.beginPath();
            ctx.moveTo(rightX, topMargin);
            ctx.lineTo(rightX, height - bottomMargin);
            ctx.stroke();
            
            ctx.setLineDash([]);
            ctx.restore();
        }
        
        // Draw individual band curves outside clipping region
        ctx.shadowBlur = 0;
        const curveStep = isDragging || isSliding ? 8 : 3;
        
        bands.forEach((band, i) => {
            if (band.enabled) {
                const bandNum = i + 1;
                const isCurrentSoloBand = isSoloing && soloedBand === bandNum;
                
                // Dim other bands when in solo mode
                ctx.save();
                if (isSoloing && !isCurrentSoloBand) {
                    ctx.globalAlpha = 0.2;
                }
                
                // Create gradient stroke
                const gradient = ctx.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, band.color + '80');
                gradient.addColorStop(0.1, band.color + 'CC');
                gradient.addColorStop(0.5, band.color + 'FF');
                gradient.addColorStop(0.9, band.color + 'CC');
                gradient.addColorStop(1, band.color + '80');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = (band.selected || isCurrentSoloBand) ? 4 : 2.5;
                ctx.shadowColor = band.color;
                ctx.shadowBlur = (band.selected || isCurrentSoloBand) ? 20 : 10;
                
                ctx.beginPath();
                let firstPoint = true;
                
                for (let x = leftMargin; x < width - rightMargin; x += curveStep) {
                    const freq = xToFreq(x, leftMargin, rightMargin);
                    const gain = calculateFilterResponse(band, freq);
                    const y = gainToY(gain, topMargin, bottomMargin);
                    
                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        });
        
        // Draw zoom indicator with premium styling
        if (fftMinFreq !== defaultMinFreq || fftMaxFreq !== defaultMaxFreq || 
            fftMinDb !== defaultMinDb || fftMaxDb !== defaultMaxDb) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '11px Inter, -apple-system, sans-serif';
            ctx.textAlign = 'right';
            
            if (fftMinFreq !== defaultMinFreq || fftMaxFreq !== defaultMaxFreq) {
                const minFreqStr = fftMinFreq >= 1000 ? `${(fftMinFreq/1000).toFixed(1)}k` : `${Math.round(fftMinFreq)}`;
                const maxFreqStr = fftMaxFreq >= 1000 ? `${(fftMaxFreq/1000).toFixed(1)}k` : `${Math.round(fftMaxFreq)}`;
                ctx.fillText(`${minFreqStr} - ${maxFreqStr} Hz`, width - 15, 25);
            }
            
            if (fftMinDb !== defaultMinDb || fftMaxDb !== defaultMaxDb) {
                ctx.fillText(`${fftMinDb} to ${fftMaxDb} dB`, width - 15, 45);
            }
        }
        
        ctx.restore();
        
        // Update control points
        bands.forEach((band, i) => {
            if (band.enabled) {
                if (band.filterType === 0 || band.filterType === 3 || band.filterType === 4) {
                    updateControlPoint(band, i + 1);
                } else {
                    const pointEl = container.querySelector(`#point-${i + 1}`);
                    if (pointEl) {
                        pointEl.remove();
                    }
                }
            } else {
                const pointEl = container.querySelector(`#point-${i + 1}`);
                if (pointEl) {
                    pointEl.remove();
                }
            }
        });
        
        if (firstDraw) {
            firstDraw = false;
        }
    }
    
    // Update control point position
    function updateControlPoint(band, bandNum) {
        const x = freqToX(band.frequency, 60, 40);
        const y = gainToY(band.gain, 20, 40);
        
        let pointEl = container.querySelector(`#point-${bandNum}`);
        if (!pointEl) {
            pointEl = document.createElement('div');
            pointEl.id = `point-${bandNum}`;
            pointEl.className = 'control-point';
            pointEl.dataset.band = bandNum;
            analyzerCanvas.parentElement.appendChild(pointEl);
            
            pointEl.addEventListener('mousedown', handlePointMouseDown);
            pointEl.addEventListener('mouseenter', handlePointMouseEnter);
            pointEl.addEventListener('mouseleave', handlePointMouseLeave);
            pointEl.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Add touch event support
            pointEl.addEventListener('touchstart', handlePointTouchStart, { passive: false });
            pointEl.addEventListener('touchmove', handlePointTouchMove, { passive: false });
            pointEl.addEventListener('touchend', handlePointTouchEnd, { passive: false });
        }
        
        pointEl.style.left = `${x}px`;
        pointEl.style.top = `${y}px`;
        pointEl.style.backgroundColor = band.color;
        pointEl.style.borderColor = 'white';
        pointEl.style.color = band.color;
        pointEl.classList.toggle('selected', band.selected);
    }
    
    // Solo band functionality - isolates frequencies affected by the band
    function startSoloBand(bandNum) {
        if (isSoloing) return; // Prevent multiple starts
        
        console.log('Starting solo mode for band', bandNum);
        isSoloing = true;
        soloedBand = bandNum;
        
        // Send solo mode to DSP
        patchConnection.sendEventOrValue('soloMode', bandNum);
        
        // Visual feedback - add listening indicator
        const title = container.querySelector('.logo');
        if (title && !title.querySelector('span')) {
            title.innerHTML = 'QUANTUM EQ <span style="color: #ff4365; font-size: 0.7em; cursor: pointer;" onclick="window.endSoloBand && window.endSoloBand()">[LISTENING - CLICK TO EXIT]</span>';
        }
        
        // Make endSoloBand globally accessible as backup
        window.endSoloBand = endSoloBand;
        
        requestDraw();
    }
    
    function endSoloBand() {
        if (!isSoloing) return;
        
        console.log('Ending solo mode');
        
        // Turn off solo mode in DSP
        patchConnection.sendEventOrValue('soloMode', 0);
        
        // Restore title
        const title = container.querySelector('.logo');
        if (title) {
            title.textContent = 'QUANTUM EQ';
        }
        
        isSoloing = false;
        soloedBand = 0;
        
        requestDraw();
    }
    
    // Get the frequency range affected by a band
    function getBandFrequencyRange(band) {
        try {
            const freq = band.frequency || 1000;
            const q = band.q || 0.7;
            const octaveWidth = 1 / q;
            
            // Calculate bandwidth in Hz
            const lowFreq = Math.max(20, freq / Math.pow(2, octaveWidth / 2));
            const highFreq = Math.min(20000, freq * Math.pow(2, octaveWidth / 2));
            
            // Adjust range based on filter type
            switch (band.filterType || band.type || 0) {
                case 1: // High Pass
                    return { low: Math.max(20, freq * 0.5), high: 20000 };
                case 2: // Low Pass
                    return { low: 20, high: Math.min(20000, freq * 2) };
                case 3: // High Shelf
                    return { low: Math.max(20, freq * 0.5), high: 20000 };
                case 4: // Low Shelf
                    return { low: 20, high: Math.min(20000, freq * 2) };
                case 5: // Notch
                    return { low: lowFreq, high: highFreq };
                default: // Bell
                    return { low: lowFreq, high: highFreq };
            }
        } catch (error) {
            console.error('Error in getBandFrequencyRange:', error);
            return { low: 20, high: 20000 };
        }
    }
    
    // Store current mouse handlers globally to ensure proper cleanup
    let currentMouseMoveHandler = null;
    let currentMouseUpHandler = null;
    let currentKeyDownHandler = null;
    let currentKeyUpHandler = null;
    
    // Point event handlers
    function handlePointMouseDown(e) {
        try {
            e.preventDefault();
            
            const bandNum = parseInt(e.target.dataset.band);
            const band = bands[bandNum - 1];
            
            if (e.button === 2) {
                band.enabled = false;
                patchConnection.sendEventOrValue(`band${bandNum}Enabled`, false);
                createBandStrip();
                requestDraw();
                saveState();
                return;
            }
            
            selectBand(bandNum);
            
            // Clean up any existing handlers first
            if (currentMouseMoveHandler) {
                document.removeEventListener('mousemove', currentMouseMoveHandler);
            }
            if (currentMouseUpHandler) {
                document.removeEventListener('mouseup', currentMouseUpHandler);
            }
            if (currentKeyDownHandler) {
                document.removeEventListener('keydown', currentKeyDownHandler);
            }
            if (currentKeyUpHandler) {
                document.removeEventListener('keyup', currentKeyUpHandler);
            }
            
            isDragging = true;
            e.target.classList.add('dragging');
            dragOverlay.classList.add('active');
            
            // Hide tooltip while dragging to avoid interference
            tooltip.classList.remove('visible');
            
            // Track initial Ctrl state
            let ctrlHeld = e.ctrlKey;
            if (ctrlHeld) {
                startSoloBand(bandNum);
            }
            
            // Store initial values for Alt+drag Q control
            const startY = e.clientY;
            const startQ = band.q;
            
            currentMouseMoveHandler = (e) => {
                if (!isDragging) return;
                
                try {
                    const rect = analyzerCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    if (e.altKey) {
                        // Alt+drag: control Q value
                        const deltaY = startY - e.clientY; // Positive when dragging up
                        const sensitivity = 0.01; // Adjust for desired sensitivity
                        
                        // Calculate new Q value (drag up narrows Q/increases value, drag down widens Q/decreases value)
                        const qDelta = deltaY * sensitivity;
                        const newQ = startQ + qDelta;
                        
                        // Clamp Q value to valid range
                        band.q = Math.max(0.1, Math.min(10.0, newQ));
                        
                        patchConnection.sendEventOrValue(`band${bandNum}Q`, band.q);
                        
                        updatePropertyDisplayOnly();
                        requestDraw();
                    } else {
                        // Normal drag: control frequency and gain
                        const freq = xToFreq(x, 60, 40);
                        const gain = yToGain(y, 20, 40);
                        
                        band.frequency = Math.max(20, Math.min(20000, freq));
                        band.gain = Math.max(-24, Math.min(24, gain));
                        
                        patchConnection.sendEventOrValue(`band${bandNum}Frequency`, band.frequency);
                        patchConnection.sendEventOrValue(`band${bandNum}Gain`, band.gain);
                        
                        updatePropertyDisplayOnly();
                        requestDraw();
                    }
                } catch (error) {
                    console.error('Error in mouse move handler:', error);
                }
            };
            
            currentMouseUpHandler = () => {
                try {
                    isDragging = false;
                    dragOverlay.classList.remove('active');
                    const draggedPoint = container.querySelector('.control-point.dragging');
                    if (draggedPoint) {
                        draggedPoint.classList.remove('dragging');
                    }
                    
                    // Remove all event listeners
                    if (currentMouseMoveHandler) {
                        document.removeEventListener('mousemove', currentMouseMoveHandler);
                        currentMouseMoveHandler = null;
                    }
                    if (currentMouseUpHandler) {
                        document.removeEventListener('mouseup', currentMouseUpHandler);
                        currentMouseUpHandler = null;
                    }
                    if (currentKeyDownHandler) {
                        document.removeEventListener('keydown', currentKeyDownHandler);
                        currentKeyDownHandler = null;
                    }
                    if (currentKeyUpHandler) {
                        document.removeEventListener('keyup', currentKeyUpHandler);
                        currentKeyUpHandler = null;
                    }
                    
                    // End solo mode if Ctrl is not held
                    if (isSoloing && !e.ctrlKey) {
                        endSoloBand();
                    }
                    
                    saveState();
                } catch (error) {
                    console.error('Error in mouse up handler:', error);
                }
            };
            
            // Handle keyboard events during drag
            currentKeyDownHandler = (e) => {
                try {
                    if (e.key === 'Control' && !isSoloing) {
                        ctrlHeld = true;
                        startSoloBand(bandNum);
                    }
                } catch (error) {
                    console.error('Error in key down handler:', error);
                }
            };
            
            currentKeyUpHandler = (e) => {
                try {
                    if (e.key === 'Control') {
                        ctrlHeld = false;
                        if (isSoloing) {
                            endSoloBand();
                        }
                    }
                } catch (error) {
                    console.error('Error in key up handler:', error);
                }
            };
            
            document.addEventListener('mousemove', currentMouseMoveHandler);
            document.addEventListener('mouseup', currentMouseUpHandler);
            document.addEventListener('keydown', currentKeyDownHandler);
            document.addEventListener('keyup', currentKeyUpHandler);
            
        } catch (error) {
            console.error('Error in handlePointMouseDown:', error);
            // Cleanup on error
            isDragging = false;
            dragOverlay.classList.remove('active');
            if (isSoloing) {
                endSoloBand();
            }
        }
    }
    
    function handlePointMouseEnter(e) {
        const bandNum = parseInt(e.target.dataset.band);
        const band = bands[bandNum - 1];
        const rect = e.target.getBoundingClientRect();
        
        // Position tooltip higher and offset if in solo mode or dragging
        const verticalOffset = (isSoloing || isDragging) ? 65 : 50;
        const horizontalOffset = (isSoloing && soloedBand === bandNum) ? 30 : 0;
        
        tooltip.innerHTML = `<strong>Band ${bandNum}</strong><br/>${band.frequency.toFixed(0)} Hz • ${band.gain > 0 ? '+' : ''}${band.gain.toFixed(1)} dB<br/><span style="opacity: 0.7; font-size: 11px;">Right-click to disable</span>`;
        tooltip.style.left = `${rect.left + rect.width / 2 + horizontalOffset}px`;
        tooltip.style.top = `${rect.top - verticalOffset}px`;
        tooltip.classList.add('visible');
    }
    
    function handlePointMouseLeave() {
        tooltip.classList.remove('visible');
    }
    
    // Touch event handlers for mobile support
    let activeTouchId = null;
    let touchStartPos = null;
    
    function handlePointTouchStart(e) {
        try {
            e.preventDefault();
            
            // Only handle single touch
            if (e.touches.length > 1 || activeTouchId !== null) return;
            
            const touch = e.touches[0];
            activeTouchId = touch.identifier;
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            
            const bandNum = parseInt(e.target.dataset.band);
            const band = bands[bandNum - 1];
            
            // Long press detection for disable
            const longPressTimer = setTimeout(() => {
                if (activeTouchId !== null) {
                    band.enabled = false;
                    patchConnection.sendEventOrValue(`band${bandNum}Enabled`, false);
                    createBandStrip();
                    requestDraw();
                    saveState();
                    activeTouchId = null;
                }
            }, 500);
            
            e.target.longPressTimer = longPressTimer;
            
            selectBand(bandNum);
            isDragging = true;
            dragOverlay.classList.add('active');
            
            // Handle touch move
            const handleTouchMove = (e) => {
                e.preventDefault();
                
                const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId);
                if (!touch) return;
                
                clearTimeout(e.target.longPressTimer);
                
                const rect = analyzerCanvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                const freq = xToFreq(x, leftMargin, rightMargin);
                const gain = yToGain(y, topMargin, bottomMargin);
                
                band.frequency = Math.max(20, Math.min(20000, freq));
                band.gain = Math.max(-24, Math.min(24, gain));
                
                patchConnection.sendEventOrValue(`band${bandNum}Freq`, band.frequency);
                patchConnection.sendEventOrValue(`band${bandNum}Gain`, band.gain);
                
                updateControlsFromBand(bandNum);
                requestDraw();
                saveState();
            };
            
            const handleTouchEnd = (e) => {
                const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouchId);
                if (!touch) return;
                
                clearTimeout(e.target.longPressTimer);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                
                isDragging = false;
                dragOverlay.classList.remove('active');
                activeTouchId = null;
                touchStartPos = null;
            };
            
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd, { passive: false });
            
        } catch (error) {
            console.error('Error in handlePointTouchStart:', error);
            isDragging = false;
            dragOverlay.classList.remove('active');
            activeTouchId = null;
        }
    }
    
    function handlePointTouchMove(e) {
        // Handled in touchstart for better control
        e.preventDefault();
    }
    
    function handlePointTouchEnd(e) {
        // Handled in touchstart for better control
        e.preventDefault();
    }
    
    // Band selection
    function selectBand(bandNum) {
        selectedBand = bandNum;
        
        bands.forEach((band, i) => {
            band.selected = (i + 1 === bandNum);
        });
        
        createBandStrip();
        updatePropertiesPanel();
        requestDraw();
    }
    
    // Create band strip with premium styling
    function createBandStrip() {
        bandStrip.innerHTML = '';
        
        bands.forEach((band, i) => {
            const button = document.createElement('div');
            button.className = 'band-button';
            button.classList.toggle('selected', selectedBand === i + 1);
            button.classList.toggle('disabled', !band.enabled);
            button.dataset.band = i + 1;
            
            // Set CSS variables for dynamic styling
            button.style.setProperty('--band-color', band.color);
            button.style.setProperty('--band-gradient', band.gradient);
            
            // Convert hex to RGB for glow effects
            const r = parseInt(band.color.substr(1,2), 16);
            const g = parseInt(band.color.substr(3,2), 16);
            const b = parseInt(band.color.substr(5,2), 16);
            button.style.setProperty('--band-rgb', `${r}, ${g}, ${b}`);
            
            const typeNames = {
                0: 'BELL',
                1: 'HP',
                2: 'LP',
                3: 'HSH',
                4: 'LSH',
                5: 'NOTCH'
            };
            
            button.innerHTML = `
                <div class="band-number">${i + 1}</div>
                <div class="band-type">${typeNames[band.filterType]}</div>
                <div class="band-color-indicator" style="background: ${band.color}"></div>
            `;
            
            button.addEventListener('click', () => {
                selectBand(i + 1);
                saveState();
            });
            
            button.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                band.enabled = !band.enabled;
                patchConnection.sendEventOrValue(`band${i + 1}Enabled`, band.enabled);
                createBandStrip();
                requestDraw();
                saveState();
                
                // Add visual feedback
                createGlowEffect(e.clientX, e.clientY, band.color);
            });
            
            button.title = `Band ${i + 1} • ${band.frequency.toFixed(0)} Hz\nClick to select • Double-click to toggle\nPress ${i + 1} key for quick toggle`;
            
            bandStrip.appendChild(button);
        });
    }
    
    // Create glow effect on interactions
    function createGlowEffect(x, y, color) {
        const glow = document.createElement('div');
        glow.className = 'glow-effect';
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        glow.style.background = `radial-gradient(circle, ${color}80 0%, transparent 70%)`;
        document.body.appendChild(glow);
        
        setTimeout(() => glow.remove(), 600);
    }
    
    // Update properties panel with premium design
    function updatePropertiesPanel() {
        if (selectedBand === 0) {
            propertiesSection.innerHTML = `
                <div style="margin: auto; color: rgba(255,255,255,0.3); text-align: center; font-size: 13px; letter-spacing: 0.5px;">
                    SELECT A BAND TO VIEW PROPERTIES
                </div>
            `;
            return;
        }
        
        const band = bands[selectedBand - 1];
        
        propertiesSection.innerHTML = `
            <div class="property-group">
                <div class="property-title">Band ${selectedBand}</div>
                <div class="property-control">
                    <div class="toggle-switch">
                        <label>Enabled</label>
                        <input type="checkbox" id="bandEnabled" ${band.enabled ? 'checked' : ''}>
                    </div>
                    
                    <label class="property-label" style="margin-top: 4px;">Filter Type</label>
                    <select class="filter-type-select" id="filterType">
                        <option value="0" ${band.filterType === 0 ? 'selected' : ''}>Bell</option>
                        <option value="1" ${band.filterType === 1 ? 'selected' : ''}>High Pass</option>
                        <option value="2" ${band.filterType === 2 ? 'selected' : ''}>Low Pass</option>
                        <option value="3" ${band.filterType === 3 ? 'selected' : ''}>High Shelf</option>
                        <option value="4" ${band.filterType === 4 ? 'selected' : ''}>Low Shelf</option>
                        <option value="5" ${band.filterType === 5 ? 'selected' : ''}>Notch</option>
                    </select>
                </div>
            </div>
            
            <div class="property-group">
                <div class="property-title">Frequency</div>
                <div class="property-control">
                    <label class="property-label">
                        <span>Frequency</span>
                        <span class="property-value" id="freqValue">${band.frequency.toFixed(0)} Hz</span>
                    </label>
                    <input type="range" class="property-slider" id="frequency"
                           min="0" max="1" value="${(Math.log10(band.frequency) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20))}" 
                           step="0.001">
                </div>
            </div>
            
            ${band.filterType === 0 || band.filterType === 3 || band.filterType === 4 ? `
            <div class="property-group">
                <div class="property-title">Gain</div>
                <div class="property-control">
                    <label class="property-label">
                        <span>Gain</span>
                        <span class="property-value" id="gainValue">${band.gain > 0 ? '+' : ''}${band.gain.toFixed(1)} dB</span>
                    </label>
                    <input type="range" class="property-slider" id="gain"
                           min="-24" max="24" value="${band.gain}" step="0.1">
                </div>
            </div>
            ` : ''}
            
            <div class="property-group">
                <div class="property-title">Shape</div>
                <div class="property-control">
                    ${band.filterType !== 1 && band.filterType !== 2 ? `
                    <label class="property-label">
                        <span>Q Factor</span>
                        <span class="property-value" id="qValue">${band.q.toFixed(2)}</span>
                    </label>
                    <input type="range" class="property-slider" id="q"
                           min="0.1" max="10" value="${band.q}" step="0.1">
                    ` : ''}
                    
                    ${band.filterType === 1 || band.filterType === 2 ? `
                        <label class="property-label">
                            <span>Slope</span>
                            <span class="property-value">${band.slope} dB/oct</span>
                        </label>
                        <select class="filter-type-select" id="slope">
                            <option value="6" ${band.slope === 6 ? 'selected' : ''}>6 dB/oct</option>
                            <option value="12" ${band.slope === 12 ? 'selected' : ''}>12 dB/oct</option>
                            <option value="18" ${band.slope === 18 ? 'selected' : ''}>18 dB/oct</option>
                            <option value="24" ${band.slope === 24 ? 'selected' : ''}>24 dB/oct</option>
                        </select>
                    ` : ''}
                </div>
            </div>
            
            ${band.filterType === 0 ? `
            <div class="property-group">
                <div class="property-title">Advanced</div>
                <div class="property-control">
                    <div class="toggle-switch">
                        <label>Proportional Q</label>
                        <input type="checkbox" id="proportionalQ" ${band.proportionalQ ? 'checked' : ''}>
                    </div>
                    
                    <div class="toggle-switch">
                        <label>Asymmetric</label>
                        <input type="checkbox" id="asymmetric" ${band.asymmetric ? 'checked' : ''}>
                    </div>
                    
                    ${band.asymmetric ? `
                        <label class="property-label" style="margin-top: 8px;">
                            <span>Asymmetry</span>
                            <span class="property-value" id="asymValue">${band.asymmetryAmt.toFixed(1)}</span>
                        </label>
                        <input type="range" class="property-slider" id="asymmetryAmt"
                               min="1.0" max="3.0" value="${band.asymmetryAmt}" step="0.1">
                    ` : ''}
                </div>
            </div>
            ` : ''}
        `;
        
        setupSliderListeners();
    }
    
    // Setup slider listeners with visual feedback
    function setupSliderListeners() {
        const bandEnabled = container.querySelector('#bandEnabled');
        if (bandEnabled) {
            bandEnabled.addEventListener('change', (e) => {
                const band = bands[selectedBand - 1];
                band.enabled = e.target.checked;
                patchConnection.sendEventOrValue(`band${selectedBand}Enabled`, band.enabled);
                createBandStrip();
                requestDraw();
                saveState();
            });
        }
        
        const filterType = container.querySelector('#filterType');
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                const band = bands[selectedBand - 1];
                band.filterType = parseInt(e.target.value);
                patchConnection.sendEventOrValue(`band${selectedBand}Type`, band.filterType);
                updatePropertiesPanel();
                requestDraw();
                saveState();
            });
        }
        
        const sliders = propertiesSection.querySelectorAll('.property-slider');
        
        sliders.forEach(slider => {
            slider.addEventListener('mousedown', () => {
                isSliding = true;
                slider.classList.add('dragging');
                dragOverlay.classList.add('active');
            });
            
            slider.addEventListener('input', (e) => {
                handleSliderInput(e);
                
                // Update progress indicator
                const min = parseFloat(slider.min);
                const max = parseFloat(slider.max);
                const val = parseFloat(slider.value);
                const progress = ((val - min) / (max - min)) * 100;
                slider.style.setProperty('--progress', `${progress}%`);
            });
        });
        
        const slope = container.querySelector('#slope');
        if (slope) {
            slope.addEventListener('change', (e) => {
                const band = bands[selectedBand - 1];
                band.slope = parseInt(e.target.value);
                patchConnection.sendEventOrValue(`band${selectedBand}Slope`, band.slope);
                requestDraw();
                saveState();
            });
        }
        
        const proportionalQ = container.querySelector('#proportionalQ');
        if (proportionalQ) {
            proportionalQ.addEventListener('change', (e) => {
                const band = bands[selectedBand - 1];
                band.proportionalQ = e.target.checked;
                patchConnection.sendEventOrValue(`band${selectedBand}ProportionalQ`, band.proportionalQ);
                requestDraw();
                saveState();
            });
        }
        
        const asymmetric = container.querySelector('#asymmetric');
        if (asymmetric) {
            asymmetric.addEventListener('change', (e) => {
                const band = bands[selectedBand - 1];
                band.asymmetric = e.target.checked;
                patchConnection.sendEventOrValue(`band${selectedBand}Asymmetric`, band.asymmetric);
                updatePropertiesPanel();
                requestDraw();
                saveState();
            });
        }
    }
    
    // Handle slider input
    function handleSliderInput(e) {
        const prop = e.target.id;
        let value = parseFloat(e.target.value);
        
        if (prop === 'frequency') {
            const minFreq = Math.log10(20);
            const maxFreq = Math.log10(20000);
            const logFreq = minFreq + value * (maxFreq - minFreq);
            value = Math.pow(10, logFreq);
        }
        
        bands[selectedBand - 1][prop] = value;
        updatePropertyDisplayOnly();
        
        let paramName = `band${selectedBand}`;
        if (prop === 'frequency') paramName += 'Frequency';
        else if (prop === 'gain') paramName += 'Gain';
        else if (prop === 'q') paramName += 'Q';
        else if (prop === 'asymmetryAmt') paramName += 'Asymmetry';
        
        patchConnection.sendEventOrValue(paramName, value);
        requestDraw();
    }
    
    // Update property display
    function updatePropertyDisplayOnly() {
        if (selectedBand === 0) return;
        
        const band = bands[selectedBand - 1];
        
        const freqSlider = container.querySelector('#frequency');
        const freqDisplay = container.querySelector('#freqValue');
        if (freqSlider && freqDisplay) {
            const freqNorm = (Math.log10(band.frequency) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20));
            freqSlider.value = freqNorm;
            freqDisplay.textContent = `${band.frequency.toFixed(0)} Hz`;
        }
        
        const gainSlider = container.querySelector('#gain');
        const gainDisplay = container.querySelector('#gainValue');
        if (gainSlider && gainDisplay) {
            gainSlider.value = band.gain;
            gainDisplay.textContent = `${band.gain > 0 ? '+' : ''}${band.gain.toFixed(1)} dB`;
        }
        
        const qSlider = container.querySelector('#q');
        const qDisplay = container.querySelector('#qValue');
        if (qSlider && qDisplay) {
            qSlider.value = band.q;
            qDisplay.textContent = band.q.toFixed(2);
        }
        
        const asymSlider = container.querySelector('#asymmetryAmt');
        const asymDisplay = container.querySelector('#asymValue');
        if (asymSlider && asymDisplay) {
            asymSlider.value = band.asymmetryAmt;
            asymDisplay.textContent = band.asymmetryAmt.toFixed(1);
        }
    }
    
    // Setup premium knob controls
    function setupKnob(element, getValue, setValue, min, max, displayElement, defaultValue = 0) {
        let isDraggingKnob = false;
        let startY = 0;
        let startValue = 0;
        
        element.addEventListener('mousedown', (e) => {
            if (e.ctrlKey) {
                setValue(defaultValue);
                displayElement.textContent = `${defaultValue.toFixed(1)} dB`;
                
                const range = max - min;
                const rotation = ((defaultValue - min) / range) * 270 - 135;
                element.style.transform = `rotate(${rotation}deg)`;
                
                createGlowEffect(e.clientX, e.clientY, '#667eea');
                return;
            }
            
            isDraggingKnob = true;
            startY = e.clientY;
            startValue = getValue();
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDraggingKnob) return;
            
            const deltaY = startY - e.clientY;
            const range = max - min;
            const newValue = startValue + (deltaY / 100) * range;
            const clampedValue = Math.max(min, Math.min(max, newValue));
            
            setValue(clampedValue);
            displayElement.textContent = `${clampedValue.toFixed(1)} dB`;
            
            const rotation = ((clampedValue - min) / range) * 270 - 135;
            element.style.transform = `rotate(${rotation}deg)`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDraggingKnob) {
                isDraggingKnob = false;
                element.style.cursor = 'grab';
            }
        });
    }
    
    // Setup bypass button
    bypassButton.addEventListener('click', () => {
        bypassState = !bypassState;
        bypassButton.classList.toggle('active', bypassState);
        patchConnection.sendEventOrValue('bypass', bypassState);
        saveState();
        
        createGlowEffect(
            bypassButton.getBoundingClientRect().left + 30,
            bypassButton.getBoundingClientRect().top + 30,
            bypassState ? '#ff4365' : '#667eea'
        );
    });
    
    // Canvas interactions
    analyzerCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = analyzerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const zoomSpeed = 0.1;
        const zoomFactor = e.deltaY > 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);
        
        if (e.shiftKey) {
            const centerDb = fftMinDb + (fftMaxDb - fftMinDb) * (1 - y / rect.height);
            
            let newMinDb = centerDb - (centerDb - fftMinDb) * zoomFactor;
            let newMaxDb = centerDb + (fftMaxDb - centerDb) * zoomFactor;
            
            newMinDb = Math.max(-120, newMinDb);
            newMaxDb = Math.min(20, newMaxDb);
            
            if (newMaxDb - newMinDb > 10) {
                fftMinDb = newMinDb;
                fftMaxDb = newMaxDb;
                requestDraw();
            }
        } else {
            const mouseFreq = xToFreq(x, 60, 40);
            
            let newMinFreq = mouseFreq - (mouseFreq - fftMinFreq) * zoomFactor;
            let newMaxFreq = mouseFreq + (fftMaxFreq - mouseFreq) * zoomFactor;
            
            newMinFreq = Math.max(5, newMinFreq);
            newMaxFreq = Math.min(22050, newMaxFreq);
            
            if (newMaxFreq - newMinFreq > 50) {
                fftMinFreq = newMinFreq;
                fftMaxFreq = newMaxFreq;
                requestDraw();
            }
        }
    });
    
    analyzerCanvas.addEventListener('dblclick', (e) => {
        if (e.target !== analyzerCanvas) return;
        
        const rect = analyzerCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (e.shiftKey) {
            fftMinFreq = defaultMinFreq;
            fftMaxFreq = defaultMaxFreq;
            fftMinDb = defaultMinDb;
            fftMaxDb = defaultMaxDb;
            requestDraw();
            return;
        }
        
        let firstDisabledBand = null;
        for (let i = 0; i < bands.length; i++) {
            if (!bands[i].enabled) {
                firstDisabledBand = i + 1;
                break;
            }
        }
        
        if (firstDisabledBand) {
            const band = bands[firstDisabledBand - 1];
            const clickFreq = xToFreq(x, 60, 40);
            const clickGain = yToGain(y, 20, 40);
            
            band.enabled = true;
            band.frequency = Math.max(20, Math.min(20000, clickFreq));
            band.gain = Math.max(-24, Math.min(24, clickGain));
            
            patchConnection.sendEventOrValue(`band${firstDisabledBand}Enabled`, true);
            patchConnection.sendEventOrValue(`band${firstDisabledBand}Frequency`, band.frequency);
            patchConnection.sendEventOrValue(`band${firstDisabledBand}Gain`, band.gain);
            
            selectBand(firstDisabledBand);
            saveState();
            
            createGlowEffect(e.clientX, e.clientY, band.color);
        }
    });
    
    // Canvas resizing
    function resizeCanvas() {
        const rect = analyzerContainer.getBoundingClientRect();
        const newWidth = rect.width;
        const newHeight = rect.height;
        
        if (analyzerCanvas.width !== newWidth || analyzerCanvas.height !== newHeight) {
            analyzerCanvas.width = newWidth;
            analyzerCanvas.height = newHeight;
            
            // Debug layout heights
            const containerRect = container.getBoundingClientRect();
            const headerRect = container.querySelector('.header').getBoundingClientRect();
            const analyzerRect = container.querySelector('.analyzer-section').getBoundingClientRect();
            const bandStripRect = container.querySelector('.band-strip').getBoundingClientRect();
            const propertiesRect = container.querySelector('.properties-section').getBoundingClientRect();
            
            console.log('Layout Debug:');
            console.log('Container height:', containerRect.height);
            console.log('Header height:', headerRect.height);
            console.log('Analyzer height:', analyzerRect.height);
            console.log('Band strip height:', bandStripRect.height);
            console.log('Properties height:', propertiesRect.height);
            console.log('Total:', headerRect.height + analyzerRect.height + bandStripRect.height + propertiesRect.height);
            console.log('Gap:', containerRect.height - (headerRect.height + analyzerRect.height + bandStripRect.height + propertiesRect.height));
            
            requestDraw();
        }
    }
    
    // State persistence
    let saveStateTimer = null;
    let isLoadingState = false;
    
    function saveState() {
        if (isLoadingState) return;
        
        if (saveStateTimer) {
            clearTimeout(saveStateTimer);
        }
        
        saveStateTimer = setTimeout(() => {
            const state = {
                bands: bands.map(band => ({
                    enabled: band.enabled,
                    filterType: band.filterType,
                    frequency: band.frequency,
                    gain: band.gain,
                    q: band.q,
                    slope: band.slope,
                    proportionalQ: band.proportionalQ,
                    asymmetric: band.asymmetric,
                    asymmetryAmt: band.asymmetryAmt
                })),
                selectedBand: selectedBand,
                inputGain: inputGain,
                outputGain: outputGain,
                bypassState: bypassState
            };
            
            patchConnection.sendStoredStateValue('guiState', state);
        }, 100);
    }
    
    function loadState(state) {
        if (!state) return;
        
        isLoadingState = true;
        
        if (state.bands) {
            state.bands.forEach((savedBand, i) => {
                if (i < bands.length) {
                    Object.assign(bands[i], savedBand);
                    
                    const bandNum = i + 1;
                    patchConnection.sendEventOrValue(`band${bandNum}Enabled`, savedBand.enabled);
                    patchConnection.sendEventOrValue(`band${bandNum}Type`, savedBand.filterType);
                    patchConnection.sendEventOrValue(`band${bandNum}Frequency`, savedBand.frequency);
                    patchConnection.sendEventOrValue(`band${bandNum}Gain`, savedBand.gain);
                    patchConnection.sendEventOrValue(`band${bandNum}Q`, savedBand.q);
                }
            });
        }
        
        if (state.selectedBand !== undefined) {
            selectedBand = state.selectedBand;
        }
        
        if (state.inputGain !== undefined) {
            inputGain = state.inputGain;
            patchConnection.sendEventOrValue('inputGain', inputGain);
        }
        
        if (state.outputGain !== undefined) {
            outputGain = state.outputGain;
            patchConnection.sendEventOrValue('outputGain', outputGain);
        }
        
        if (state.bypassState !== undefined) {
            bypassState = state.bypassState;
            patchConnection.sendEventOrValue('bypass', bypassState);
        }
        
        createBandStrip();
        updatePropertiesPanel();
        requestDraw();
        
        setTimeout(() => {
            isLoadingState = false;
        }, 500);
    }
    
    const stateValueListener = (e) => {
        if (e.key === 'guiState' && e.value) {
            loadState(e.value);
        }
    };
    
    patchConnection.addStoredStateValueListener(stateValueListener);
    
    // Initialize
    setTimeout(() => {
        resizeCanvas();
        drawAnalyzer();
        createBandStrip();
        
        const inputKnob = container.querySelector('#inputGainKnob');
        const inputValue = container.querySelector('#inputGainValue');
        const outputKnob = container.querySelector('#outputGainKnob');
        const outputValue = container.querySelector('#outputGainValue');
        
        setupKnob(inputKnob, 
            () => inputGain,
            (value) => { 
                inputGain = value; 
                patchConnection.sendEventOrValue('inputGain', value);
                saveState();
            },
            -12, 12, inputValue, 0
        );
        
        setupKnob(outputKnob,
            () => outputGain,
            (value) => { 
                outputGain = value; 
                patchConnection.sendEventOrValue('outputGain', value);
                saveState();
            },
            -12, 12, outputValue, 0
        );
        
        patchConnection.requestStoredStateValue('guiState');
        
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 1500);
        
        requestDraw();
    }, 50);
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    // Cleanup on window blur to prevent stuck states
    window.addEventListener('blur', () => {
        console.log('Window blur - cleaning up states');
        if (isDragging) {
            isDragging = false;
            dragOverlay.classList.remove('active');
            const draggedPoint = container.querySelector('.control-point.dragging');
            if (draggedPoint) {
                draggedPoint.classList.remove('dragging');
            }
        }
        if (isSoloing) {
            endSoloBand();
        }
    });
    
    // Additional cleanup on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isSoloing) {
            console.log('Document hidden - ending solo mode');
            endSoloBand();
        }
    });
    
    // Escape key to exit solo mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSoloing) {
            console.log('Escape pressed - ending solo mode');
            endSoloBand();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isSliding) {
            isSliding = false;
            dragOverlay.classList.remove('active');
            const activeSlider = container.querySelector('.property-slider.dragging');
            if (activeSlider) {
                activeSlider.classList.remove('dragging');
            }
            saveState();
        }
    });
    
    // Global keyup handler to catch Ctrl release
    document.addEventListener('keyup', (e) => {
        if ((e.key === 'Control' || e.keyCode === 17) && isSoloing) {
            console.log('Global Ctrl release detected - ending solo mode');
            endSoloBand();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const bandNum = e.key === '0' ? 10 : parseInt(e.key);
            if (bandNum <= bands.length) {
                const band = bands[bandNum - 1];
                band.enabled = !band.enabled;
                patchConnection.sendEventOrValue(`band${bandNum}Enabled`, band.enabled);
                createBandStrip();
                requestDraw();
                
                // Visual feedback
                const button = bandStrip.querySelector(`[data-band="${bandNum}"]`);
                if (button) {
                    const rect = button.getBoundingClientRect();
                    createGlowEffect(rect.left + rect.width/2, rect.top + rect.height/2, band.color);
                }
            }
        }
        
        if (e.key === 'Delete' && selectedBand > 0) {
            const band = bands[selectedBand - 1];
            band.enabled = false;
            patchConnection.sendEventOrValue(`band${selectedBand}Enabled`, false);
            createBandStrip();
            requestDraw();
        }
        
        if (e.key === 'b' || e.key === 'B') {
            bypassButton.click();
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            firstDraw = true;
            resizeCanvas();
            requestDraw();
        }
    });
    
    setInterval(() => {
        const rect = analyzerContainer.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            if (Math.abs(analyzerCanvas.width - rect.width) > 1 || 
                Math.abs(analyzerCanvas.height - rect.height) > 1) {
                resizeCanvas();
            }
        }
    }, 1000);
    
    container.cleanup = () => {
        if (saveStateTimer) {
            clearTimeout(saveStateTimer);
        }
        patchConnection.removeStoredStateValueListener(stateValueListener);
    };
    
    console.log('Returning container element');
    return container;
}