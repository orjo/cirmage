// Version
const VERSION = "1.2.1";

// Global variables
let canvas, ctx;
let originalImage = null;
let currentImageData = null;
let isSelecting = false;
let selectionStart = { x: 0, y: 0 };
let selectionEnd = { x: 0, y: 0 };
let selectionRect = null;

// DOM elements
const imageUpload = document.getElementById('imageUpload');
const canvasElement = document.getElementById('canvas');
const canvasContainer = document.querySelector('.canvas-container');
const selectionOverlay = document.getElementById('selectionOverlay');
const minDotSizeSlider = document.getElementById('minDotSize');
const maxDotSizeSlider = document.getElementById('maxDotSize');
const spacingSlider = document.getElementById('spacing');
const contrastSlider = document.getElementById('contrast');
const thresholdSlider = document.getElementById('threshold');
const minDotSizeValue = document.getElementById('minDotSizeValue');
const maxDotSizeValue = document.getElementById('maxDotSizeValue');
const spacingValue = document.getElementById('spacingValue');
const contrastValue = document.getElementById('contrastValue');
const thresholdValue = document.getElementById('thresholdValue');
const applyWholeBtn = document.getElementById('applyWholeBtn');
const applySelectionBtn = document.getElementById('applySelectionBtn');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize
function init() {
    canvas = canvasElement;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Display version
    document.getElementById('version').textContent = `v${VERSION}`;
    
    // Event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    // Attach mousedown to canvas container so we can start selection anywhere
    canvasContainer.addEventListener('mousedown', handleMouseDown);
    // Use document-level listeners for move and up to track outside canvas
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    minDotSizeSlider.addEventListener('input', updateSliderValue);
    maxDotSizeSlider.addEventListener('input', updateSliderValue);
    spacingSlider.addEventListener('input', updateSliderValue);
    contrastSlider.addEventListener('input', updateSliderValue);
    thresholdSlider.addEventListener('input', updateSliderValue);
    
    applyWholeBtn.addEventListener('click', () => applyFMScreening(true));
    applySelectionBtn.addEventListener('click', () => applyFMScreening(false));
    clearSelectionBtn.addEventListener('click', clearSelection);
    resetBtn.addEventListener('click', resetImage);
    downloadBtn.addEventListener('click', downloadImage);
    
    // Disable buttons initially
    updateButtonStates();
}

