// Mobile Plugin Support for Secret Weapon DSP
// This script adds mobile touch support and viewport fixes for WASM audio plugins

(function() {
    'use strict';
    
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);
    
    // Apply mobile-specific styles
    function applyMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Plugin Styles */
            @media (max-width: 768px) {
                .plugin-container,
                .interface-preview,
                #pluginContainer {
                    position: relative;
                    overflow: visible;
                    min-height: auto;
                    height: auto;
                    max-height: none;
                }
                
                /* Let the plugin scale dynamically via JavaScript */
                /* Removed fixed transforms to avoid conflicts */
                
                /* Canvas Comp uses its own mobile styles */
                
                /* Ensure touch events work */
                .plugin-wrapper *,
                #quantumEQContainer *,
                #canvasCompressorContainer *,
                #lutCompressorContainer * {
                    touch-action: none;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
                
                /* Allow scrolling on the controls panel */
                .controls,
                .plugin-wrapper .controls,
                #canvasCompContainer .controls,
                #canvasCompContainer > div .controls {
                    touch-action: pan-y !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                
                /* But keep form controls non-scrollable */
                .controls input,
                .controls button,
                .controls select,
                .control-point {
                    touch-action: none !important;
                }
                
                /* Control points should be larger on mobile */
                .control-point {
                    width: 40px !important;
                    height: 40px !important;
                    margin: -20px 0 0 -20px !important;
                }
                
                /* Better mobile container styles */
                #quantumEQContainer {
                    background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
            }
            
            @media (min-width: 769px) and (max-width: 1024px) {
                /* Let JavaScript handle the scaling */
                .plugin-container,
                .interface-preview,
                #pluginContainer {
                    position: relative;
                    overflow: visible;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Track the current scale for coordinate transformation
    window.pluginScale = 1;
    
    // Update the scale value
    window.updateTouchScale = function(scale) {
        window.pluginScale = scale;
    };
    
    // Add touch event polyfill for better mobile support
    function addTouchSupport() {
        // Special handling for scrollable areas
        const handleScrollableTouch = function(event) {
            // Check if we're touching inside the controls panel
            const controlsPanel = event.target.closest('.controls');
            
            if (controlsPanel) {
                // If it's a control element, handle it
                const isControl = event.target.matches('input, button, select') || 
                                event.target.closest('input, button, select');
                
                if (isControl) {
                    // It's a control, convert to mouse event
                    touchHandler(event);
                } else {
                    // It's the panel background - don't handle it at all
                    // Let the panel-specific handlers deal with scrolling
                    return;
                }
            } else {
                // Not in controls panel, handle normally
                touchHandler(event);
            }
        };
        
        // Convert mouse events to touch events
        const touchHandler = function(event) {
            const touches = event.changedTouches;
            const first = touches[0];
            let type = "";
            
            switch(event.type) {
                case "touchstart": type = "mousedown"; break;
                case "touchmove":  type = "mousemove"; break;        
                case "touchend":   type = "mouseup";   break;
                default: return;
            }
            
            // Get the target element's bounding rect
            const rect = event.target.getBoundingClientRect();
            const scale = window.pluginScale || 1;
            
            // Adjust coordinates based on scale
            const adjustedX = first.clientX;
            const adjustedY = first.clientY;
            
            // Create corresponding mouse event
            const simulatedEvent = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                detail: 1,
                screenX: first.screenX,
                screenY: first.screenY,
                clientX: adjustedX,
                clientY: adjustedY,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: null
            });
            
            first.target.dispatchEvent(simulatedEvent);
            
            // Prevent default to avoid scrolling the page
            if (event.target.classList.contains('control-point') || 
                event.target.closest('.plugin-wrapper, #quantumEQContainer, #canvasCompressorContainer, #lutCompressorContainer, #canvasCompContainer')) {
                event.preventDefault();
            }
        };
        
        // Add touch handlers to document
        document.addEventListener("touchstart", handleScrollableTouch, { passive: false });
        document.addEventListener("touchmove", handleScrollableTouch, { passive: false });
        document.addEventListener("touchend", handleScrollableTouch, { passive: false });
        document.addEventListener("touchcancel", handleScrollableTouch, { passive: false });
    }
    
    // Improve touch responsiveness
    function improveTouchResponsiveness() {
        // Disable zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Disable pinch zoom on plugin area
        document.addEventListener('gesturestart', function(e) {
            if (e.target.closest('.plugin-wrapper, #quantumEQContainer, #canvasCompressorContainer, #lutCompressorContainer')) {
                e.preventDefault();
            }
        });
    }
    
    // Initialize mobile support
    function init() {
        if (isMobile || isTablet) {
            applyMobileStyles();
            addTouchSupport();
            improveTouchResponsiveness();
            
            // Add mobile class to body for additional styling
            document.body.classList.add('mobile-device');
            if (isTablet) {
                document.body.classList.add('tablet-device');
            }
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();