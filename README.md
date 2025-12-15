# FM Screening Image Transformer

A web application that transforms parts of uploaded images into exaggerated black and white FM (Frequency Modulated) screening patterns.

## Features

- **Image Upload**: Upload any image file (JPEG, PNG, etc.)
- **Adaptive Sizing**: Dot size varies based on image brightness
  - Brighter areas = larger squares/circles
  - Darker areas = smaller, denser patterns
- **Adjustable Parameters**:
  - Min Dot Size: Smallest square size for dark areas (2-24px)
  - Max Dot Size: Largest square size for bright areas (4-48px)
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
4. Adjust contrast and threshold sliders to your preference
5. Either:
   - Click "Apply to Whole Image" to transform the entire image
   - Click and drag on the image to select a region, then click "Apply to Selection"
6. Click "Reset Image" to restore the original
7. Click "Download Result" to save your creation

**Tip**: Increase the difference between min and max sizes for more dramatic size variation!

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
1. Analyzing local brightness at each pixel position
2. Calculating adaptive cell size based on brightness (min to max range)
3. Sampling a small area around each position for smooth transitions
4. Converting to grayscale with adjustable contrast
5. Creating circular dots with radius proportional to darkness
6. Adding anti-aliasing for smooth, round circles
7. Using inverted background colors (dark dots on light background, light dots on dark background)
8. Adding slight randomness for the FM effect
9. Applying 5% spacing between dots for a cleaner look
10. Tracking processed pixels to ensure complete coverage

No external dependencies required - pure vanilla JavaScript!

