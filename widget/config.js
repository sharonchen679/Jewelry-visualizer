// Jewelry Visualizer Configuration
const CONFIG = {
    // Default sizing - CSS mm units (1mm = 1mm on screen)
    sizing: {
        useMMUnits: true,
        defaultCalibrationRatio: 1.0,
        calibrationStorageKey: 'jewelry-visualizer-calibration'
    },

    // Credit card dimensions for calibration (in mm)
    creditCard: {
        width: 85.6,
        height: 53.98,
        minSize: 20, // minimum size in mm
        maxSize: 200 // maximum size in mm
    },

    // Precision adjustment step (in mm)
    precisionStep: 0.1,

    // Admin settings
    admin: {
        defaultPassword: 'secret', // Default password for first access
        passwordStorageKey: 'jewelry-visualizer-admin-password',
        sessionStorageKey: 'jewelry-visualizer-admin-session'
    },

    // Legacy asset paths (kept for reference, not actively used)
    assets: {
        centerStones: './assets/center-stones/',
        sideStones: './assets/side-stones/',
        info: './assets/info/',
        manifest: './assets/manifest.json'
    },

    // Embedded stone data (for Wix compatibility - no file fetching needed)
    stoneData: {
        centerStones: `
Round: 4 | 4, 5, 5.8, 6.5
Emerald: 3.2 | 4.6, 5.3, 6.3, 6.7
Oval: 3.6 | 5.2, 6.7, 7, 8
Diamond cut: 4.24 | 7.43, 4, 5, 5.8, 6.5
Diamond: 3.52 | 7.13, 1.9, 4.7, 5, 5.8, 6.5, 10
Hexa: 3 | 3.3, 4, 5.5, 6
`,
        
        sideStones: `
Moon: 4.15 | 6.86, 4, 4.3, 4.7, 4.9, 5.3, 5.6, 5.8, 6.1, 6.4
Hexa: 3 | 3.3, 4, 5.5, 6, 10, 20, 45
Diamond: 7.13 | 3.52, 4.7, 5, 5.8, 6.5, 10
Diamond cut: 7.43 | 4.24, 2.8, 5, 5.8, 6.5
`
    },

    // Stone image URLs (replace with your Wix Media Manager URLs)
    stoneImageUrls: {
        // Center stones - replace with actual Wix URLs
        "Round": "./assets/center-stones/Round.png",
        "Emerald": "./assets/center-stones/Emerald.png", 
        "Oval": "./assets/center-stones/Oval.png",
        "Diamond cut": "./assets/center-stones/Diamond-cut.png",
        "Diamond": "./assets/center-stones/Diamond.png",
        "Hexa": "./assets/center-stones/Hexa.png",
        
        // Side stones - replace with actual Wix URLs
        "Moon": "./assets/side-stones/Moon.png",
        "Hexa": "./assets/side-stones/Hexa.png",
        "Diamond": "./assets/side-stones/Diamond.png",
        "Diamond cut": "./assets/side-stones/Diamond-cut.png"
    },

    // UI settings
    ui: {
        animationDuration: 300,
        snapThreshold: 20, // pixels for slider snapping
        touchEnabled: true
    },

    // Error messages
    messages: {
        loadError: 'Failed to load stone data',
        assetError: 'Stone image not found',
        calibrationError: 'Calibration failed',
        adminError: 'Admin access denied'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 