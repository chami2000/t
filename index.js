// AnimeKai.to TizenBrew Module - Auto-Dub Edition
// Version 3.0
// Features: Auto-Dub, Episode Selector, Performance Mode
(function() {
  'use strict';

  // ========================================
  // 1. CONFIGURATION
  // ========================================
  var CONFIG = {
    targetDomain: 'animekai.to',
    
    // ELEMENTS TO HIDE (Garbage Collection)
    // We removed '.episode-section' and '.eplist' from this list to ensure they show up
    hideSelectors: [
      // Header/Footer Junk
      '#nav-menu-btn', '.w2g-btn', '.shuffle-btn', '.nav-menu',
      '#social-sharing', '.alert', '.text-center.mb-5', 'img[src*="solarcdn"]',
      'footer', '#cookie-banner', '.swiper-pagination', '.featured-nav',
      '.gif-sharing', '.modal', 
      
      // Heavy Page Elements (Keep video smooth)
      '#comment',           // Hiding comments saves huge RAM
      '.sidebar',           // Hiding sidebar focuses attention
      '.social-share-watch',
      '.rate-box',
      '.entity-section',    // Description text
      '.breadcrumb',
      '.ctrl.light', '.ctrl.expand', '.ctrl.report'
    ],

    // ELEMENTS TO CLICK (Navigation Targets)
    focusableSelectors: [
      // Home
      '#search input',
      '#search-btn', 
      '.watch-btn', 
      '.aitem', 
      
      // Watch Page
      '.play-btn',              
      '#player',                
      '.ctrl button',           
      
      // Episodes & Servers
      '.ep-item',               // Episode buttons
      '.eplist a',              // Alternate episode link style
      '.eplist li',             // List items
      '.server-item',           // Server switchers
      '.lang-item'              // Audio language switchers
    ],

    focusColor: '#FF003C',      // Neon Red
    scrollOffset: 300
  };

  var state = {
    focusableElements: [],
    lastFocus: null,
    initialized: false
  };

  // ========================================
  // 2. CSS ENGINE
  // ========================================
  function addStyles() {
    var style = document.createElement('style');
    style.id = 'tv-mod-css';
    
    var css = '';

    // --- HIDE JUNK ---
    css += CONFIG.hideSelectors.join(', ') + ' { display: none !important; }';

    // --- PERFORMANCE ---
    css += '* { animation: none !important; transition: none !important; box-shadow: none !important; }';
    css += 'body { background-color: #000 !important; overflow-x: hidden; }';
    
    // --- LAYOUT ---
    css += '.dual-col { display: block !important; width: 100% !important; }';
    css += '.scontent { width: 100% !important; max-width: 100% !important; flex: 0 0 100% !important; }';
    css += '.watch-section { padding-top: 10px !important; }';
    css += '.player-wrap { margin-bottom: 20px !important; }';
    
    // --- EPISODE LIST STYLING (Make them big enough to click) ---
    css += '.episode-section, .eplist { display: block !important; width: 100% !important; opacity: 1 !important; visibility: visible !important; }';
    css += '.ep-item, .eplist a, .eplist li { display: inline-block !important; padding: 10px 20px !important; margin: 5px !important; background: #222 !important; color: #fff !important; border: 1px solid #444 !important; font-size: 16px !important; min-width: 50px; text-align: center; }';
    
    // --- ACTIVE DUB BUTTON STYLING ---
    css += '.active.server-item, .active.ep-item { background-color: ' + CONFIG.focusColor + ' !important; color: white !important; border-color: white !important; }';

    // --- CURSOR HIGHLIGHT ---
    css += '.tv-focused {';
    css += '  outline: 6px solid ' + CONFIG.focusColor + ' !important;'; 
    css += '  outline-offset: 3px !important;'; 
    css += '  transform: scale(1.1) !important;';
    css += '  z-index: 99999 !important;'; 
    css += '  box-shadow: 0 0 50px ' + CONFIG.focusColor + ' !important;'; 
    css += '  background-color: #333 !important;';
    css += '}';
    
    // Player specific focus
    css += '#player.tv-focused { outline: 2px solid ' + CONFIG.focusColor + ' !important; transform: none !important; }';

    style.innerHTML = css;
    document.head.appendChild(style);
  }

  // ========================================
  // 3. AUTO-DUB LOGIC
  // ========================================
  function forceDub() {
    // 1. Look for Language Switcher (Header/Player)
    var langSwitch = document.querySelectorAll('.lang-sw span, .server-item');
    
    for (var i = 0; i < langSwitch.length; i++) {
        var text = langSwitch[i].innerText.toLowerCase().trim();
        var isDub = text === 'dub' || text === 'english' || text === 'en';
        
        // If we found a Dub button and it's NOT active, click it
        if (isDub && !langSwitch[i].classList.contains('active')) {
            console.log('TV Module: Auto-switching to DUB');
            langSwitch[i].click();
            return; // Stop after clicking
        }
    }

    // 2. Look for explicit Dub tab (common in server lists)
    var dubTab = document.querySelector('[data-type="dub"], [data-lang="dub"]');
    if (dubTab && !dubTab.classList.contains('active')) {
        dubTab.click();
    }
  }

  // ========================================
  // 4. NAVIGATION ENGINE
  // ========================================
  function scanElements() {
    var selector = CONFIG.focusableSelectors.join(', ');
    var rawList = document.querySelectorAll(selector);
    var visibleList = [];

    for (var i = 0; i < rawList.length; i++) {
      var el = rawList[i];
      var rect = el.getBoundingClientRect();
      var isInput = el.tagName === 'INPUT';
      var isIframe = el.tagName === 'IFRAME' || el.id === 'player';

      if ((rect.width > 0 && rect.height > 0) || isInput || isIframe) {
        visibleList.push(el);
      }
    }
    state.focusableElements = visibleList;
  }

  function setFocus(el) {
    if (!el) return;
    if (state.lastFocus) state.lastFocus.classList.remove('tv-focused');

    el.classList.add('tv-focused');
    state.lastFocus = el;
    
    try {
      el.scrollIntoView({block: 'center', inline: 'center', behavior: 'auto'});
    } catch(e) {
      window.scrollTo(0, el.offsetTop - CONFIG.scrollOffset);
    }
  }

  function moveFocus(direction) {
    scanElements();
    
    if (!state.lastFocus) {
      // Priority: Play Button -> First Episode -> Watch Button
      var start = document.querySelector('.play-btn') || 
                  document.querySelector('.ep-item') ||
                  document.querySelector('.watch-btn') || 
                  state.focusableElements[0];
      setFocus(start);
      return;
    }

    var currentRect = state.lastFocus.getBoundingClientRect();
    var curX = currentRect.left + (currentRect.width / 2);
    var curY = currentRect.top + (currentRect.height / 2);

    var bestEl = null;
    var bestDist = Infinity;

    for (var i = 0; i < state.focusableElements.length; i++) {
      var el = state.focusableElements[i];
      if (el === state.lastFocus) continue;

      var rect = el.getBoundingClientRect();
      var targetX = rect.left + (rect.width / 2);
      var targetY = rect.top + (rect.height / 2);

      var dx = targetX - curX;
      var dy = targetY - curY;
      
      var valid = false;
      var weight = 0; 

      if (direction === 'UP') {
         if (dy < -10) { valid = true; weight = Math.abs(dx) * 0.5; }
      }
      else if (direction === 'DOWN' && dy > 10) { valid = true; weight = Math.abs(dx) * 2; }
      else if (direction === 'LEFT' && dx < -10) { valid = true; weight = Math.abs(dy) * 3; }
      else if (direction === 'RIGHT' && dx > 10) { valid = true; weight = Math.abs(dy) * 3; }

      if (valid) {
        var dist = Math.sqrt(dx*dx + dy*dy) + weight;
        if (dist < bestDist) {
          bestDist = dist;
          bestEl = el;
        }
      }
    }

    if (bestEl) setFocus(bestEl);
  }

  // ========================================
  // 5. INPUT HANDLING
  // ========================================
  function handleKey(e) {
    var key = e.keyCode;
    // 37-40: Arrows, 13: Enter, 10009: Back
    if ([37, 38, 39, 40, 13, 10009].indexOf(key) === -1) return;

    if (key === 10009) {
      window.history.back();
      return;
    }

    if (key === 13) {
      e.preventDefault();
      if (state.lastFocus) {
        if (state.lastFocus.tagName === 'INPUT') {
            state.lastFocus.focus();
            return;
        }
        if (state.lastFocus.classList.contains('play-btn')) {
            state.lastFocus.click();
            // Wait for player to load then focus it
            setTimeout(function() {
                var playerContainer = document.querySelector('#player');
                if (playerContainer) setFocus(playerContainer);
            }, 1000);
            return;
        }
        state.lastFocus.click();
      }
      return;
    }

    e.preventDefault();
    if (key === 37) moveFocus('LEFT');
    if (key === 38) moveFocus('UP');
    if (key === 39) moveFocus('RIGHT');
    if (key === 40) moveFocus('DOWN');
  }

  // ========================================
  // 6. INITIALIZATION
  // ========================================
  function init() {
    if (window.location.href.indexOf(CONFIG.targetDomain) === -1) return;
    if (state.initialized) return;

    addStyles();
    scanElements();
    
    // Initial Dub Check
    forceDub();

    // Start Focus
    var starter = document.querySelector('.play-btn') || 
                  document.querySelector('.ep-item') || 
                  document.querySelector('.watch-btn');
    if (starter) setFocus(starter);

    document.addEventListener('keydown', handleKey);
    
    // Listen for AJAX updates (like when you click "Season 2" or Episode list loads)
    var observer = new MutationObserver(function(mutations) {
        scanElements();
        forceDub(); // Check for dub again whenever page updates
    });
    observer.observe(document.body, { childList: true, subtree: true });

    state.initialized = true;
    console.log('AnimeKai TV: Auto-Dub Enabled');
  }

  init();
  setTimeout(init, 1500);

})();
