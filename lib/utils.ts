import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// This is a standard utility function from shadcn/ui
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- NEW CODE STARTS HERE ---

/**
 * Represents a 2D or 3D point from MediaPipe landmarks.
 */
interface Point {
  x: number;
  y: number;
  z?: number; // z is optional as we'll primarily use x and y for 2D angle
  visibility?: number;
}

/**
 * Calculates the angle between three points.
 * @param p1 The first point (e.g., shoulder).
 * @param p2 The vertex point where the angle is measured (e.g., hip).
 * @param p3 The third point (e.g., knee).
 * @returns The angle in degrees, between 0 and 180.
 */
export function calculateAngle(p1: Point, p2: Point, p3: Point): number {
  // Check if any point is null or undefined
  if (!p1 || !p2 || !p3) {
    return 0;
  }
  
  // Calculate vectors from the vertex (p2) to the other points
  const vector1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Calculate the dot product of the two vectors
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // Calculate the magnitude (length) of each vector
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
  
  // Check for zero magnitude to avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  // Calculate the cosine of the angle using the dot product formula
  const cosTheta = dotProduct / (magnitude1 * magnitude2);

  // Clamp the value to the range [-1, 1] to prevent Math.acos errors
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  // Calculate the angle in radians
  const angleRad = Math.acos(clampedCosTheta);

  // Convert the angle to degrees
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}