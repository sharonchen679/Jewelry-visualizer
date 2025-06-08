// Jewelry Visualizer Main Script
// Using CSS mm units for accurate sizing

class JewelryVisualizer {
    constructor() {
        this.calibrationRatio = this.loadCalibrationRatio();
        this.isAdminMode = false;
        this.centerStones = [];
        this.sideStones = [];
        this.selectedCenterStone = null;
        this.selectedCenterStoneSize = null;
        this.loadingCenterStones = false;
        
        // Initialize admin module
        this.admin = new JewelryVisualizerAdmin(this);
        
        this.init();
    }

    async init() {
        try {
            this.setupCalibration();
            this.admin.setupPasswordSystem();
            await this.loadStoneData();
            this.renderCenterStones();
            this.setupEventListeners();
        } catch (error) {
            this.showError('Failed to initialize visualizer: ' + error.message);
        }
    }

    // Calibration System
    setupCalibration() {
        this.updateCalibrationDisplay();
        
        const toggle = document.getElementById('calibration-toggle');
        const panel = document.getElementById('calibration-panel');
        const resetBtn = document.getElementById('reset-calibration');
        const precisionBtns = document.querySelectorAll('.precision-btn');

        toggle.addEventListener('click', () => {
            panel.classList.toggle('collapsed');
        });

        resetBtn.addEventListener('click', () => {
            this.resetCalibration();
        });

        // Precision adjustment buttons (only up/down as specified)
        precisionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.adjustCalibrationPrecision(direction);
            });
        });

        // Drag functionality for credit card
        this.setupCreditCardDrag();
        
        // Setup click-outside-to-close for calibration panel
        this.setupCalibrationClickOutside();
    }

    setupCreditCardDrag() {
        const creditCard = document.getElementById('credit-card');
        let isDragging = false;
        let startY = 0;
        let startHeight = 0;

        creditCard.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startHeight = parseFloat(getComputedStyle(creditCard).height);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - startY;
            const newHeight = startHeight + deltaY;
            
            // Calculate new ratio based on height change
            const defaultHeight = 53.98; // mm
            const newRatio = newHeight / (defaultHeight * 3.7795275591); // Convert mm to pixels approximation
            
            // Constrain ratio within reasonable bounds
            const constrainedRatio = Math.max(0.5, Math.min(3.0, newRatio));
            
            this.setCalibrationRatio(constrainedRatio);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.saveCalibrationRatio();
            }
        });
    }

    adjustCalibrationPrecision(direction) {
        const step = CONFIG.precisionStep / 53.98; // Convert 0.1mm to ratio step
        let newRatio = this.calibrationRatio;

        if (direction === 'up') {
            newRatio += step;
        } else if (direction === 'down') {
            newRatio -= step;
        }

        // Constrain ratio
        newRatio = Math.max(0.5, Math.min(3.0, newRatio));
        
        this.setCalibrationRatio(newRatio);
        this.saveCalibrationRatio();
    }

    setCalibrationRatio(ratio) {
        this.calibrationRatio = ratio;
        document.documentElement.style.setProperty('--calibration-ratio', ratio);
        this.updateCalibrationDisplay();
        this.updateStoneSizes();
    }

    updateCalibrationDisplay() {
        const ratioDisplay = document.getElementById('calibration-ratio');
        if (ratioDisplay) {
            ratioDisplay.textContent = this.calibrationRatio.toFixed(6);
        }
    }

    resetCalibration() {
        this.setCalibrationRatio(CONFIG.sizing.defaultCalibrationRatio);
        this.saveCalibrationRatio();
    }

    loadCalibrationRatio() {
        const saved = localStorage.getItem(CONFIG.sizing.calibrationStorageKey);
        return saved ? parseFloat(saved) : CONFIG.sizing.defaultCalibrationRatio;
    }

    saveCalibrationRatio() {
        localStorage.setItem(CONFIG.sizing.calibrationStorageKey, this.calibrationRatio.toString());
    }

    // Stone Data Loading
    async loadStoneData() {
        try {
            await Promise.all([
                this.loadCenterStones(),
                this.loadSideStones()
            ]);
        } catch (error) {
            throw new Error('Failed to load stone data: ' + error.message);
        }
    }

    async loadCenterStones() {
        // Use embedded stone data (Wix compatible)
        const text = CONFIG.stoneData.centerStones;
        
        this.loadingCenterStones = true; // Flag to indicate we're loading center stones
        this.centerStones = this.parseStoneData(text);
        this.loadingCenterStones = false;
    }

    async loadSideStones() {
        // Use embedded stone data (Wix compatible)
        const text = CONFIG.stoneData.sideStones;
        
        this.loadingCenterStones = false; // Flag to indicate we're loading side stones
        this.sideStones = this.parseStoneData(text);
        
        // Image paths are now set directly from the URL mapping
        // No need to prepend asset folder path
    }

    parseStoneData(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const stones = [];

        lines.forEach((line, index) => {
            const [title, data] = line.split(':').map(s => s.trim());
            if (!title || !data) return;

            const [dimension, sizesStr] = data.split('|').map(s => s.trim());
            const sizes = sizesStr.split(',').map(s => parseFloat(s.trim()));

            // Calculate aspect ratio consistently as width/height
            const firstSize = sizes[0];
            let aspectRatio;
            
            // For center stones: dimension=width, sizes=heights, so aspectRatio = width/height
            // For side stones: dimension=height, sizes=widths, so aspectRatio = width/height  
            if (this.loadingCenterStones) {
                // Center stones: dimension is width, firstSize is height
                aspectRatio = parseFloat(dimension) / firstSize; // width/height
            } else {
                // Side stones: dimension is height, firstSize is width
                aspectRatio = firstSize / parseFloat(dimension); // width/height
            }

            stones.push({
                title,
                baseDimension: parseFloat(dimension), // width for center stones, height for side stones
                sizes,
                aspectRatio, // Always width/height ratio for consistency
                imagePath: this.generateImagePath(title)
            });
        });

        return stones;
    }

    generateImagePath(title) {
        // Use URL mapping for Wix compatibility
        return CONFIG.stoneImageUrls[title] || null;
    }

    // UI Rendering
    renderCenterStones() {
        const container = document.getElementById('center-stone-options');
        container.innerHTML = '';

        this.centerStones.forEach((stone, index) => {
            // Create wrapper for stone option with title
            const stoneWrapper = document.createElement('div');
            stoneWrapper.className = 'stone-wrapper';

            // Add stone title
            const titleElement = document.createElement('div');
            titleElement.className = 'stone-title';
            titleElement.textContent = stone.title;

            // Create stone option
            const option = document.createElement('div');
            option.className = 'stone-option';
            option.dataset.index = index;
            option.style.backgroundImage = `url('${stone.imagePath}')`;
            option.title = stone.title;

            option.addEventListener('click', () => {
                this.selectCenterStone(index);
            });

            stoneWrapper.appendChild(titleElement);
            stoneWrapper.appendChild(option);
            container.appendChild(stoneWrapper);
        });
    }

    selectCenterStone(index) {
        // Update UI selection
        document.querySelectorAll('.stone-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');

        this.selectedCenterStone = this.centerStones[index];
        this.renderCenterStoneSizes();
    }

    renderCenterStoneSizes() {
        const container = document.getElementById('center-stone-sizes');
        container.innerHTML = '';

        if (!this.selectedCenterStone) return;

        // Add "Available Sizes:" title
        const sizesTitle = document.createElement('h3');
        sizesTitle.textContent = 'Available Sizes:';
        sizesTitle.className = 'sizes-title';
        container.appendChild(sizesTitle);

        const sizeGrid = document.createElement('div');
        sizeGrid.className = 'size-grid';

        this.selectedCenterStone.sizes.forEach(size => {
            const sizeItem = document.createElement('div');
            sizeItem.className = 'size-item';
            sizeItem.dataset.size = size;

            const img = document.createElement('img');
            img.src = this.selectedCenterStone.imagePath;
            img.alt = `${size}mm`;
            
            // CENTER STONES: Calculate proportional dimensions
            // Format: "width | height1, height2, ..." 
            // size = height, calculate proportional width = height * aspectRatio
            const height = size; // This is the height from sizes array
            const width = height * this.selectedCenterStone.aspectRatio; // Calculate proportional width
            
            // Use CSS mm units with calibration
            img.style.width = `calc(${width}mm * var(--calibration-ratio))`;
            img.style.height = `calc(${height}mm * var(--calibration-ratio))`;

            const label = document.createElement('div');
            label.className = 'size-label';
            label.textContent = `${size}mm`;

            sizeItem.appendChild(img);
            sizeItem.appendChild(label);
            sizeGrid.appendChild(sizeItem);

            sizeItem.addEventListener('click', () => {
                this.selectCenterStoneSize(size);
            });
        });

        container.appendChild(sizeGrid);
        container.classList.add('visible');
    }

    selectCenterStoneSize(size) {
        // Update UI selection
        document.querySelectorAll('.size-item').forEach(item => item.classList.remove('selected'));
        document.querySelector(`[data-size="${size}"]`).classList.add('selected');

        this.selectedCenterStoneSize = size;
        this.renderDisplaySection();
    }

    renderDisplaySection() {
        const container = document.getElementById('display-section');
        container.innerHTML = '';

        if (!this.selectedCenterStone || !this.selectedCenterStoneSize) return;

        // Calculate center stone dimensions for gap calculation
        const centerStoneHeight = this.selectedCenterStoneSize;
        const centerStoneWidth = centerStoneHeight * this.selectedCenterStone.aspectRatio;

        // Create container for all sliders
        const slidersContainer = document.createElement('div');
        slidersContainer.className = 'sliders-container';

        this.sideStones.forEach((sideStone, index) => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'slider-wrapper';

            // Calculate the maximum space needed for this side stone type
            const maxSideStoneSize = Math.max(...sideStone.sizes); // Get largest size
            const sideStoneWidth = maxSideStoneSize; // This is the width from sizes array
            const sideStoneHeight = sideStoneWidth / sideStone.aspectRatio; // Calculate proportional height
            
            // When rotated -90deg: original width becomes display height, original height becomes display width
            const rotatedDisplayWidth = sideStoneHeight; // Original height becomes width after rotation
            
            // Calculate positioning based on actual code logic:
            // gapDistance = centerStoneWidth / 2
            // Left stone positioned at: right = 50% + gapDistance (extends leftward from that point)
            // Right stone positioned at: left = 50% + gapDistance (extends rightward from that point)
            const gapDistance = centerStoneWidth / 2;
            
            // Total width needed for stones:
            // From left edge to center: gapDistance + rotatedDisplayWidth 
            // Center stone width: centerStoneWidth
            // From center to right edge: gapDistance + rotatedDisplayWidth
            const stoneLayoutWidthMM = (gapDistance + rotatedDisplayWidth) + centerStoneWidth + (gapDistance + rotatedDisplayWidth);
            
            // Measure title width to ensure it doesn't wrap
            const titleWidthMM = this.measureTitleWidth(sideStone.title);
            
            // Use the maximum of stone layout width and title width
            const requiredWidthMM = Math.max(stoneLayoutWidthMM, titleWidthMM);
            
            // Add some padding to ensure no edge clipping
            const paddingMM = 2;
            const finalWidthMM = requiredWidthMM + paddingMM;
            
            // Set the wrapper width using CSS calc to account for calibration ratio
            sliderWrapper.style.width = `calc(${finalWidthMM}mm * var(--calibration-ratio))`;
            sliderWrapper.style.minWidth = `calc(${finalWidthMM}mm * var(--calibration-ratio))`;

            // Add side stone title
            const sliderTitle = document.createElement('h4');
            sliderTitle.className = 'slider-title';
            sliderTitle.textContent = sideStone.title;
            sliderWrapper.appendChild(sliderTitle);

            // Create slider container
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            // Create slider track
            const sliderTrack = document.createElement('div');
            sliderTrack.className = 'slider-track';

            // Calculate dynamic spacing between each pair of dots
            const defaultSpacing = 80;
            const titleSpace = 20; // Space for titles to be added later
            const gapBuffer = 10; // Small gap buffer
            const titleHeight = 25; // Height needed for the title text
            
            // Calculate total height needed and individual dot positions
            let currentTop = 0;
            const dotPositions = [];
            
            sideStone.sizes.forEach((size, sizeIndex) => {
                if (sizeIndex === 0) {
                    // First dot starts after some initial spacing (including title space)
                    currentTop = defaultSpacing + titleHeight;
                } else {
                    // Calculate spacing based on previous and current stone heights
                    const prevStoneHeight = sideStone.sizes[sizeIndex - 1]; // Previous stone width becomes height after rotation
                    const currentStoneHeight = size; // Current stone width becomes height after rotation
                    
                    // Convert mm to pixels for spacing calculation (approximate conversion for layout)
                    // Using calibration ratio and approximate mm-to-pixel conversion
                    const mmToPixelRatio = this.calibrationRatio * 3.7795275591; // Approximate mm to pixels conversion
                    const prevStoneHeightPx = prevStoneHeight * mmToPixelRatio;
                    const currentStoneHeightPx = currentStoneHeight * mmToPixelRatio;
                    
                    // Distance = half of previous stone + half of current stone + title space + gap + title height
                    const requiredSpacing = (prevStoneHeightPx / 2) + (currentStoneHeightPx / 2) + titleSpace + gapBuffer + titleHeight;
                    
                    // Use either the calculated spacing or default minimum, whichever is larger
                    const actualSpacing = Math.max(defaultSpacing + titleHeight, requiredSpacing);
                    
                    currentTop += actualSpacing;
                }
                
                dotPositions.push(currentTop);
            });
            
            // Set track height based on final position plus some padding
            const trackHeight = currentTop + defaultSpacing + 50; // Extra padding at bottom
            sliderTrack.style.height = `${trackHeight}px`;

            // Create dots for each size
            sideStone.sizes.forEach((size, sizeIndex) => {
                const dot = document.createElement('div');
                dot.className = 'slider-dot';
                dot.dataset.size = size;
                dot.dataset.sideStoneIndex = index;

                // Calculate side stone dimensions with PROPER proportions!
                // SIDE STONES: Calculate proportional dimensions
                // Format: "height | width1, width2, ..." 
                // size = width, calculate proportional height = width / aspectRatio
                const sideStoneWidth = size; // This is the width from sizes array (3.3, 4, 5.5, 6)
                const sideStoneHeight = sideStoneWidth / sideStone.aspectRatio; // Calculate proportional height

                // Position dots vertically with consistent spacing - align with rotated side stone center
                const dotPosition = dotPositions[sizeIndex];
                
                // Position the dot relative to the track
                dot.style.top = `${dotPosition}px`;

                // Create size title above the dot
                const sizeTitle = document.createElement('div');
                sizeTitle.className = 'side-stone-size-title';
                sizeTitle.textContent = `${size}mm`;
                sizeTitle.style.top = `${dotPosition - titleHeight}px`;
                sliderTrack.appendChild(sizeTitle);

                // Create side stone images on both sides
                const leftStoneContainer = document.createElement('div');
                leftStoneContainer.className = 'side-stone-container left';
                
                const rightStoneContainer = document.createElement('div');
                rightStoneContainer.className = 'side-stone-container right';

                const leftStone = document.createElement('img');
                leftStone.src = sideStone.imagePath;
                leftStone.className = 'side-stone';
                leftStone.alt = `${size}mm`;

                const rightStone = document.createElement('img');
                rightStone.src = sideStone.imagePath;
                rightStone.className = 'side-stone';
                rightStone.alt = `${size}mm`;

                const imageDisplayHeight = `calc(${sideStoneHeight}mm * var(--calibration-ratio))`; // Original height becomes width after rotation
                const imageDisplayWidth = `calc(${sideStoneWidth}mm * var(--calibration-ratio))`; // Original width becomes height after rotation
                
                // Apply size to the images themselves to maintain proper ratios
                leftStone.style.width = rightStone.style.width = imageDisplayWidth;
                leftStone.style.height = rightStone.style.height = imageDisplayHeight;
                
                // apply swapped dimensions for the image containers (thre image is being rotated 90 degrees)
                leftStoneContainer.style.width = rightStoneContainer.style.width = imageDisplayHeight;
                leftStoneContainer.style.height = rightStoneContainer.style.height = imageDisplayWidth;


                // Apply transformations to images using CSS classes instead of inline styles
                leftStone.classList.add('rotate-left');
                rightStone.classList.add('rotate-right');
                
                // Position side stone containers - gap = center stone width (simple calculation!)
                const gapDistance = `calc(${centerStoneWidth}mm * var(--calibration-ratio) / 2)`;
                leftStoneContainer.style.right = `calc(50% + ${gapDistance})`;
                rightStoneContainer.style.left = `calc(50% + ${gapDistance})`;

                leftStoneContainer.appendChild(leftStone);
                rightStoneContainer.appendChild(rightStone);

                dot.appendChild(leftStoneContainer);
                dot.appendChild(rightStoneContainer);
                sliderTrack.appendChild(dot);
            });

            // Create draggable center stone
            const centerStone = document.createElement('img');
            centerStone.src = this.selectedCenterStone.imagePath;
            centerStone.className = 'center-stone-slider';
            centerStone.alt = `${this.selectedCenterStoneSize}mm`;
            
            // Set center stone dimensions
            centerStone.style.width = `calc(${centerStoneWidth}mm * var(--calibration-ratio))`;
            centerStone.style.height = `calc(${centerStoneHeight}mm * var(--calibration-ratio))`;
        
            // Add drag functionality
            this.setupCenterStoneDrag(centerStone, sliderTrack);

            // Add click functionality to dots after center stone is created
            this.setupDotClickHandlers(sliderTrack, centerStone);

            sliderContainer.appendChild(sliderTrack);
            sliderContainer.appendChild(centerStone);
            sliderWrapper.appendChild(sliderContainer);
            slidersContainer.appendChild(sliderWrapper);
        });

        container.appendChild(slidersContainer);
        container.classList.add('visible');
    }

    setupCenterStoneDrag(centerStone, sliderTrack) {
        const titleHeight = 25; // Height needed for the title text (same as in renderDisplaySection)
        let isDragging = false;
        let startY = 0;
        let startTop = 0;

        centerStone.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startTop = parseInt(centerStone.style.top) || (titleHeight + 20); // Start below titles
            // Use CSS class for transition state
            centerStone.classList.add('dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - startY;
            const newTop = startTop + deltaY;

            // Calculate constraints more precisely
            const minTop = titleHeight + 10; // Keep center stone below titles with some buffer
            const maxTop = sliderTrack.offsetHeight - centerStone.offsetHeight + 20;

            // Constrain movement
            const constrainedTop = Math.max(minTop, Math.min(maxTop, newTop));
            centerStone.style.top = `${constrainedTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;

            // Improved snapping - find nearest dot center
            const dots = sliderTrack.querySelectorAll('.slider-dot');
            let nearestDot = null;
            let minDistance = Infinity;

            // Get center Y position of the dragged stone
            const stoneRect = centerStone.getBoundingClientRect();
            const stoneCenterY = stoneRect.top + stoneRect.height / 2;

            dots.forEach(dot => {
                const dotRect = dot.getBoundingClientRect();
                const dotCenterY = dotRect.top + dotRect.height / 2;
                const distance = Math.abs(dotCenterY - stoneCenterY);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestDot = dot;
                }
            });

            if (nearestDot && minDistance < 40) { // Snapping threshold
                // Calculate precise target position
                const trackRect = sliderTrack.getBoundingClientRect();
                const dotRect = nearestDot.getBoundingClientRect();
                
                // Get dot position relative to track
                const dotPositionInTrack = dotRect.top - trackRect.top;
                
                // Calculate target position that centers stone on dot
                const targetTop = dotPositionInTrack - (centerStone.offsetHeight / 2) + (nearestDot.offsetHeight / 2);
                
                // Ensure target position respects title area
                const constrainedTargetTop = Math.max(titleHeight + 10, targetTop);
                
                // Use CSS class for smooth snap animation
                centerStone.classList.remove('dragging');
                centerStone.classList.add('snapping');
                centerStone.style.top = `${constrainedTargetTop}px`;
                
                // Remove transition class after animation
                setTimeout(() => {
                    centerStone.classList.remove('snapping');
                }, 300);
            } else {
                // No snapping, just remove dragging state
                centerStone.classList.remove('dragging');
            }
        });
    }

    updateStoneSizes() {
        // Update all stone sizes when calibration changes
        const stoneImages = document.querySelectorAll('.size-item img, .center-stone-slider, .side-stone');
        // Sizes will update automatically due to CSS calc() with --calibration-ratio
    }

    // Event Listeners
    setupEventListeners() {
        // Check for existing admin session via admin module
        this.admin.checkExistingSession();
    }

    // Error Handling
    showError(message) {
        const container = document.getElementById('error-container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    measureTitleWidth(title) {
        // Create a temporary span element to measure text width
        const tempSpan = document.createElement('span');
        tempSpan.className = 'text-measurement'; // Use CSS class instead of inline styles
        tempSpan.textContent = title;
        
        // Add to DOM to measure
        document.body.appendChild(tempSpan);
        const widthPx = tempSpan.getBoundingClientRect().width;
        
        // Remove from DOM
        document.body.removeChild(tempSpan);
        
        // Convert pixels to millimeters
        // Using standard web DPI: 96 pixels per inch, 25.4mm per inch
        const widthMM = (widthPx * 25.4) / 96;
        
        return widthMM;
    }

    // Click-outside-to-close functionality
    setupCalibrationClickOutside() {
        this.calibrationClickOutsideHandler = (e) => {
            const panel = document.getElementById('calibration-panel');
            const toggle = document.getElementById('calibration-toggle');
            
            // Check if panel is open (not collapsed)
            if (!panel.classList.contains('collapsed')) {
                // Check if click is outside panel and toggle button
                if (!panel.contains(e.target) && !toggle.contains(e.target)) {
                    panel.classList.add('collapsed');
                }
            }
        };
        
        // Add listener with slight delay to avoid immediate triggering
        setTimeout(() => {
            document.addEventListener('click', this.calibrationClickOutsideHandler);
        }, 100);
    }

    setupDotClickHandlers(sliderTrack, centerStone) {
        const dots = sliderTrack.querySelectorAll('.slider-dot');
        const titleHeight = 25; // Height needed for the title text (same as in renderDisplaySection)
        
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                // Prevent any potential event bubbling
                e.stopPropagation();
                
                // Calculate target position to center the stone on the clicked dot
                const trackRect = sliderTrack.getBoundingClientRect();
                const dotRect = dot.getBoundingClientRect();
                
                // Get dot position relative to track
                const dotPositionInTrack = dotRect.top - trackRect.top;
                
                // Calculate target position that centers stone on dot
                const targetTop = dotPositionInTrack - (centerStone.offsetHeight / 2) + (dot.offsetHeight / 2);
                
                // Ensure target position respects title area
                const constrainedTargetTop = Math.max(titleHeight + 10, targetTop);
                
                // Apply smooth animation using the same CSS classes as drag snapping
                centerStone.classList.add('snapping');
                centerStone.style.top = `${constrainedTargetTop}px`;
                
                // Remove transition class after animation
                setTimeout(() => {
                    centerStone.classList.remove('snapping');
                }, 300);
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JewelryVisualizer();
}); 