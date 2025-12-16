# FM Screening Image Transformer

A web application that transforms parts of uploaded images into exaggerated black and white FM (Frequency Modulated) screening patterns.

## Features

- **Image Upload**: Upload any image file (JPEG, PNG, etc.)
- **Adaptive Sizing**: Dot size varies based on image complexity
  - Flat, uniform areas = larger squares/circles
  - Detailed, complex areas = smaller, denser patterns
- **Adjustable Parameters**:
  - Min Dot Size: Smallest square size for dark areas (2-24px)
  - Max Dot Size: Largest square size for bright areas (4-48px)
  - Spacing: Control the gap between dots (0-50%, default 5%)
  - Contrast: Adjust the contrast of the effect (0.5-3.0)
  - Threshold: Set the threshold for black/white conversion (0-255)
- **Inverted Backgrounds**: Each square has the opposite color of its circle
- **Anti-aliased Circles**: Smooth, round circles with proper anti-aliasing
- **Selective Application**: 
  - Apply the effect to the entire image
  - Select specific regions by clicking and dragging
  - Apply the effect only to selected areas
- **Modern UI**: Beautiful gradient design with responsive controls
- **Download**: Save your transformed images

## How to Use

1. Open `index.html` in a web browser
2. Click "Choose Image" to upload an image
3. Adjust the min/max dot size sliders to control size variation
4. Adjust spacing slider to control the gap between dots (0% = tight, 50% = very airy)
5. Adjust contrast and threshold sliders to your preference
6. Either:
   - Click "Apply to Whole Image" to transform the entire image
   - Click and drag on the image to select a region, then click "Apply to Selection"
7. Click "Reset Image" to restore the original
8. Click "Download Result" to save your creation

**Tips**: 
- Increase the difference between min and max sizes for more dramatic size variation!
- Lower spacing (0-5%) for a denser, bolder effect
- Higher spacing (20-50%) for a lighter, airier appearance

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

The adaptive FM screening effect works by:
1. Analyzing local complexity (variance) at each grid position
2. Calculating adaptive cell size based on simplicity (low variance = large squares)
3. Using standard deviation to measure detail vs flatness
4. Converting to grayscale with adjustable contrast
5. Creating circular dots with radius proportional to darkness
6. Adding anti-aliasing for smooth, round circles
7. Using inverted background colors (dark dots on light background, light dots on dark background)
8. Adding slight randomness for the FM effect
9. Applying configurable spacing (0-50%) between dots
10. Two-pass algorithm: large squares in flat areas, base size fills gaps
11. Tracking processed pixels to ensure complete coverage

The complexity-based algorithm creates dramatic size variation: solid color blocks get very large squares while detailed areas get tiny, dense dots.

No external dependencies required - pure vanilla JavaScript!

