export default function createPatchView(patchConnection) {
    const container = document.createElement("div");
    container.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        height: 100%;
        padding: 15px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
    `;
    
    // Set explicit plugin dimensions - FIXED at 900x550
    container.style.width = '900px';
    container.style.height = '550px';
    container.style.display = 'block';
    container.style.boxSizing = 'border-box';
    container.style.background = '#0a0a0f';
    container.style.color = 'rgba(255, 255, 255, 0.95)';
    container.style.fontFamily = "'Inter', sans-serif";
    container.style.padding = '25px';
    container.style.userSelect = 'none';
    container.style.position = 'relative';
    
    // Store control points in dB
    let points = [
        {x: -60, y: -60},
        {x: -50, y: -52},
        {x: -40, y: -45},
        {x: -30, y: -37},
        {x: -20, y: -30},
        {x: -10, y: -22},
        {x: -5, y: -15},
        {x: 0, y: -10}
    ];
    
    // Store waveshaper points (normalized -1 to 1)
    let wavePoints = [
        {x: -1, y: -1},
        {x: -0.7, y: -0.7},
        {x: -0.5, y: -0.5},
        {x: -0.3, y: -0.3},
        {x: 0.3, y: 0.3},
        {x: 0.5, y: 0.5},
        {x: 0.7, y: 0.7},
        {x: 1, y: 1}
    ];
    
    // User presets storage
    let userPresets = JSON.parse(localStorage.getItem('lutCompressorUserPresets') || '{}');
    
    // Zoom and pan state
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let isPanning = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Presets
    const presets = {
        "Linear (No Compression)": {
            inputGain: 0,
            attackBase: 10,
            releaseBase: 100,
            makeupGain: 0,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40, y: -40},
                {x: -30, y: -30},
                {x: -20, y: -20},
                {x: -10, y: -10},
                {x: -5, y: -5},
                {x: 0, y: 0}
            ]
        },
        "Snare Natural Punch": {
            inputGain: 0,
            attackBase: 23.7,
            releaseBase: 41,
            makeupGain: 0,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40.14577865600586, y: -40.104827880859375},
                {x: -37.47792434692383, y: -38.65845489501953},
                {x: -33.972084045410156, y: -37.92685699462890},
                {x: -31.126758575439453, y: -36.762955294357456},
                {x: -29.161270141601562, y: -30.97778734838512},
                {x: -2.1660022735595703, y: -25.007999420166016}
            ]
        },
        "Gentle 2:1": {
            inputGain: 0,
            attackBase: 10,
            releaseBase: 100,
            makeupGain: 0,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40, y: -40},
                {x: -30, y: -30},
                {x: -20, y: -20},
                {x: -10, y: -15},
                {x: -5, y: -10},
                {x: 0, y: -5}
            ]
        },
        "Hard Limiting": {
            inputGain: 0,
            attackBase: 0.1,
            releaseBase: 50,
            makeupGain: 0,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40, y: -40},
                {x: -30, y: -30},
                {x: -20, y: -20},
                {x: -10, y: -15},
                {x: -5, y: -12},
                {x: 0, y: -10}
            ]
        },
        "Overheads": {
            inputGain: 0,
            attackBase: 20.1,
            releaseBase: 68,
            makeupGain: 2.6,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40.145778656005886, y: -40.10482788085937},
                {x: -36.375, y: -36.79199981689453},
                {x: -32.84712600708008, y: -33.35720062255859},
                {x: -28.047554016113288, y: -31.90576744079599},
                {x: -23.961002349853516, y: -28.608001708984375},
                {x: -0.5565014481544495, y: -1.6319998502731323}
            ]
        },
        "Kick Natural Punch (1)": {
            inputGain: 0,
            attackBase: 23.7,
            releaseBase: 41,
            makeupGain: 0,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40.14577865600586, y: -40.104827880859375},
                {x: -36.8403205871582, y: -38.687519073486333},
                {x: -34.47670364379883, y: -37.534725189208984},
                {x: -31.97054100036621, y: -36.381927490234375},
                {x: -28.141502380371094, y: -29.951999664306644},
                {x: -2.1660022735595703, y: -25.007999420166016}
            ]
        },
        "Drum Room Punish": {
            inputGain: 0,
            attackBase: 0.1,
            releaseBase: 1,
            makeupGain: 2.6,
            mix: 1,
            points: [
                {x: -60, y: -60},
                {x: -50, y: -50},
                {x: -40.14577865600586, y: -40.104827880859375},
                {x: -36.375, y: -36.79199981689453},
                {x: -32.84712600708008, y: -33.35720062255859},
                {x: -26.677499771118164, y: -28.631999969482422},
                {x: -16.052999496459966, y: -28.631999969482422},
                {x: -0.5565014481544495, y: -1.6319998502731323}
            ]
        }
    };
    
    // Debug values
    let debugValues = {
        envelope: -60,
        gainReduction: 0,
        outputLevel: -60
    };
    
    container.innerHTML = `
        <style>
            h1 {
                font-size: 20px;
                font-weight: 300;
                margin: 0 0 15px 0;
                background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                letter-spacing: 2px;
            }
            
            .main-content {
                display: flex;
                gap: 15px;
                width: 100%;
                height: calc(100% - 50px);
                max-width: 900px;
                margin: 0 auto;
            }
            
            .controls {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 20px;
                width: 280px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                max-height: 100%;
            }
            
            .curve-editor {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 20px;
                flex: 1;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                min-width: 0;
                overflow: hidden;
            }
            
            .curve-container {
                width: 100%;
                height: 100%;
                position: relative;
                perspective: 1000px;
            }
            
            .curve-side {
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0 20px;
                box-sizing: border-box;
                opacity: 0;
                transform: rotateY(-90deg);
                transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
                pointer-events: none;
            }
            
            .curve-side.active {
                opacity: 1;
                transform: rotateY(0deg);
                pointer-events: auto;
            }
            
            .curve-side.hiding {
                opacity: 0;
                transform: rotateY(90deg);
                pointer-events: none;
            }
            
            
            .curve-switcher {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 25px;
                padding: 4px;
                margin-bottom: 20px;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .switcher-button {
                padding: 8px 20px;
                background: transparent;
                border: none;
                border-radius: 20px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .switcher-button.active {
                background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
                color: white;
                box-shadow: 0 2px 8px rgba(0, 180, 216, 0.4);
            }
            
            .switcher-button:hover:not(.active) {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .reset-button {
                background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
                border: none;
                border-radius: 8px;
                color: white;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 180, 216, 0.4);
            }
            
            .reset-button:active {
                transform: translateY(0);
            }
            
            .parameter {
                margin-bottom: 15px;
            }
            
            .parameter label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 13px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .parameter-value {
                font-weight: 600;
                color: #00b4d8;
                min-width: 60px;
                text-align: right;
            }
            
            input[type="range"] {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                cursor: pointer;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0, 180, 216, 0.4);
                transition: transform 0.2s;
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
            }
            
            .section-title {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(255, 255, 255, 0.5);
                margin-bottom: 12px;
            }
            
            .preset-selector {
                width: 100%;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: white;
                font-size: 13px;
                cursor: pointer;
                margin-bottom: 20px;
                transition: all 0.2s;
            }
            
            .preset-selector:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(0, 180, 216, 0.5);
            }
            
            .preset-selector option {
                background: #1a1a2e;
                color: white;
            }
            
            .save-load-section {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .save-load-buttons {
                display: flex;
                gap: 10px;
                margin-top: 10px;
            }
            
            .save-button, .load-button {
                flex: 1;
                padding: 8px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            
            .save-button:hover, .load-button:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(0, 180, 216, 0.5);
            }
            
            .preset-selector optgroup {
                background: #2a2a3e;
            }
            
            .preset-selector option {
                padding: 5px;
            }
            
            canvas {
                border: 1px solid rgba(255, 255, 255, 0.2);
                cursor: crosshair;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .curve-info {
                margin-top: 10px;
                padding: 10px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                font-size: 11px;
                line-height: 1.5;
                color: rgba(255, 255, 255, 0.8);
                text-align: center;
                width: 100%;
            }
            
            .point-display {
                display: none;
            }
            
            .reset-button {
                background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
                border: none;
                border-radius: 8px;
                color: white;
                padding: 10px 20px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 180, 216, 0.4);
            }
            
            .reset-button:active {
                transform: translateY(0);
            }
            
            .point-info {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                border-radius: 8px;
                text-align: center;
                font-size: 12px;
            }
            
            .point-label {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 5px;
            }
            
            .point-value {
                color: #00b4d8;
                font-weight: 600;
                font-size: 14px;
            }
            
            .meters {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 15px;
                margin-left: 15px;
                width: 160px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .meter-section {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 10px;
            }
            
            .meter-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .meter-channel {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .meter-label {
                font-size: 12px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.6);
                width: 20px;
                text-align: center;
            }
            
            .meter-bar-container {
                flex: 1;
                position: relative;
                height: 30px;
            }
            
            .meter-bar-container.gr-meter {
                height: 40px;
            }
            
            .meter-scale {
                position: absolute;
                width: 100%;
                height: 10px;
                top: -15px;
                display: flex;
                justify-content: space-between;
                font-size: 9px;
                color: rgba(255, 255, 255, 0.4);
            }
            
            .meter-tick {
                position: absolute;
                transform: translateX(-50%);
            }
            
            .meter-bar-bg {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            
            .meter-bar {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                transition: width 0.1s ease-out;
                border-radius: 4px;
            }
            
            .meter-rms {
                background: linear-gradient(90deg, 
                    #00b4d8 0%, 
                    #00b4d8 80%, 
                    #ffd60a 90%, 
                    #ff6b6b 100%);
                opacity: 0.8;
            }
            
            .meter-peak {
                background: rgba(255, 255, 255, 0.9);
                width: 2px !important;
                right: auto;
                left: 0;
                transform: translateX(-1px);
                transition: left 0.05s linear;
            }
            
            .meter-gr {
                background: linear-gradient(90deg, 
                    #ff6b6b 0%, 
                    #ffd60a 50%, 
                    #00b4d8 100%);
                right: 0;
                left: auto;
                transition: width 0.2s ease-out;
            }
            
            .meter-value {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 11px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                min-width: 45px;
                text-align: right;
            }
            
            /* Mobile styles - keep minimal changes */
            @media (max-width: 768px) {
                /* Hide curve info on mobile to save space */
                .curve-info {
                    display: none;
                }
                
                /* Hide zoom control on mobile */
                .zoom-control {
                    display: none;
                }
            }
            
        </style>
        
        <h1>LUT COMPRESSOR - HQ ENVELOPE DEBUG</h1>
        
        <div class="main-content">
            <div class="controls">
                <div class="section-title">Presets</div>
                <select class="preset-selector" id="presetSelector">
                    <option value="">-- Select Preset --</option>
                    <optgroup label="Factory Presets">
                        ${Object.keys(presets).map(name => 
                            `<option value="factory:${name}">${name}</option>`
                        ).join('')}
                    </optgroup>
                    <optgroup label="User Presets" id="userPresetOptGroup">
                        ${Object.entries(userPresets).map(([id, preset]) => 
                            `<option value="user:${id}">${preset.name}</option>`
                        ).join('')}
                    </optgroup>
                </select>
                
                <div class="section-title">Input</div>
                <div class="parameter">
                    <label>
                        Input Gain
                        <span class="parameter-value" id="inputGain-value">0 dB</span>
                    </label>
                    <input type="range" id="inputGain" min="-20" max="20" value="0" step="0.1">
                </div>
                
                <div style="margin: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>
                
                <div class="section-title">Dynamics</div>
                <div class="parameter">
                    <label>
                        Attack
                        <span class="parameter-value" id="attackBase-value">10 ms</span>
                    </label>
                    <input type="range" id="attackBase" min="0.1" max="100" value="10" step="0.1">
                </div>
                <div class="parameter">
                    <label>
                        Release
                        <span class="parameter-value" id="releaseBase-value">100 ms</span>
                    </label>
                    <input type="range" id="releaseBase" min="1" max="1000" value="100" step="1">
                </div>
                
                <div style="margin: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>
                
                <div class="section-title">Waveshaper</div>
                <div class="parameter">
                    <label>
                        Amount
                        <span class="parameter-value" id="waveshaperAmount-value">0%</span>
                    </label>
                    <input type="range" id="waveshaperAmount" min="0" max="100" value="0" step="1">
                </div>
                
                <div style="margin: 25px 0; border-top: 1px solid rgba(255,255,255,0.1);"></div>
                
                <div class="section-title">Output</div>
                <div class="parameter">
                    <label>
                        Makeup Gain
                        <span class="parameter-value" id="makeupGain-value">0 dB</span>
                    </label>
                    <input type="range" id="makeupGain" min="-20" max="20" value="0" step="0.1">
                </div>
                <div class="parameter">
                    <label>
                        Mix
                        <span class="parameter-value" id="mix-value">100%</span>
                    </label>
                    <input type="range" id="mix" min="0" max="100" value="100" step="1">
                </div>
                
                <div class="save-load-section">
                    <div class="section-title">Preset Management</div>
                    <div class="save-load-buttons">
                        <button class="save-button" id="savePresetButton">Save As User Preset</button>
                        <button class="load-button" id="deletePresetButton">Delete Selected</button>
                    </div>
                </div>
            </div>
            
            <div class="curve-editor">
                <div class="curve-switcher">
                    <button class="switcher-button active" id="compressionBtn">Compression</button>
                    <button class="switcher-button" id="waveshaperBtn">Waveshaper</button>
                </div>
                
                <div class="curve-container" id="curveContainer">
                    <!-- Compression curve (front) -->
                    <div class="curve-side front active">
                        <div class="section-title">Transfer Function</div>
                        <div style="position: relative; display: inline-block;">
                            <canvas id="curveCanvas" width="380" height="380"></canvas>
                        </div>
                        <div class="curve-info">
                            Direct dB input → dB output mapping<br>
                            Drag points • Scroll to zoom • Middle-click/Shift-drag to pan<br>
                            <span style="font-size: 11px; opacity: 0.7;">Zoom: <span id="zoom-level">100%</span></span>
                        </div>
                        <div class="point-display" id="pointDisplay"></div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="reset-button" id="resetButton">Reset to Linear</button>
                            <button class="reset-button" id="resetViewButton" style="background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);">Reset View</button>
                        </div>
                    </div>
                    
                    <!-- Waveshaper curve (back) -->
                    <div class="curve-side back">
                        <div class="section-title">Waveshaper Curve</div>
                        <div style="position: relative; display: inline-block;">
                            <canvas id="waveCanvas" width="380" height="380"></canvas>
                        </div>
                        <div class="curve-info">
                            Maps input (-1 to 1) → output (-1 to 1)<br>
                            Linear = no distortion • Curved = saturation/distortion
                        </div>
                        <button class="reset-button" id="resetWaveButton" style="margin-top: 15px;">Reset to Linear</button>
                    </div>
                </div>
            </div>
            
            <div class="meters">
                <div class="meter-section">
                    <div class="section-title">Input Level</div>
                    <div class="meter-container">
                        <div class="meter-channel">
                            <div class="meter-label">L</div>
                            <div class="meter-bar-container">
                                <div class="meter-scale">
                                    <div class="meter-tick" style="left: 0%">-60</div>
                                    <div class="meter-tick" style="left: 33.33%">-40</div>
                                    <div class="meter-tick" style="left: 66.66%">-20</div>
                                    <div class="meter-tick" style="left: 100%">0</div>
                                </div>
                                <div class="meter-bar-bg">
                                    <div class="meter-bar meter-rms" id="inputMeterL-rms"></div>
                                    <div class="meter-bar meter-peak" id="inputMeterL-peak"></div>
                                </div>
                                <div class="meter-value" id="inputMeterL-value">-∞</div>
                            </div>
                        </div>
                        <div class="meter-channel">
                            <div class="meter-label">R</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar-bg">
                                    <div class="meter-bar meter-rms" id="inputMeterR-rms"></div>
                                    <div class="meter-bar meter-peak" id="inputMeterR-peak"></div>
                                </div>
                                <div class="meter-value" id="inputMeterR-value">-∞</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="meter-section">
                    <div class="section-title">Gain Reduction</div>
                    <div class="meter-container">
                        <div class="meter-bar-container gr-meter">
                            <div class="meter-scale">
                                <div class="meter-tick" style="left: 0%">0</div>
                                <div class="meter-tick" style="left: 50%">-10</div>
                                <div class="meter-tick" style="left: 100%">-20</div>
                            </div>
                            <div class="meter-bar-bg">
                                <div class="meter-bar meter-gr" id="grMeter"></div>
                            </div>
                            <div class="meter-value" id="grMeter-value">0 dB</div>
                        </div>
                    </div>
                </div>
                
                <div class="meter-section">
                    <div class="section-title">Output Level</div>
                    <div class="meter-container">
                        <div class="meter-channel">
                            <div class="meter-label">L</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar-bg">
                                    <div class="meter-bar meter-rms" id="outputMeterL-rms"></div>
                                    <div class="meter-bar meter-peak" id="outputMeterL-peak"></div>
                                </div>
                                <div class="meter-value" id="outputMeterL-value">-∞</div>
                            </div>
                        </div>
                        <div class="meter-channel">
                            <div class="meter-label">R</div>
                            <div class="meter-bar-container">
                                <div class="meter-bar-bg">
                                    <div class="meter-bar meter-rms" id="outputMeterR-rms"></div>
                                    <div class="meter-bar meter-peak" id="outputMeterR-peak"></div>
                                </div>
                                <div class="meter-value" id="outputMeterR-value">-∞</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const canvas = container.querySelector("#curveCanvas");
    const ctx = canvas.getContext("2d");
    const pointDisplay = container.querySelector("#pointDisplay");
    const resetButton = container.querySelector("#resetButton");
    const resetViewButton = container.querySelector("#resetViewButton");
    const presetSelector = container.querySelector("#presetSelector");
    
    // Mobile scaling factor
    let mobileScale = 1;
    window.updateTouchScale = (scale) => {
        mobileScale = scale;
    };
    
    // Curve switcher elements
    const compressionBtn = container.querySelector("#compressionBtn");
    const waveshaperBtn = container.querySelector("#waveshaperBtn");
    const curveContainer = container.querySelector("#curveContainer");
    
    // User preset elements
    const savePresetButton = container.querySelector("#savePresetButton");
    const deletePresetButton = container.querySelector("#deletePresetButton");
    const userPresetOptGroup = container.querySelector("#userPresetOptGroup");
    
    // Waveshaper elements
    const waveCanvas = container.querySelector("#waveCanvas");
    const waveCtx = waveCanvas.getContext("2d");
    const resetWaveButton = container.querySelector("#resetWaveButton");
    
    // Make waveshaper canvas same size as compression canvas
    waveCanvas.width = 380;
    waveCanvas.height = 380;
    
    // Set up the canvas properly
    waveCanvas.style.position = 'relative';
    waveCanvas.style.zIndex = '10';
    
    // Debug elements removed
    
    // Parameter setup
    const setupParameter = (id, formatter, scale = 1) => {
        const slider = container.querySelector(`#${id}`);
        const display = container.querySelector(`#${id}-value`);
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            display.textContent = formatter(value);
            patchConnection.sendEventOrValue(id, scale === 1 ? value : value / scale);
        });
        
        patchConnection.addParameterListener(id, (value) => {
            const displayValue = scale === 1 ? value : value * scale;
            slider.value = displayValue;
            display.textContent = formatter(displayValue);
        });
        
        patchConnection.requestParameterValue(id);
    };
    
    setupParameter('inputGain', v => v.toFixed(1) + ' dB');
    setupParameter('attackBase', v => v.toFixed(1) + ' ms');
    setupParameter('releaseBase', v => Math.round(v) + ' ms');
    setupParameter('makeupGain', v => v.toFixed(1) + ' dB');
    setupParameter('mix', v => Math.round(v) + '%', 100);
    setupParameter('waveshaperAmount', v => Math.round(v) + '%', 100);
    
    // Preset functionality
    function loadPreset(presetName) {
        const preset = presets[presetName];
        if (!preset) return;
        
        // Load parameters
        patchConnection.sendEventOrValue('inputGain', preset.inputGain);
        patchConnection.sendEventOrValue('attackBase', preset.attackBase);
        patchConnection.sendEventOrValue('releaseBase', preset.releaseBase);
        patchConnection.sendEventOrValue('makeupGain', preset.makeupGain);
        patchConnection.sendEventOrValue('mix', preset.mix);
        
        // Load waveshaper amount (default to 0 if not specified)
        patchConnection.sendEventOrValue('waveshaperAmount', preset.waveshaperAmount || 0);
        
        // Load curve points
        points = [...preset.points];
        points.forEach((point, i) => {
            patchConnection.sendEventOrValue(`comp${i}x`, point.x);
            patchConnection.sendEventOrValue(`comp${i}y`, point.y);
        });
        
        // Load waveshaper points (use default linear if not specified)
        if (preset.wavePoints) {
            wavePoints = [...preset.wavePoints];
        } else {
            // Reset to linear (no distortion)
            wavePoints = [
                {x: -1, y: -1},
                {x: -0.7, y: -0.7},
                {x: -0.5, y: -0.5},
                {x: -0.3, y: -0.3},
                {x: 0.3, y: 0.3},
                {x: 0.5, y: 0.5},
                {x: 0.7, y: 0.7},
                {x: 1, y: 1}
            ];
        }
        
        // Send waveshaper points
        wavePoints.forEach((point, i) => {
            patchConnection.sendEventOrValue(`wave${i}x`, point.x);
            patchConnection.sendEventOrValue(`wave${i}y`, point.y);
        });
        
        // Reset view
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        updateZoomDisplay();
        drawCurve();
        drawWaveshaper();
    }
    
    presetSelector.addEventListener('change', (e) => {
        if (e.target.value) {
            const [type, id] = e.target.value.split(':');
            if (type === 'factory') {
                loadPreset(id);
            } else if (type === 'user') {
                const preset = userPresets[id];
                if (preset) {
                    loadUserPreset(preset);
                }
            }
        }
    });
    
    // Debug display removed due to performance issues
    
    // Update point display
    function updatePointDisplay() {
        pointDisplay.innerHTML = points.map((p, i) => {
            const ratio = p.x === p.y ? '1:1' : 
                         p.y < p.x ? `${Math.abs(p.x/p.y).toFixed(1)}:1` : 
                         'Expansion';
            return `
                <div class="point-info">
                    <div class="point-label">Point ${i + 1}</div>
                    <div class="point-value">${p.x}dB → ${p.y}dB</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">${ratio}</div>
                </div>
            `;
        }).join('');
    }
    
    // Padding for control points visibility
    const graphPadding = 25;
    
    // Convert dB to canvas position with zoom and pan
    function dbToCanvas(db) {
        const normalized = (60 + db) / 60;
        const effectiveWidth = canvas.width - (2 * graphPadding);
        return graphPadding + (normalized * effectiveWidth * zoomLevel) + panX;
    }
    
    // Convert canvas position to dB with zoom and pan
    function canvasToDb(pos) {
        const effectiveWidth = canvas.width - (2 * graphPadding);
        const normalized = (pos - graphPadding - panX) / (effectiveWidth * zoomLevel);
        return normalized * 60 - 60;
    }
    
    // Update zoom display
    function updateZoomDisplay() {
        const zoomDisplay = container.querySelector('#zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(zoomLevel * 100) + '%';
        }
    }
    
    // Draw curve
    function drawCurve() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        
        // Draw dB grid lines
        const gridStep = zoomLevel > 2 ? 5 : 10;
        const labelStep = zoomLevel > 2 ? 10 : 20;
        
        for (let db = -60; db <= 0; db += gridStep) {
            const posX = dbToCanvas(db);
            const posY = canvas.height - dbToCanvas(db);
            
            // Only draw if visible within padded area
            if (posX >= graphPadding && posX <= canvas.width - graphPadding) {
                // Vertical lines
                ctx.beginPath();
                ctx.moveTo(posX, graphPadding);
                ctx.lineTo(posX, canvas.height - graphPadding);
                ctx.stroke();
            }
            
            if (posY >= graphPadding && posY <= canvas.height - graphPadding) {
                // Horizontal lines
                ctx.beginPath();
                ctx.moveTo(graphPadding, posY);
                ctx.lineTo(canvas.width - graphPadding, posY);
                ctx.stroke();
            }
            
            // Labels
            if (db % labelStep === 0) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                ctx.font = "10px sans-serif";
                if (posX >= 0 && posX <= canvas.width - 30) {
                    ctx.fillText(`${db}dB`, posX + 2, canvas.height - 5);
                }
                if (posY >= 15 && posY <= canvas.height) {
                    ctx.fillText(`${db}dB`, 5, posY - 2);
                }
            }
        }
        
        // Draw 1:1 reference line (within padded area)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const refStartX = dbToCanvas(-60);
        const refStartY = canvas.height - dbToCanvas(-60);
        const refEndX = dbToCanvas(0);
        const refEndY = canvas.height - dbToCanvas(0);
        ctx.moveTo(refStartX, refStartY);
        ctx.lineTo(refEndX, refEndY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw compression curve
        ctx.strokeStyle = "#00b4d8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const firstPoint = points[0];
        ctx.moveTo(dbToCanvas(firstPoint.x), canvas.height - dbToCanvas(firstPoint.y));
        
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            ctx.lineTo(dbToCanvas(point.x), canvas.height - dbToCanvas(point.y));
        }
        ctx.stroke();
        
        // Draw control points
        points.forEach((point, i) => {
            const x = dbToCanvas(point.x);
            const y = canvas.height - dbToCanvas(point.y);
            
            // Draw control points (always visible)
            // Glow
            ctx.fillStyle = '#00b4d840';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Point
            ctx.fillStyle = '#00b4d8';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Center
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        updatePointDisplay();
    }
    
    // Mouse interaction
    let draggingPoint = -1;
    let lastPointUpdate = 0;
    const pointUpdateInterval = 16; // ~60fps max for point updates
    
    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // Don't start dragging points if we're panning
        if (e.button === 1 || e.shiftKey) return;
        
        // Find closest point
        let minDist = Infinity;
        points.forEach((point, i) => {
            const x = dbToCanvas(point.x);
            const y = canvas.height - dbToCanvas(point.y);
            const dist = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
            if (dist < 20 && dist < minDist) {
                minDist = dist;
                draggingPoint = i;
            }
        });
    });
    
    canvas.addEventListener("mousemove", (e) => {
        if (draggingPoint >= 0) {
            const now = Date.now();
            if (now - lastPointUpdate < pointUpdateInterval) {
                return; // Skip this update
            }
            lastPointUpdate = now;
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Convert to dB
            const newX = canvasToDb(mouseX);
            const newY = canvasToDb(canvas.height - mouseY);
            
            // Update point (with some constraints)
            // Add padding to prevent points from going to the very edge
            const padding = 5; // pixels from edge
            const minDb = canvasToDb(padding);
            const maxDb = canvasToDb(canvas.width - padding);
            
            points[draggingPoint].x = Math.max(Math.max(-60, minDb), Math.min(Math.min(0, maxDb), newX));
            points[draggingPoint].y = Math.max(Math.max(-60, minDb), Math.min(Math.min(0, maxDb), newY));
            
            // Send to CMajor with requestAnimationFrame
            requestAnimationFrame(() => {
                patchConnection.sendEventOrValue(`comp${draggingPoint}x`, points[draggingPoint].x);
                patchConnection.sendEventOrValue(`comp${draggingPoint}y`, points[draggingPoint].y);
            });
            
            drawCurve();
        }
    });
    
    canvas.addEventListener("mouseup", () => {
        draggingPoint = -1;
        isPanning = false;
    });
    
    // Touch event support for mobile
    let activeTouchId = null;
    
    // Helper to get corrected touch coordinates accounting for any scaling
    function getTouchCoords(touch, rect) {
        // For mobile, the canvas is scaled via CSS transform
        // We need to account for this in our coordinate calculations
        
        // Get relative position within the canvas element
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // The canvas internal dimensions are always 380x380
        // But the displayed size is different due to CSS scaling
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: x * scaleX,
            y: y * scaleY
        };
    }
    
    canvas.addEventListener("touchstart", (e) => {
        if (e.cancelable) e.preventDefault();
        
        if (e.touches.length > 1) return; // Only handle single touch
        
        const touch = e.touches[0];
        activeTouchId = touch.identifier;
        
        const rect = canvas.getBoundingClientRect();
        const coords = getTouchCoords(touch, rect);
        const touchX = coords.x;
        const touchY = coords.y;
        
        // Find closest point
        let minDist = Infinity;
        points.forEach((point, i) => {
            const x = dbToCanvas(point.x);
            const y = canvas.height - dbToCanvas(point.y);
            const dist = Math.sqrt(Math.pow(touchX - x, 2) + Math.pow(touchY - y, 2));
            if (dist < 40 && dist < minDist) { // Even larger touch target for mobile
                minDist = dist;
                draggingPoint = i;
                lastPointUpdate = Date.now();
            }
        });
    }, { passive: false });
    
    canvas.addEventListener("touchmove", (e) => {
        if (e.cancelable) e.preventDefault();
        
        if (draggingPoint < 0) return;
        
        const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId);
        if (!touch) return;
        
        const now = Date.now();
        if (now - lastPointUpdate < pointUpdateInterval) {
            return; // Throttle updates
        }
        lastPointUpdate = now;
        
        const rect = canvas.getBoundingClientRect();
        const coords = getTouchCoords(touch, rect);
        const touchX = coords.x;
        const touchY = coords.y;
        
        // Update point position
        const dbX = canvasToDb(touchX);
        const dbY = canvasToDb(canvas.height - touchY);
        
        // Constrain movement
        const index = draggingPoint;
        const prevX = index > 0 ? points[index - 1].x : -60;
        const nextX = index < points.length - 1 ? points[index + 1].x : 0;
        
        if (dbX > prevX + 1 && dbX < nextX - 1) {
            points[index].x = dbX;
            points[index].y = Math.max(-60, Math.min(0, dbY));
            
            // Send to CMajor with requestAnimationFrame
            requestAnimationFrame(() => {
                patchConnection.sendEventOrValue(`comp${index}x`, points[index].x);
                patchConnection.sendEventOrValue(`comp${index}y`, points[index].y);
            });
            
            drawCurve();
        }
    }, { passive: false });
    
    canvas.addEventListener("touchend", (e) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouchId);
        if (touch) {
            draggingPoint = -1;
            activeTouchId = null;
        }
    }, { passive: false });
    
    // Mouse wheel zoom
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // Get mouse position in dB space before zoom
        const dbX = canvasToDb(mouseX);
        const dbY = canvasToDb(canvas.height - mouseY);
        
        // Zoom
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        zoomLevel = Math.max(0.5, Math.min(5, zoomLevel * zoomFactor));
        
        // Adjust pan to keep mouse position fixed
        const newMouseX = dbToCanvas(dbX);
        const newMouseY = canvas.height - dbToCanvas(dbY);
        panX += mouseX - newMouseX;
        panY += mouseY - newMouseY;
        
        updateZoomDisplay();
        drawCurve();
    });
    
    // Pan with middle mouse or shift+drag
    canvas.addEventListener("mousedown", (e) => {
        if (e.button === 1 || e.shiftKey) {
            e.preventDefault();
            isPanning = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            canvas.style.cursor = "move";
        }
    });
    
    canvas.addEventListener("mousemove", (e) => {
        if (isPanning) {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            panX += dx;
            panY += dy;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            drawCurve();
        }
    });
    
    // Reset pan on middle click
    canvas.addEventListener("auxclick", (e) => {
        if (e.button === 1) {
            e.preventDefault();
        }
    });
    
    document.addEventListener("mouseup", () => {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = "crosshair";
        }
    });
    
    // Reset button functionality
    resetButton.addEventListener("click", () => {
        // Set linear curve (input = output)
        points[0] = {x: -60, y: -60};
        points[1] = {x: -50, y: -50};
        points[2] = {x: -40, y: -40};
        points[3] = {x: -30, y: -30};
        points[4] = {x: -20, y: -20};
        points[5] = {x: -10, y: -10};
        points[6] = {x: -5, y: -5};
        points[7] = {x: 0, y: 0};
        
        // Reset zoom and pan
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        updateZoomDisplay();
        
        // Send to CMajor
        points.forEach((point, i) => {
            patchConnection.sendEventOrValue(`comp${i}x`, point.x);
            patchConnection.sendEventOrValue(`comp${i}y`, point.y);
        });
        
        drawCurve();
    });
    
    // Reset view button functionality
    resetViewButton.addEventListener("click", () => {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        updateZoomDisplay();
        drawCurve();
    });
    
    // Set up point listeners
    for (let i = 0; i < 8; i++) {
        patchConnection.addParameterListener(`comp${i}x`, (value) => {
            points[i].x = value;
            drawCurve();
        });
        patchConnection.addParameterListener(`comp${i}y`, (value) => {
            points[i].y = value;
            drawCurve();
        });
        
        patchConnection.requestParameterValue(`comp${i}x`);
        patchConnection.requestParameterValue(`comp${i}y`);
    }
    
    // Meter handling for structured events
    const meterElements = {
        input: {
            L: {
                rms: container.querySelector('#inputMeterL-rms'),
                peak: container.querySelector('#inputMeterL-peak'),
                value: container.querySelector('#inputMeterL-value')
            },
            R: {
                rms: container.querySelector('#inputMeterR-rms'),
                peak: container.querySelector('#inputMeterR-peak'),
                value: container.querySelector('#inputMeterR-value')
            }
        },
        output: {
            L: {
                rms: container.querySelector('#outputMeterL-rms'),
                peak: container.querySelector('#outputMeterL-peak'),
                value: container.querySelector('#outputMeterL-value')
            },
            R: {
                rms: container.querySelector('#outputMeterR-rms'),
                peak: container.querySelector('#outputMeterR-peak'),
                value: container.querySelector('#outputMeterR-value')
            }
        },
        gr: {
            bar: container.querySelector('#grMeter'),
            value: container.querySelector('#grMeter-value')
        }
    };
    
    // Convert dB to meter position (0-100%)
    function dbToMeterPosition(db) {
        // Map -60dB to 0%, 0dB to 100%
        const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
        return normalized * 100;
    }
    
    // Convert gain reduction to meter position (0-100%)
    function grToMeterPosition(gr) {
        // Map 0dB (no reduction) to 0%, -20dB to 100%
        const normalized = Math.max(0, Math.min(1, Math.abs(gr) / 20));
        return normalized * 100;
    }
    
    // Format dB value for display
    function formatDb(value) {
        if (value <= -60) return '-∞';
        return value.toFixed(1);
    }
    
    // Add endpoint listeners for meters
    patchConnection.addEndpointListener('inputMeters', (data) => {
        if (data && Array.isArray(data) && data.length >= 6) {
            // Data format: [minL, minR, maxL, maxR, rmsL, rmsR]
            // Update left channel
            const peakL = Math.max(data[0], data[2]);  // max of min and max
            const rmsL = data[4];
            meterElements.input.L.rms.style.width = dbToMeterPosition(rmsL) + '%';
            meterElements.input.L.peak.style.left = dbToMeterPosition(peakL) + '%';
            meterElements.input.L.value.textContent = formatDb(peakL);
            
            // Update right channel
            const peakR = Math.max(data[1], data[3]);  // max of min and max
            const rmsR = data[5];
            meterElements.input.R.rms.style.width = dbToMeterPosition(rmsR) + '%';
            meterElements.input.R.peak.style.left = dbToMeterPosition(peakR) + '%';
            meterElements.input.R.value.textContent = formatDb(peakR);
        }
    });
    
    patchConnection.addEndpointListener('outputMeters', (data) => {
        if (data && Array.isArray(data) && data.length >= 6) {
            // Data format: [minL, minR, maxL, maxR, rmsL, rmsR]
            // Update left channel
            const peakL = Math.max(data[0], data[2]);  // max of min and max
            const rmsL = data[4];
            meterElements.output.L.rms.style.width = dbToMeterPosition(rmsL) + '%';
            meterElements.output.L.peak.style.left = dbToMeterPosition(peakL) + '%';
            meterElements.output.L.value.textContent = formatDb(peakL);
            
            // Update right channel
            const peakR = Math.max(data[1], data[3]);  // max of min and max
            const rmsR = data[5];
            meterElements.output.R.rms.style.width = dbToMeterPosition(rmsR) + '%';
            meterElements.output.R.peak.style.left = dbToMeterPosition(peakR) + '%';
            meterElements.output.R.value.textContent = formatDb(peakR);
        }
    });
    
    patchConnection.addEndpointListener('gainReductionMeter', (value) => {
        if (typeof value === 'number') {
            meterElements.gr.bar.style.width = grToMeterPosition(value) + '%';
            meterElements.gr.value.textContent = value.toFixed(1) + ' dB';
        }
    });
    
    // Waveshaper drawing functions
    function waveToCanvas(val) {
        const effectiveWidth = waveCanvas.width - (2 * graphPadding);
        return graphPadding + ((val + 1) / 2) * effectiveWidth;
    }
    
    function canvasToWave(pos) {
        const effectiveWidth = waveCanvas.width - (2 * graphPadding);
        return ((pos - graphPadding) / effectiveWidth) * 2 - 1;
    }
    
    function drawWaveshaper() {
        waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
        
        // Grid
        waveCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        waveCtx.lineWidth = 1;
        
        // Draw grid lines within padded area
        for (let i = 0; i <= 10; i++) {
            const normalized = i / 10;
            const posX = graphPadding + normalized * (waveCanvas.width - 2 * graphPadding);
            const posY = graphPadding + normalized * (waveCanvas.height - 2 * graphPadding);
            
            // Vertical lines
            waveCtx.beginPath();
            waveCtx.moveTo(posX, graphPadding);
            waveCtx.lineTo(posX, waveCanvas.height - graphPadding);
            waveCtx.stroke();
            
            // Horizontal lines
            waveCtx.beginPath();
            waveCtx.moveTo(graphPadding, posY);
            waveCtx.lineTo(waveCanvas.width - graphPadding, posY);
            waveCtx.stroke();
        }
        
        // Draw center lines
        waveCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        waveCtx.lineWidth = 2;
        
        // Vertical center
        waveCtx.beginPath();
        waveCtx.moveTo(waveCanvas.width / 2, 0);
        waveCtx.lineTo(waveCanvas.width / 2, waveCanvas.height);
        waveCtx.stroke();
        
        // Horizontal center
        waveCtx.beginPath();
        waveCtx.moveTo(0, waveCanvas.height / 2);
        waveCtx.lineTo(waveCanvas.width, waveCanvas.height / 2);
        waveCtx.stroke();
        
        // Draw 1:1 reference line (within padded area)
        waveCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        waveCtx.setLineDash([5, 5]);
        waveCtx.beginPath();
        const waveRefStartX = waveToCanvas(-1);
        const waveRefStartY = waveCanvas.height - waveToCanvas(-1);
        const waveRefEndX = waveToCanvas(1);
        const waveRefEndY = waveCanvas.height - waveToCanvas(1);
        waveCtx.moveTo(waveRefStartX, waveRefStartY);
        waveCtx.lineTo(waveRefEndX, waveRefEndY);
        waveCtx.stroke();
        waveCtx.setLineDash([]);
        
        // Draw waveshaper curve
        waveCtx.strokeStyle = "#ff6b6b";
        waveCtx.lineWidth = 3;
        waveCtx.beginPath();
        
        const firstPoint = wavePoints[0];
        waveCtx.moveTo(waveToCanvas(firstPoint.x), waveCanvas.height - waveToCanvas(firstPoint.y));
        
        for (let i = 1; i < wavePoints.length; i++) {
            const point = wavePoints[i];
            waveCtx.lineTo(waveToCanvas(point.x), waveCanvas.height - waveToCanvas(point.y));
        }
        waveCtx.stroke();
        
        // Draw control points
        wavePoints.forEach((point, i) => {
            const x = waveToCanvas(point.x);
            const y = waveCanvas.height - waveToCanvas(point.y);
            
            // Draw control points (always visible)
            // Glow
            waveCtx.fillStyle = '#ff6b6b40';
            waveCtx.beginPath();
            waveCtx.arc(x, y, 12, 0, Math.PI * 2);
            waveCtx.fill();
            
            // Point
            waveCtx.fillStyle = '#ff6b6b';
            waveCtx.beginPath();
            waveCtx.arc(x, y, 8, 0, Math.PI * 2);
            waveCtx.fill();
            
            // Center
            waveCtx.fillStyle = '#ffffff';
            waveCtx.beginPath();
            waveCtx.arc(x, y, 3, 0, Math.PI * 2);
            waveCtx.fill();
        });
    }
    
    // Waveshaper mouse interaction
    let draggingWavePoint = -1;
    let lastWavePointUpdate = 0;
    
    // Prevent default touch behaviors that might interfere
    waveCanvas.addEventListener('touchstart', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    
    // Ensure the canvas is interactive
    waveCanvas.style.cursor = 'crosshair';
    waveCanvas.style.userSelect = 'none';
    waveCanvas.style.touchAction = 'none';
    
    // Use both capture and bubble phase to ensure we get the event
    function handleWaveMouseDown(e) {
        // Only process if we're in waveshaper view
        if (currentView !== 'waveshaper') return;
        
        e.preventDefault();
        
        const rect = waveCanvas.getBoundingClientRect();
        const scaleX = waveCanvas.width / rect.width;
        const scaleY = waveCanvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        
        // Find closest point
        let minDist = Infinity;
        wavePoints.forEach((point, i) => {
            const x = waveToCanvas(point.x);
            const y = waveCanvas.height - waveToCanvas(point.y);
            const dist = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
            if (dist < 20 && dist < minDist) {
                minDist = dist;
                draggingWavePoint = i;
            }
        });
    }
    
    // Add listeners in both phases
    waveCanvas.addEventListener("mousedown", handleWaveMouseDown, true);
    waveCanvas.addEventListener("mousedown", handleWaveMouseDown, false);
    
    function handleWaveMouseMove(e) {
        if (draggingWavePoint >= 0) {
            const now = Date.now();
            if (now - lastWavePointUpdate < pointUpdateInterval) {
                return; // Skip this update
            }
            lastWavePointUpdate = now;
            
            const rect = waveCanvas.getBoundingClientRect();
            const scaleX = waveCanvas.width / rect.width;
            const scaleY = waveCanvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // Convert to wave coordinates
            const newX = canvasToWave(mouseX);
            const newY = canvasToWave(waveCanvas.height - mouseY);
            
            // Update point
            wavePoints[draggingWavePoint].x = Math.max(-1, Math.min(1, newX));
            wavePoints[draggingWavePoint].y = Math.max(-1, Math.min(1, newY));
            
            // Send to CMajor with requestAnimationFrame
            requestAnimationFrame(() => {
                patchConnection.sendEventOrValue(`wave${draggingWavePoint}x`, wavePoints[draggingWavePoint].x);
                patchConnection.sendEventOrValue(`wave${draggingWavePoint}y`, wavePoints[draggingWavePoint].y);
            });
            
            drawWaveshaper();
        }
    }
    
    // Add to both canvas and document for safety
    waveCanvas.addEventListener("mousemove", handleWaveMouseMove);
    document.addEventListener("mousemove", handleWaveMouseMove);
    
    waveCanvas.addEventListener("mouseup", () => {
        draggingWavePoint = -1;
    });
    
    // Also add global mouseup to handle when mouse leaves canvas
    document.addEventListener("mouseup", () => {
        if (draggingWavePoint >= 0) {
            draggingWavePoint = -1;
        }
    });
    
    // Touch support for waveshaper
    let activeWaveTouchId = null;
    
    // Helper for waveshaper touch coords
    function getWaveTouchCoords(touch, rect) {
        // Get relative position within the canvas element
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // The canvas internal dimensions are always 380x380
        // But the displayed size is different due to CSS scaling
        const scaleX = waveCanvas.width / rect.width;
        const scaleY = waveCanvas.height / rect.height;
        
        return {
            x: x * scaleX,
            y: y * scaleY
        };
    }
    
    waveCanvas.addEventListener("touchstart", (e) => {
        if (e.cancelable) e.preventDefault();
        
        if (e.touches.length > 1) return;
        
        const touch = e.touches[0];
        activeWaveTouchId = touch.identifier;
        
        const rect = waveCanvas.getBoundingClientRect();
        const coords = getWaveTouchCoords(touch, rect);
        const touchX = coords.x;
        const touchY = coords.y;
        
        // Find closest point
        let minDist = Infinity;
        wavePoints.forEach((point, i) => {
            const px = ((point.x + 1) / 2) * waveCanvas.width;
            const py = ((1 - point.y) / 2) * waveCanvas.height;
            const dist = Math.sqrt(Math.pow(touchX - px, 2) + Math.pow(touchY - py, 2));
            if (dist < 30 && dist < minDist) { // Larger touch target
                minDist = dist;
                draggingWavePoint = i;
                lastWavePointUpdate = Date.now();
            }
        });
    }, { passive: false });
    
    waveCanvas.addEventListener("touchmove", (e) => {
        if (e.cancelable) e.preventDefault();
        
        if (draggingWavePoint < 0) return;
        
        const touch = Array.from(e.touches).find(t => t.identifier === activeWaveTouchId);
        if (!touch) return;
        
        const now = Date.now();
        if (now - lastWavePointUpdate < pointUpdateInterval) {
            return;
        }
        lastWavePointUpdate = now;
        
        const rect = waveCanvas.getBoundingClientRect();
        const coords = getWaveTouchCoords(touch, rect);
        const touchX = coords.x;
        const touchY = coords.y;
        
        const normalizedX = (touchX / waveCanvas.width) * 2 - 1;
        const normalizedY = 1 - (touchY / waveCanvas.height) * 2;
        
        const index = draggingWavePoint;
        const prevX = index > 0 ? wavePoints[index - 1].x : -1;
        const nextX = index < wavePoints.length - 1 ? wavePoints[index + 1].x : 1;
        
        if (normalizedX > prevX + 0.05 && normalizedX < nextX - 0.05) {
            wavePoints[index].x = Math.max(-1, Math.min(1, normalizedX));
            wavePoints[index].y = Math.max(-1, Math.min(1, normalizedY));
            
            // Send to CMajor with requestAnimationFrame
            requestAnimationFrame(() => {
                patchConnection.sendEventOrValue(`wave${index}x`, wavePoints[index].x);
                patchConnection.sendEventOrValue(`wave${index}y`, wavePoints[index].y);
            });
            
            drawWaveCanvas();
        }
    }, { passive: false });
    
    waveCanvas.addEventListener("touchend", (e) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === activeWaveTouchId);
        if (touch) {
            draggingWavePoint = -1;
            activeWaveTouchId = null;
        }
    }, { passive: false });
    
    // Reset waveshaper button
    resetWaveButton.addEventListener("click", () => {
        // Set linear curve
        wavePoints[0] = {x: -1, y: -1};
        wavePoints[1] = {x: -0.7, y: -0.7};
        wavePoints[2] = {x: -0.5, y: -0.5};
        wavePoints[3] = {x: -0.3, y: -0.3};
        wavePoints[4] = {x: 0.3, y: 0.3};
        wavePoints[5] = {x: 0.5, y: 0.5};
        wavePoints[6] = {x: 0.7, y: 0.7};
        wavePoints[7] = {x: 1, y: 1};
        
        // Send to CMajor
        wavePoints.forEach((point, i) => {
            patchConnection.sendEventOrValue(`wave${i}x`, point.x);
            patchConnection.sendEventOrValue(`wave${i}y`, point.y);
        });
        
        drawWaveshaper();
    });
    
    // Set up waveshaper point listeners
    for (let i = 0; i < 8; i++) {
        patchConnection.addParameterListener(`wave${i}x`, (value) => {
            wavePoints[i].x = value;
            drawWaveshaper();
        });
        patchConnection.addParameterListener(`wave${i}y`, (value) => {
            wavePoints[i].y = value;
            drawWaveshaper();
        });
        
        patchConnection.requestParameterValue(`wave${i}x`);
        patchConnection.requestParameterValue(`wave${i}y`);
    }
    
    // Curve switcher functionality
    let currentView = 'compression';
    
    const frontSide = container.querySelector('.curve-side.front');
    const backSide = container.querySelector('.curve-side.back');
    
    compressionBtn.addEventListener('click', () => {
        if (currentView !== 'compression') {
            currentView = 'compression';
            
            // Animate the transition
            backSide.classList.add('hiding');
            backSide.classList.remove('active');
            
            setTimeout(() => {
                backSide.classList.remove('hiding');
                frontSide.classList.add('active');
            }, 300);
            
            compressionBtn.classList.add('active');
            waveshaperBtn.classList.remove('active');
        }
    });
    
    waveshaperBtn.addEventListener('click', () => {
        if (currentView !== 'waveshaper') {
            currentView = 'waveshaper';
            
            // Animate the transition
            frontSide.classList.add('hiding');
            frontSide.classList.remove('active');
            
            setTimeout(() => {
                frontSide.classList.remove('hiding');
                backSide.classList.add('active');
                // Force a redraw
                drawWaveshaper();
            }, 300);
            
            waveshaperBtn.classList.add('active');
            compressionBtn.classList.remove('active');
        }
    });
    
    // Initial draw
    updateZoomDisplay();
    drawCurve();
    drawWaveshaper();
    
    
    // User preset functionality
    function getCurrentState() {
        return {
            name: `Preset ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            compressionPoints: [...points],
            waveshaperPoints: [...wavePoints],
            parameters: {
                inputGain: parseFloat(container.querySelector('#inputGain').value),
                attackBase: parseFloat(container.querySelector('#attackBase').value),
                releaseBase: parseFloat(container.querySelector('#releaseBase').value),
                makeupGain: parseFloat(container.querySelector('#makeupGain').value),
                mix: parseFloat(container.querySelector('#mix').value) / 100,
                waveshaperAmount: parseFloat(container.querySelector('#waveshaperAmount').value) / 100
            }
        };
    }
    
    function loadUserPreset(preset) {
        // Load compression points
        if (preset.compressionPoints) {
            points = [...preset.compressionPoints];
            points.forEach((point, i) => {
                patchConnection.sendEventOrValue(`comp${i}x`, point.x);
                patchConnection.sendEventOrValue(`comp${i}y`, point.y);
            });
        }
        
        // Load waveshaper points
        if (preset.waveshaperPoints) {
            wavePoints = [...preset.waveshaperPoints];
            wavePoints.forEach((point, i) => {
                patchConnection.sendEventOrValue(`wave${i}x`, point.x);
                patchConnection.sendEventOrValue(`wave${i}y`, point.y);
            });
        }
        
        // Load parameters
        if (preset.parameters) {
            Object.entries(preset.parameters).forEach(([key, value]) => {
                if (key === 'mix' || key === 'waveshaperAmount') {
                    patchConnection.sendEventOrValue(key, value);
                } else {
                    patchConnection.sendEventOrValue(key, value);
                }
            });
        }
        
        drawCurve();
        drawWaveshaper();
    }
    
    function updateUserPresetDropdown() {
        // Update the user presets in the dropdown
        userPresetOptGroup.innerHTML = Object.entries(userPresets).map(([id, preset]) => 
            `<option value="user:${id}">${preset.name}</option>`
        ).join('');
    }
    
    // Save preset button
    savePresetButton.addEventListener('click', () => {
        const state = getCurrentState();
        const name = prompt('Enter preset name:', state.name);
        if (name) {
            state.name = name;
            const id = Date.now().toString();
            userPresets[id] = state;
            localStorage.setItem('lutCompressorUserPresets', JSON.stringify(userPresets));
            updateUserPresetDropdown();
            // Select the newly saved preset
            presetSelector.value = `user:${id}`;
        }
    });
    
    // Delete preset button
    deletePresetButton.addEventListener('click', () => {
        const selectedValue = presetSelector.value;
        if (selectedValue && selectedValue.startsWith('user:')) {
            const id = selectedValue.substring(5); // Remove 'user:' prefix
            const preset = userPresets[id];
            if (preset && confirm(`Delete preset "${preset.name}"?`)) {
                delete userPresets[id];
                localStorage.setItem('lutCompressorUserPresets', JSON.stringify(userPresets));
                updateUserPresetDropdown();
                presetSelector.value = ''; // Clear selection
            }
        } else {
            alert('Please select a user preset to delete');
        }
    });
    
    // Send initial values
    setTimeout(() => {
        points.forEach((point, i) => {
            patchConnection.sendEventOrValue(`comp${i}x`, point.x);
            patchConnection.sendEventOrValue(`comp${i}y`, point.y);
        });
    }, 100);
    
    // Handle mobile canvas sizing
    function adjustCanvasesForMobile() {
        // Keep original canvas sizes
        canvas.width = 380;
        canvas.height = 380;
        waveCanvas.width = 380;
        waveCanvas.height = 380;
        
        // Redraw
        drawCurve();
        drawWaveshaper();
    }
    
    // Apply mobile adjustments after a short delay
    setTimeout(adjustCanvasesForMobile, 200);
    
    return container;
}