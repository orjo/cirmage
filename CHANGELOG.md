# Changelog

All notable changes to the FM Screening Image Transformer project will be documented in this file.

## [1.2.2] - 2025-12-16

### Added
- **Reset Settings button**: Quickly restore all sliders to their default values
  - Min Dot Size: 4px
  - Max Dot Size: 24px
  - Spacing: 5%
  - Contrast: 1.5
  - Threshold: 128

## [1.2.1] - 2025-12-16

### Fixed
- **Dot size constraints**: Both dots and backgrounds now respect min/max size settings
  - Minimum dot radius: 15% of square size (ensures dots are always visible)
  - Maximum dot radius: 42% of square size (ensures backgrounds are always visible)
  - Fixes issue where very dark areas had invisible white backgrounds
  - Fixes issue where very light areas had invisible dots

## [1.2.0] - 2025-12-16

### Added
- **Spacing slider**: New control for adjusting spacing between dots
  - Range: 0% to 50%
  - Default: 5%
  - Allows for very tight packing (0%) or very airy effects (50%)
  - Independent control over the visual density of the pattern

## [1.1.1] - 2025-12-16

### Improved
- **Free selection rectangle**: Can now start selection outside the canvas and drag in, or start inside and drag out
- Selection overlay shows the full rectangle wherever you drag
- Effect is automatically clipped to canvas bounds when applied
- Document-level mouse tracking for smooth selection beyond canvas edges

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

