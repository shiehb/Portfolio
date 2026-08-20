// components/TransitionShapes.tsx
import React from 'react';

/**
 * Pixel Smiley Face Vector Data (160x160 coordinate space, center at 80,80)
 * 
 * Pixel Art Definition (16x16 grid, 10 units per block):
 * Solid filled pixel face with transparent background for Intro.
 * Inverted cutout mask with transparent hole for Outro.
 */

// Full solid pixel smiley face contour (160x160)
// Outer pixel circle contour
export const PIXEL_SMILEY_OUTER = 
  "M 50,0 H 110 V 10 H 130 V 20 H 140 V 30 H 150 V 50 H 160 V 110 H 150 V 130 H 140 V 140 H 130 V 150 H 110 V 160 H 50 V 150 H 30 V 140 H 20 V 130 H 10 V 110 H 0 V 50 H 10 V 30 H 20 V 20 H 30 V 10 H 50 Z";

// Left Eye cutout (20x20 pixel block)
export const PIXEL_SMILEY_LEFT_EYE = "M 40,40 H 60 V 60 H 40 Z";

// Right Eye cutout (20x20 pixel block)
export const PIXEL_SMILEY_RIGHT_EYE = "M 100,40 H 120 V 60 H 100 Z";

// Mouth cutout (Pixel smile arc)
export const PIXEL_SMILEY_MOUTH = 
  "M 30,80 H 50 V 100 H 60 V 110 H 100 V 100 H 110 V 80 H 130 V 100 H 120 V 110 H 110 V 120 H 50 V 110 H 40 V 100 H 30 Z";

// Giant outer bounding box to cover screens up to 8K resolution in all directions
export const GIANT_OUTER_FRAME = 
  "M -80000,-80000 L 80000,-80000 L 80000,80000 L -80000,80000 Z";

/**
 * Solid Filled Pixel Smiley:
 * Renders the pixel face with transparent eyes & mouth and transparent background.
 * Used for Intro: scales up to cover the screen with its solid fill.
 */
export function FilledPixelSmiley({
  color = "#fd551d",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`w-36 h-36 sm:w-48 sm:h-48 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ shapeRendering: 'crispEdges' }}
    >
      <path
        d={`${PIXEL_SMILEY_OUTER} ${PIXEL_SMILEY_LEFT_EYE} ${PIXEL_SMILEY_RIGHT_EYE} ${PIXEL_SMILEY_MOUTH}`}
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Inverted Cutout Pixel Smiley:
 * The outer screen is 100% solid filled, and the pixel smiley face in the center
 * is a 100% TRUE TRANSPARENT HOLE that reveals the page underneath.
 *
 * Used for Outro: as it scales up (scale 1 -> 40), the transparent smiley hole expands,
 * smoothly revealing the loaded page underneath.
 */
export function CutoutPixelSmiley({
  color = "#fd551d",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`w-full h-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', shapeRendering: 'crispEdges' }}
    >
      {/* 
        Giant outer frame + Outer face contour:
        In evenodd rule, Giant frame is fill(1), Outer face contour is hole(0).
        Then Left Eye, Right Eye, and Mouth are inside Outer face contour: in evenodd they become fill(1).
        This renders the outer screen solid, with the face silhouette transparent, and eye/mouth floating pixels!
      */}
      <path
        d={`${GIANT_OUTER_FRAME} ${PIXEL_SMILEY_OUTER} ${PIXEL_SMILEY_LEFT_EYE} ${PIXEL_SMILEY_RIGHT_EYE} ${PIXEL_SMILEY_MOUTH}`}
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
