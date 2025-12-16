# Changelog

All notable changes to the FM Screening Image Transformer project will be documented in this file.

## [1.1.0] - 2025-12-16

### Changed
- **Complexity-based sizing algorithm**: Now uses variance/standard deviation instead of brightness
- Flat, uniform areas get **much larger squares** (like solid color blocks in the reference image)
- Detailed, complex areas get **tiny dots** for better detail preservation
- More dramatic size variation across the image
- Power curve applied (0.7 exponent) for even more pronounced size differences

### Technical Details
- Calculates standard deviation of grayscale values within each potential square
- Low variance (flat areas) = high simplicity = large squares
- High variance (edges, details) = high complexity = small squares
- Normalized stdDev range: 0-40 typical, mapped to 0-1 complexity scale

## [1.0.0] - 2025-12-15

### Added
- Grid-based adaptive FM screening algorithm
- Perfect tiling system with no gaps or overlaps
- Min and max dot size sliders for controlling size variation
- All squares are exact multiples of base size (min dot size)
- Two-pass algorithm: places larger squares in bright areas, fills gaps with base size
- Anti-aliased circles for smooth, round appearance
- Inverted backgrounds (dark dots on light squares, light dots on dark squares)
- 5% spacing between dots for cleaner look
- Region selection with mouse drag
- Apply to whole image or selected region
- Image upload and download functionality
- Reset to original image
- Modern gradient UI with responsive controls
- Version number display in header

### Technical Details
- Base grid unit determined by minimum dot size
- Brightness-based adaptive sizing (brighter = larger squares)
- Grid tracking prevents overlaps
- Complete pixel coverage guaranteed
- Pure vanilla JavaScript, no dependencies