// Update slider value displays
function updateSliderValue(e) {
    const slider = e.target;
    const valueDisplay = document.getElementById(slider.id + 'Value');
    valueDisplay.textContent = slider.value;
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Set canvas size to image size (with max width)
            const maxWidth = 1000;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Store original image
            originalImage = ctx.getImageData(0, 0, width, height);
            currentImageData = ctx.getImageData(0, 0, width, height);
            
            updateButtonStates();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Mouse event handlers for selection
function handleMouseDown(e) {
    if (!originalImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Allow selection to start outside canvas bounds
    selectionStart.x = (e.clientX - rect.left) * scaleX;
    selectionStart.y = (e.clientY - rect.top) * scaleY;
    isSelecting = true;
}

function handleMouseMove(e) {
    if (!isSelecting) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Allow selection to extend outside canvas bounds
    selectionEnd.x = (e.clientX - rect.left) * scaleX;
    selectionEnd.y = (e.clientY - rect.top) * scaleY;
    
    drawSelection();
}

function handleMouseUp(e) {
    if (!isSelecting) return;
    
    isSelecting = false;
    
    // Calculate selection rectangle (can be outside canvas bounds)
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    if (width > 5 && height > 5) {
        // Store the raw selection (may extend beyond canvas)
        selectionRect = { x, y, width, height };
        updateButtonStates();
    } else {
        clearSelection();
    }
}

function drawSelection() {
    const rect = canvas.getBoundingClientRect();
    const containerRect = canvas.parentElement.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    const x = Math.min(selectionStart.x, selectionEnd.x) * scaleX;
    const y = Math.min(selectionStart.y, selectionEnd.y) * scaleY;
    const width = Math.abs(selectionEnd.x - selectionStart.x) * scaleX;
    const height = Math.abs(selectionEnd.y - selectionStart.y) * scaleY;
    
    // Position relative to canvas position within container
    const canvasOffsetX = rect.left - containerRect.left;
    const canvasOffsetY = rect.top - containerRect.top;
    
    selectionOverlay.style.left = `${x + canvasOffsetX}px`;
    selectionOverlay.style.top = `${y + canvasOffsetY}px`;
    selectionOverlay.style.width = `${width}px`;
    selectionOverlay.style.height = `${height}px`;
    selectionOverlay.style.display = 'block';
}

function clearSelection() {
    selectionRect = null;
    selectionOverlay.style.display = 'none';
    updateButtonStates();
}

// FM Screening effect with aligned grid-based adaptive sizing
function applyFMScreening(wholeImage) {
    if (!currentImageData) return;
    
    const minDotSize = parseInt(minDotSizeSlider.value);
    const maxDotSize = parseInt(maxDotSizeSlider.value);
    const spacingPercent = parseInt(spacingSlider.value);
    const contrast = parseFloat(contrastSlider.value);
    const threshold = parseInt(thresholdSlider.value);
    
    // Ensure min is not greater than max
    const baseSize = Math.min(minDotSize, maxDotSize);
    const maxSize = Math.max(minDotSize, maxDotSize);
    
    // Get region to apply effect to
    let region;
    if (wholeImage || !selectionRect) {
        region = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        };
    } else {
        // Clip selection to canvas bounds (selection may extend outside)
        const x1 = Math.max(0, selectionRect.x);
        const y1 = Math.max(0, selectionRect.y);
        const x2 = Math.min(canvas.width, selectionRect.x + selectionRect.width);
        const y2 = Math.min(canvas.height, selectionRect.y + selectionRect.height);
        
        region = {
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1
        };
    }
    
    // Create a copy of current image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create grid to track occupied cells (using base size as unit)
    const gridWidth = Math.ceil(canvas.width / baseSize);
    const gridHeight = Math.ceil(canvas.height / baseSize);
    const grid = new Uint8Array(gridWidth * gridHeight);
    
    // Calculate possible sizes (must be multiples of baseSize)
    const possibleSizes = [];
    for (let mult = 1; mult * baseSize <= maxSize; mult++) {
        possibleSizes.push(mult * baseSize);
    }
    possibleSizes.sort((a, b) => b - a); // Process largest first
    
    // First pass: try to place larger squares based on complexity (variance)
    for (let i = 0; i < possibleSizes.length - 1; i++) {
        const dotSize = possibleSizes[i];
        const cellsPerDot = dotSize / baseSize;
        
        // Scan grid aligned to dotSize
        for (let gy = 0; gy < gridHeight; gy += cellsPerDot) {
            for (let gx = 0; gx < gridWidth; gx += cellsPerDot) {
                // Check if this grid area is already occupied
                let occupied = false;
                for (let dy = 0; dy < cellsPerDot && gy + dy < gridHeight; dy++) {
                    for (let dx = 0; dx < cellsPerDot && gx + dx < gridWidth; dx++) {
                        if (grid[(gy + dy) * gridWidth + (gx + dx)]) {
                            occupied = true;
                            break;
                        }
                    }
                    if (occupied) break;
                }
                
                if (occupied) continue;
                
                // Calculate pixel position
                const x = gx * baseSize;
                const y = gy * baseSize;
                
                // Check if within region
                if (x >= region.x && y >= region.y &&
                    x < region.x + region.width && y < region.y + region.height) {
                    
                    // Sample the area to calculate variance (complexity)
                    let sumGray = 0;
                    let sumSquared = 0;
                    let count = 0;
                    const sampleStep = Math.max(1, Math.floor(dotSize / 6));
                    
                    for (let sy = 0; sy < dotSize && y + sy < canvas.height; sy += sampleStep) {
                        for (let sx = 0; sx < dotSize && x + sx < canvas.width; sx += sampleStep) {
                            const px = Math.min(x + sx, canvas.width - 1);
                            const py = Math.min(y + sy, canvas.height - 1);
                            const idx = (py * canvas.width + px) * 4;
                            
                            const r = data[idx];
                            const g = data[idx + 1];
                            const b = data[idx + 2];
                            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                            sumGray += gray;
                            sumSquared += gray * gray;
                            count++;
                        }
                    }
                    
                    const avgGray = sumGray / count;
                    
                    // Calculate variance (measure of complexity/detail)
                    const variance = (sumSquared / count) - (avgGray * avgGray);
                    const stdDev = Math.sqrt(Math.max(0, variance));
                    
                    // Normalize variance to 0-1 range (typical stdDev is 0-50 for varied areas)
                    const complexity = Math.min(1, stdDev / 40);
                    
                    // Low complexity (flat areas) = large squares
                    // High complexity (detailed areas) = small squares
                    const simplicity = 1 - complexity;
                    
                    // Apply contrast adjustment to average gray
                    let adjustedGray = ((avgGray - 128) * contrast) + 128;
                    adjustedGray = Math.max(0, Math.min(255, adjustedGray));
                    
                    // Calculate ideal size based on simplicity (flat areas get bigger)
                    const idealSize = baseSize + (maxSize - baseSize) * Math.pow(simplicity, 0.7);
                    
                    // Only place this size if it matches the ideal size for this complexity
                    if (idealSize >= dotSize * 0.75) {
                        drawSquareWithDot(data, grid, gridWidth, x, y, dotSize, cellsPerDot, 
                                        adjustedGray, threshold, region, gy, gx, gridHeight, spacingPercent, baseSize);
                    }
                }
            }
        }
    }
    
    // Second pass: fill all remaining gaps with base size squares
    const baseSquareSize = baseSize;
    for (let gy = 0; gy < gridHeight; gy++) {
        for (let gx = 0; gx < gridWidth; gx++) {
            // Skip if already occupied
            if (grid[gy * gridWidth + gx]) continue;
            
            // Calculate pixel position
            const x = gx * baseSize;
            const y = gy * baseSize;
            
            // Check if within region
            if (x >= region.x && y >= region.y &&
                x < region.x + region.width && y < region.y + region.height) {
                
                // Sample the area
                let sumGray = 0;
                let count = 0;
                
                for (let sy = 0; sy < baseSquareSize && y + sy < canvas.height; sy++) {
                    for (let sx = 0; sx < baseSquareSize && x + sx < canvas.width; sx++) {
                        const px = Math.min(x + sx, canvas.width - 1);
                        const py = Math.min(y + sy, canvas.height - 1);
                        const idx = (py * canvas.width + px) * 4;
                        
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                        sumGray += gray;
                        count++;
                    }
                }
                
                const avgGray = sumGray / count;
                let adjustedGray = ((avgGray - 128) * contrast) + 128;
                adjustedGray = Math.max(0, Math.min(255, adjustedGray));
                
                drawSquareWithDot(data, grid, gridWidth, x, y, baseSquareSize, 1, 
                                adjustedGray, threshold, region, gy, gx, gridHeight, spacingPercent, baseSize);
            }
        }
    }
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
    currentImageData = imageData;
    
    clearSelection();
}

// Helper function to draw a square with a dot
function drawSquareWithDot(data, grid, gridWidth, x, y, dotSize, cellsPerDot, 
                           adjustedGray, threshold, region, gy, gx, gridHeight, spacingPercent, minDotSize) {
    // Mark grid cells as occupied
    for (let dy = 0; dy < cellsPerDot && gy + dy < gridHeight; dy++) {
        for (let dx = 0; dx < cellsPerDot && gx + dx < gridWidth; dx++) {
            grid[(gy + dy) * gridWidth + (gx + dx)] = 1;
        }
    }
    
    // Create FM screening pattern
    const dotRadius = calculateDotRadius(adjustedGray, dotSize, threshold, minDotSize);
    
    // Add subtle random variation
    const noiseAmount = (Math.random() - 0.5) * dotSize * 0.15;
    const effectiveRadius = dotRadius + noiseAmount;
    // Apply spacing: convert percentage to multiplier (5% = 0.95, 10% = 0.90, etc.)
    const spacedRadius = effectiveRadius * (1 - spacingPercent / 100);
    
    // Determine colors
    const isDarkArea = adjustedGray < 128;
    const dotColor = isDarkArea ? 0 : 255;
    const bgColor = isDarkArea ? 255 : 0;
    
    // Calculate center of dot
    const centerX = x + dotSize / 2;
    const centerY = y + dotSize / 2;
    
    const canvas = document.getElementById('canvas');
    
    // Fill the dot area with anti-aliasing
    for (let dy = 0; dy < dotSize && y + dy < canvas.height; dy++) {
        for (let dx = 0; dx < dotSize && x + dx < canvas.width; dx++) {
            const px = x + dx;
            const py = y + dy;
            
            if (px >= region.x && px < region.x + region.width &&
                py >= region.y && py < region.y + region.height) {
                
                const dist = Math.sqrt(
                    Math.pow(px + 0.5 - centerX, 2) + 
                    Math.pow(py + 0.5 - centerY, 2)
                );
                
                const pixelIdx = (py * canvas.width + px) * 4;
                
                const aaWidth = 0.8;
                const diff = spacedRadius - dist;
                
                let value;
                if (diff > aaWidth) {
                    value = dotColor;
                } else if (diff < 0) {
                    value = bgColor;
                } else {
                    const t = diff / aaWidth;
                    value = Math.round(bgColor + (dotColor - bgColor) * t);
                }
                
                data[pixelIdx] = value;
                data[pixelIdx + 1] = value;
                data[pixelIdx + 2] = value;
                data[pixelIdx + 3] = 255;
            }
        }
    }
}

function calculateDotRadius(gray, dotSize, threshold, minDotSize) {
    // Invert gray value (darker = larger dot)
    const inverted = 255 - gray;
    
    // Adjust based on threshold
    const adjusted = inverted > threshold ? inverted : inverted * 0.5;
    
    // Calculate radius with constraints to ensure both dot and background are visible
    // Minimum radius: 15% of square (ensures dot is always visible)
    // Maximum radius: 42% of square (ensures background is always visible)
    const minRadius = Math.max(dotSize * 0.15, minDotSize * 0.3);
    const maxRadius = dotSize * 0.42;
    
    // Map adjusted value to the constrained radius range
    const t = adjusted / 255;
    return minRadius + (maxRadius - minRadius) * t;
}

// Reset to original image
function resetImage() {
    if (!originalImage) return;
    
    ctx.putImageData(originalImage, 0, 0);
    currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    clearSelection();
}

// Download image
function downloadImage() {
    if (!currentImageData) return;
    
    const link = document.createElement('a');
    link.download = 'fm-screening-result.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Update button states
function updateButtonStates() {
    const hasImage = originalImage !== null;
    const hasSelection = selectionRect !== null;
    
    applyWholeBtn.disabled = !hasImage;
    applySelectionBtn.disabled = !hasImage || !hasSelection;
    clearSelectionBtn.disabled = !hasSelection;
    resetBtn.disabled = !hasImage;
    downloadBtn.disabled = !hasImage;
}

// Initialize on page load
init();


