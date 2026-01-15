// tv Tizen Module
// Works on Home Page AND Player Page
// Includes bypass for "Disable-Devtool" scripts
// Tizen 3.0 / Chromium 47 Compatible (ES5)

(function() {
  'use strict';

  // ===============================================================
  // 1. CONFIGURATION & DETECTION
  // ===============================================================
  var PAGE_MODE = 'UNKNOWN'; // Will detect: 'HOME' or 'PLAYER'

  var CONFIG = {
    focusColor: '#E50914',
    
    // Elements to ALWAYS hide on ALL pages
    commonHide: [
      '.navbar', 'nav', 'footer', '.theme-toggle', // Menus
      'iframe', '.ad-container', 'ins.adsbygoogle', // Ads
      'script', 'div[style*="z-index: -1000"]', // Trackers
      '.row.mb-4' // The dropdown menus on home page
    ],

    // Specific logic for Home Page
    home: {
      selectors: ['.channel-card']
    },

    // Specific logic for Player Page
    player: {
      selectors: ['.player', '.tab-buttons button', '.tab-content li a']
    }
  };

  // ===============================================================
  // 2. POLYFILLS & SECURITY BYPASS
  // ===============================================================
  // Fix Object.assign for old TVs
  if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
      if (target == null) throw new TypeError('Cannot convert undefined or null to object');
      target = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
          }
        }
      }
      return target;
    };
  }

  // --- BYPASS DISABLE-DEVTOOL ---
  // We overwrite the library so it stops checking
  try {
      window.DisableDevtool = function() { console.log('TizenBrew: Anti-Devtool Neutralized'); };
      if (window.disableDevtool && window.disableDevtool.isRunning) {
          window.disableDevtool.isRunning = false;
      }
  } catch(e) {}

  // ===============================================================
  // 3. STATE MANAGEMENT
  // ===============================================================
  var state = {
    focusIndex: 0,
    focusableElements: [],
    initialized: false
  };

  // ===============================================================
  // 4. DETECT PAGE TYPE
  // ===============================================================
  function detectPage() {
    if (document.querySelector('video') || document.querySelector('.player')) {
      PAGE_MODE = 'PLAYER';
      console.log('TizenBrew: Detected PLAYER Page');
    } else {
      PAGE_MODE = 'HOME';
      console.log('TizenBrew: Detected HOME Page');
    }
  }

  // ===============================================================
  // 5. CSS INJECTION
  // ===============================================================
  function addStyles() {
    var style = document.createElement('style');
    style.id = 'tb-styles';
    
    var css = '';
    
    // Global Dark Theme & Hiding
    css += 'body { background-color: #000 !important; color: #fff !important; overflow-x: hidden; margin: 0; padding: 10px; }';
    css += CONFIG.commonHide.join(', ') + ' { display: none !important; visibility: hidden !important; }';
    css += '::-webkit-scrollbar { width: 0; background: transparent; }';

    // Focus Ring
    css += '.tv-focused { outline: 4px solid ' + CONFIG.focusColor + ' !important; z-index: 9999; transform: scale(1.05); transition: transform 0.2s; box-shadow: 0 0 20px rgba(0,0,0,0.8); background-color: #222 !important; }';

    if (PAGE_MODE === 'HOME') {
      // Home Grid Fixes
      css += '.container { max-width: 100% !important; padding: 0 !important; }';
      css += '.channel-grid { display: flex !important; flex-wrap: wrap; justify-content: center; padding-top: 20px; }';
      css += '.channel-card { margin: 10px; width: 220px !important; display: block; text-decoration: none !important; }';
      css += '.channel-name { color: #ccc; font-size: 18px; padding: 5px; }';
    } 
    else if (PAGE_MODE === 'PLAYER') {
      // Player Page Fixes
      css += '.container { width: 100% !important; max-width: 100% !important; padding: 0 !important; }';
      css += '.player { margin-bottom: 20px; border-bottom: 2px solid #333; }';
      css += '.tab-buttons { display: flex; background: #1a1a1a; padding: 10px; overflow-x: auto; white-space: nowrap; }';
      css += '.tab-buttons button { background: #333; border: 1px solid #444; color: #fff; padding: 10px 20px; margin-right: 10px; font-size: 18px; }';
      css += '.tab-content ul { padding: 0; list-style: none; display: flex; flex-wrap: wrap; }';
      css += '.tab-content li { width: 100%; padding: 5px; border-bottom: 1px solid #222; }';
      css += '.program-info { display: flex; align-items: center; padding: 5px; }';
      css += '.program-info img { width: 60px; height: 60px; margin-right: 15px; border-radius: 4px; }';
      css += '.program-info span { font-size: 20px; }';
    }

    style.textContent = css;
    document.head.appendChild(style);
  }

  // ===============================================================
  // 6. VIDEO CONTROL (Player Mode Only)
  // ===============================================================
  function controlVideo(action) {
    var vid = document.querySelector('video');
    if (!vid) return;

    try {
      switch(action) {
        case 'PLAY':
          if (vid.paused) vid.play();
          else vid.pause();
          break;
        case 'FF':
          vid.currentTime += 15;
          break;
        case 'REW':
          vid.currentTime -= 15;
          break;
      }
      
      // Visual Feedback
      var toast = document.createElement('div');
      toast.textContent = action + (action === 'PLAY' ? (vid.paused ? ' ||' : ' >') : '');
      toast.style.cssText = 'position:fixed; top:50px; right:50px; background:rgba(229,9,20,0.9); color:white; padding:10px 20px; font-size:24px; z-index:10000; border-radius:4px;';
      document.body.appendChild(toast);
      setTimeout(function(){ if(toast.parentNode) toast.parentNode.removeChild(toast); }, 1500);
      
    } catch(e) { console.error(e); }
  }

  // ===============================================================
  // 7. SPATIAL NAVIGATION
  // ===============================================================
  function scanElements() {
    var selectors = (PAGE_MODE === 'PLAYER') ? CONFIG.player.selectors : CONFIG.home.selectors;
    var rawList = document.querySelectorAll(selectors.join(', '));
    var cleanList = [];
    
    for (var i = 0; i < rawList.length; i++) {
      var el = rawList[i];
      var rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none') {
        cleanList.push(el);
      }
    }
    state.focusableElements = cleanList;
  }

  function setFocus(index) {
    var oldEl = document.querySelector('.tv-focused');
    if (oldEl) oldEl.classList.remove('tv-focused');

    if (state.focusableElements.length === 0) return;
    
    // Bounds Check
    if (index < 0) index = 0;
    if (index >= state.focusableElements.length) index = state.focusableElements.length - 1;
    
    state.focusIndex = index;
    var newEl = state.focusableElements[index];
    
    if (newEl) {
      newEl.classList.add('tv-focused');
      try {
        newEl.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
      } catch(e) {
        newEl.scrollIntoView(true);
      }
    }
  }

  function moveFocus(direction) {
    scanElements(); 
    if (state.focusableElements.length === 0) return;

    var current = state.focusableElements[state.focusIndex];
    if (!current) { setFocus(0); return; }

    var curRect = current.getBoundingClientRect();
    var curCX = curRect.left + (curRect.width / 2);
    var curCY = curRect.top + (curRect.height / 2);

    var bestCandidate = -1;
    var minDistance = Infinity;

    for (var i = 0; i < state.focusableElements.length; i++) {
      if (i === state.focusIndex) continue;

      var el = state.focusableElements[i];
      var rect = el.getBoundingClientRect();
      var cx = rect.left + (rect.width / 2);
      var cy = rect.top + (rect.height / 2);

      var dx = cx - curCX;
      var dy = cy - curCY;

      var valid = false;
      // Weights allow vertical movement to be easier in lists
      if (direction === 'UP'    && dy < -10 && Math.abs(dx) < Math.abs(dy) * 4) valid = true;
      if (direction === 'DOWN'  && dy > 10  && Math.abs(dx) < Math.abs(dy) * 4) valid = true;
      if (direction === 'LEFT'  && dx < -10 && Math.abs(dy) < Math.abs(dx) * 2) valid = true;
      if (direction === 'RIGHT' && dx > 10  && Math.abs(dy) < Math.abs(dx) * 2) valid = true;

      if (valid) {
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDistance) {
          minDistance = dist;
          bestCandidate = i;
        }
      }
    }

    if (bestCandidate !== -1) {
      setFocus(bestCandidate);
    }
  }

  // ===============================================================
  // 8. INPUT HANDLER
  // ===============================================================
  function handleKey(e) {
    var code = e.keyCode;
    
    // Media Keys (Only active if Player Mode)
    if (PAGE_MODE === 'PLAYER') {
      if (code === 415 || code === 19 || code === 10252) { controlVideo('PLAY'); return; }
      if (code === 412) { controlVideo('REW'); return; }
      if (code === 417) { controlVideo('FF'); return; }
    }

    switch(code) {
      case 37: moveFocus('LEFT'); e.preventDefault(); break;
      case 38: moveFocus('UP'); e.preventDefault(); break;
      case 39: moveFocus('RIGHT'); e.preventDefault(); break;
      case 40: moveFocus('DOWN'); e.preventDefault(); break;
      case 13: // Enter
        var el = state.focusableElements[state.focusIndex];
        if (el) {
          // If User clicks the Player itself, toggle Play/Pause
          if (PAGE_MODE === 'PLAYER' && el.classList.contains('player')) {
            controlVideo('PLAY');
          } else {
            el.click();
            // If tab clicked, rescan after delay
            setTimeout(function() { scanElements(); }, 500); 
          }
        }
        break;
      case 10009: // Back
      case 8: 
        window.history.back(); 
        break;
    }
  }

  // ===============================================================
  // 9. STARTUP
  // ===============================================================
  function init() {
    if (state.initialized) return;
    
    // Anti-Devtool nuclear option
    try { 
        var noDev = document.getElementById('disable-devtool'); 
        if(noDev) noDev.innerHTML = '';
    } catch(e){}

    detectPage();
    addStyles();
    scanElements();
    
    if (state.focusableElements.length > 0) setFocus(0);

    document.addEventListener('keydown', handleKey);
    
    // Observer for dynamic content (tabs switching, lazy load)
    var observer = new MutationObserver(function(mutations) {
        // Simple debounce
        if (window.tizenScanTimer) clearTimeout(window.tizenScanTimer);
        window.tizenScanTimer = setTimeout(scanElements, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    state.initialized = true;
  }

  // Staggered Init
  setTimeout(init, 500);
  window.addEventListener('load', init);

})();
