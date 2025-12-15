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
const selectionOverlay = document.getElementById('selectionOverlay');
const dotSizeSlider = document.getElementById('dotSize');
const contrastSlider = document.getElementById('contrast');
const thresholdSlider = document.getElementById('threshold');
const dotSizeValue = document.getElementById('dotSizeValue');
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
    
    // Event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    dotSizeSlider.addEventListener('input', updateSliderValue);
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
    
    selectionStart.x = (e.clientX - rect.left) * scaleX;
    selectionStart.y = (e.clientY - rect.top) * scaleY;
    isSelecting = true;
}

function handleMouseMove(e) {
    if (!isSelecting) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    selectionEnd.x = (e.clientX - rect.left) * scaleX;
    selectionEnd.y = (e.clientY - rect.top) * scaleY;
    
    drawSelection();
}

function handleMouseUp(e) {
    if (!isSelecting) return;
    
    isSelecting = false;
    
    // Calculate selection rectangle
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    if (width > 5 && height > 5) {
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

// FM Screening effect
function applyFMScreening(wholeImage) {
    if (!currentImageData) return;
    
    const dotSize = parseInt(dotSizeSlider.value);
    const contrast = parseFloat(contrastSlider.value);
    const threshold = parseInt(thresholdSlider.value);
    
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
        region = selectionRect;
    }
    
    // Create a copy of current image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Apply FM screening to the region
    for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y += dotSize) {
        for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x += dotSize) {
            // Sample the center pixel of this dot area
            const sampleX = Math.min(x + Math.floor(dotSize / 2), canvas.width - 1);
            const sampleY = Math.min(y + Math.floor(dotSize / 2), canvas.height - 1);
            const idx = (sampleY * canvas.width + sampleX) * 4;
            
            // Calculate grayscale value
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Apply contrast adjustment
            let adjustedGray = ((gray - 128) * contrast) + 128;
            adjustedGray = Math.max(0, Math.min(255, adjustedGray));
            
            // Create FM screening pattern
            const dotRadius = calculateDotRadius(adjustedGray, dotSize, threshold);
            
            // Add subtle random variation for FM effect (calculated once per dot, not per pixel)
            const noiseAmount = (Math.random() - 0.5) * dotSize * 0.15;
            const effectiveRadius = dotRadius + noiseAmount;
            
            // Apply 5% spacing between dots by reducing effective radius
            const spacedRadius = effectiveRadius * 0.95;
            
            // Determine colors: if dot is dark (large), background is light, and vice versa
            // Use the brightness to determine: darker areas = larger dots = black dots on white bg
            const isDarkArea = adjustedGray < 128;
            const dotColor = isDarkArea ? 0 : 255;
            const bgColor = isDarkArea ? 255 : 0;
            
            // Calculate center of dot once
            const centerX = x + dotSize / 2;
            const centerY = y + dotSize / 2;
            
            // Fill the dot area with anti-aliasing
            for (let dy = 0; dy < dotSize && y + dy < canvas.height; dy++) {
                for (let dx = 0; dx < dotSize && x + dx < canvas.width; dx++) {
                    const px = x + dx;
                    const py = y + dy;
                    
                    if (px >= region.x && px < region.x + region.width &&
                        py >= region.y && py < region.y + region.height) {
                        
                        // Calculate distance from center of dot
                        const dist = Math.sqrt(
                            Math.pow(px + 0.5 - centerX, 2) + 
                            Math.pow(py + 0.5 - centerY, 2)
                        );
                        
                        const pixelIdx = (py * canvas.width + px) * 4;
                        
                        // Anti-aliasing: smooth transition at edge
                        const aaWidth = 0.8; // Width of anti-aliasing band
                        const diff = spacedRadius - dist;
                        
                        let value;
                        if (diff > aaWidth) {
                            // Fully inside dot
                            value = dotColor;
                        } else if (diff < 0) {
                            // Outside dot - background color
                            value = bgColor;
                        } else {
                            // Anti-aliased edge - interpolate between dot and background
                            const t = diff / aaWidth;
                            value = Math.round(bgColor + (dotColor - bgColor) * t);
                        }
                        
                        data[pixelIdx] = value;
                        data[pixelIdx + 1] = value;
                        data[pixelIdx + 2] = value;
                        data[pixelIdx + 3] = 255; // Alpha
                    }
                }
            }
        }
    }
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
    currentImageData = imageData;
    
    clearSelection();
}

function calculateDotRadius(gray, dotSize, threshold) {
    // Invert gray value (darker = larger dot)
    const inverted = 255 - gray;
    
    // Adjust based on threshold
    const adjusted = inverted > threshold ? inverted : inverted * 0.5;
    
    // Calculate radius (0 to half the dot size)
    const maxRadius = dotSize / 2;
    return (adjusted / 255) * maxRadius;
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

