# Cineby TV - Netflix-style Interface for Tizen Smart TVs

A TizenBrew NPM module that transforms cineby.gd into a Netflix-style TV interface with full remote control support.

## Features

### 🎨 Netflix-Style UI
- Clean, TV-optimized interface
- Heavy red border on focused elements (Netflix signature style)
- Smooth focus animations and transitions
- Increased font sizes for TV viewing distances
- Hides desktop-only elements (headers, sidebars, footers)

### 🎮 Full Remote Control Support
- **Arrow Keys** (37-40): Navigate through elements spatially
- **Enter** (13): Click/activate focused element
- **Back/Return** (10009): Go back or close modals

### 📺 TV-Specific Optimizations
- Fixed viewport (1920px or 1280px) to prevent desktop layout
- Spatial navigation engine for intuitive movement
- Dynamic content detection and focus management
- Smooth scrolling and element centering
- Custom back button for easy navigation

### ⚡ Performance
- Lightweight ES5 JavaScript (compatible with Tizen 3.0)
- Efficient element scanning and caching
- MutationObserver for dynamic content
- Optimized focus management

## Installation

### Prerequisites
- Tizen TV (Tizen 3.0 or higher)
- TizenBrew installed on your TV
- Node.js (for development)

### Installation Steps

1. **Install the module:**
   ```bash
   npm install tizenbrew-cineby-tv
   ```

2. **Configure TizenBrew:**
   - Add the module to your TizenBrew configuration
   - The module will automatically load when visiting cineby.gd

3. **Launch cineby.gd on your TV:**
   - Open TizenBrew
   - Navigate to Cineby TV
   - The Netflix-style interface will automatically activate

## Usage

### Remote Control
- **▲/▼/◀/▶**: Navigate between movies, shows, and menu items
- **OK/Enter**: Select a movie or show
- **Back/Return**: Go back to previous screen or close modal

### Focus Indicators
- Focused elements have a heavy red border (Netflix red: #E50914)
- Glow effect appears around focused items
- Smooth scale animation on focus

### Navigation
- Automatic spatial navigation finds the closest element in each direction
- Supports horizontal scrolling content
- Automatically scrolls focused elements into view

## Configuration

The module can be customized by editing `index.js`:

```javascript
var CONFIG = {
  viewports: [1920, 1280],        // Supported viewport sizes
  focusColor: '#E50914',         // Focus border color (Netflix red)
  focusSize: '4px',              // Focus border size
  focusAnimation: true,          // Enable focus animation
  fontSizeMultiplier: 1.2,       // Font size multiplier
  cardPadding: '16px',           // Spacing between cards
  hideSelectors: [...],          // Elements to hide
  focusableSelectors: [...]      // Selectable elements
};
```

## Technical Details

### Browser Compatibility
- ✅ Tizen 3.0+
- ✅ ES5 JavaScript (no ES6+ features)
- ✅ Modern DOM APIs

### Key Components

1. **Style Injection**
   - Netflix-style CSS with red focus borders
   - TV-optimized typography and spacing
   - Hide desktop elements

2. **Spatial Navigation Engine**
   - Scans for focusable elements (links, buttons, cards)
   - Calculates distances for directional movement
   - Falls back to linear navigation when needed

3. **Remote Control Mapping**
   - Maps TV remote keys to navigation actions
   - Prevents default browser behavior for arrow keys
   - Handles Tizen-specific key codes (10009)

4. **Viewport Management**
   - Forces TV-compatible viewport sizes
   - Prevents desktop layout activation
   - Responsive to window changes

## Development

### File Structure
```
cineby-tv/
├── package.json          # Module metadata
├── index.js              # Main modification script
└── README.md            # This file
```

### Building
No build step required! The module uses pure ES5 JavaScript.

### Testing
- Test on actual Tizen TV hardware
- Use Tizen Studio for debugging
- Check console for initialization messages

## Troubleshooting

### Module not loading
1. Verify TizenBrew is properly installed
2. Check module configuration in TizenBrew
3. Look for errors in Tizen debug console

### Navigation not working
1. Verify remote control is paired
2. Check that elements are visible on screen
3. Try reloading the page

### Layout issues
1. Check console for viewport warnings
2. Ensure CSS styles are loaded
3. Verify no conflicting styles on the site

## Contributing

Contributions welcome! Please:
1. Keep code ES5-compatible
2. Test on Tizen 3.0+
3. Follow the existing code style
4. Test with remote control

## License

MIT License - Feel free to use and modify!

## Credits

- Developed for TizenBrew
- Inspired by Netflix's TV interface
- Built for cineby.gd

## Support

For issues and questions:
- Check the TizenBrew documentation
- Review the console for error messages
- Test on multiple Tizen TV models

---

**Enjoy streaming with a Netflix-style experience on your Tizen TV!** 🎬📺
