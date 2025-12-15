# FM Screening Image Transformer

A web application that transforms parts of uploaded images into exaggerated black and white FM (Frequency Modulated) screening patterns.

## Features

- **Image Upload**: Upload any image file (JPEG, PNG, etc.)
- **Adjustable Parameters**:
  - Dot Size: Control the size of halftone dots (2-12px)
  - Contrast: Adjust the contrast of the effect (0.5-3.0)
  - Threshold: Set the threshold for black/white conversion (0-255)
- **Selective Application**: 
  - Apply the effect to the entire image
  - Select specific regions by clicking and dragging
  - Apply the effect only to selected areas
- **Modern UI**: Beautiful gradient design with responsive controls
- **Download**: Save your transformed images

## How to Use

1. Open `index.html` in a web browser
2. Click "Choose Image" to upload an image
3. Adjust the dot size, contrast, and threshold sliders to your preference
4. Either:
   - Click "Apply to Whole Image" to transform the entire image
   - Click and drag on the image to select a region, then click "Apply to Selection"
5. Click "Reset Image" to restore the original
6. Click "Download Result" to save your creation

## FM Screening Effect

FM (Frequency Modulated) screening is a halftone technique where:
- Darker areas have larger/denser dots
- Lighter areas have smaller/sparser dots
- Creates a distinctive retro printing effect
- The exaggerated version creates a bold, artistic look

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and responsive design
- `script.js` - Image processing and FM screening algorithm

## Technical Details

The FM screening effect works by:
1. Dividing the image into a grid based on dot size
2. Sampling the brightness of each grid cell
3. Converting to grayscale with adjustable contrast
4. Creating circular dots with radius proportional to darkness
5. Adding slight randomness for the FM effect
6. Rendering in pure black and white for maximum contrast

No external dependencies required - pure vanilla JavaScript!

