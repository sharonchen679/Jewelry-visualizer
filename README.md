# Jewelry Visualizer Widget

A modern, responsive jewelry stone visualizer with accurate sizing using CSS mm units and calibration features. Ready for deployment and Wix integration.

🔗 **Live Demo**: [https://sharonchen679.github.io/Jewelry-visualizer/widget/](https://sharonchen679.github.io/Jewelry-visualizer/widget/)

## Features

- **Accurate Sizing**: Uses CSS mm units for real-world size representation
- **Interactive Calibration**: Credit card calibration system for precise sizing
- **Admin Panel**: Secret password system with draggable admin interface
- **Embedded Data**: Self-contained with no external file dependencies
- **Wix Compatible**: Ready for iframe embedding in Wix websites
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Ready**: Optimized for static hosting

## Quick Start

### For Wix Integration
Add this iframe to your Wix site:
```html
<iframe 
    src="https://sharonchen679.github.io/Jewelry-visualizer/widget/" 
    width="100%" 
    height="800px" 
    frameborder="0">
</iframe>
```

### For Direct Use
Simply visit: [https://sharonchen679.github.io/Jewelry-visualizer/widget/](https://sharonchen679.github.io/Jewelry-visualizer/widget/)

## Project Structure

```
jewelry-visualizer/
├── widget/
│   ├── index.html          # Main widget interface
│   ├── style.css           # Widget styling with CSS mm units
│   ├── script.js           # Core functionality
│   └── config.js           # Configuration & embedded data
├── admin/
│   ├── admin.js            # Admin panel functionality
│   └── admin.css           # Admin panel styling
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Stone Data

The widget includes embedded data for these stones:

### Center Stones
- Round (4mm width, sizes: 4-6.5mm)
- Emerald (3.2mm width, sizes: 4.6-6.7mm)  
- Oval (3.6mm width, sizes: 5.2-8mm)
- Diamond cut (4.24mm width, sizes: 4-6.5mm)
- Diamond (3.52mm width, sizes: 1.9-10mm)
- Hexa (3mm width, sizes: 3.3-6mm)

### Side Stones
- Moon (4.15mm height, sizes: 4-6.4mm)
- Hexa (3mm height, sizes: 3.3-45mm)
- Diamond (7.13mm height, sizes: 3.52-10mm)
- Diamond cut (7.43mm height, sizes: 2.8-6.5mm)

## Admin Access

- **Default Password**: `secret`
- **Access Method**: Click letters in "Select Center Stone" title to spell password
- **Features**: 
  - Change Password (Coming Soon)
  - Manage Assets (Coming Soon)
  - Draggable interface
  - Secure session management

## Calibration System

- **Default**: CSS mm units (1mm = 1mm on screen)
- **Credit Card Reference**: Drag to match real credit card (85.6mm × 53.98mm)
- **Precision Controls**: ±0.1mm adjustments with up/down arrows
- **Auto-save**: Settings persist across sessions
- **Collapsible Panel**: Clean interface when not needed

## Image Management

### Current Setup
- Placeholder image paths in `config.js`
- Ready for Wix Media Manager integration

### To Add Images
1. Upload images to Wix Media Manager
2. Update the `stoneImageUrls` object in `widget/config.js`:

```javascript
stoneImageUrls: {
    "Round": "https://static.wixstatic.com/media/your-wix-url-here",
    "Emerald": "https://static.wixstatic.com/media/your-wix-url-here",
    // ... etc
}
```

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/sharonchen679/Jewelry-visualizer.git

# Open widget/index.html in your browser
# Or serve with a local server for full functionality
```

### Deployment
The project is automatically deployed to GitHub Pages on push to main branch.

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 16+

## Technical Details

- **No Dependencies**: Pure HTML, CSS, JavaScript
- **No Build Process**: Ready to deploy as-is
- **Self-Contained**: All data embedded in code
- **Responsive**: CSS Grid and Flexbox layout
- **Accessible**: Keyboard and screen reader friendly

## License

This project is for demonstration purposes. All rights reserved.

---

**Need help with integration?** Open an issue or contact the development team. 