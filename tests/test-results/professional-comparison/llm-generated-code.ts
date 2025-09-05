/**
 * Calculates the area of a circle given the radius
 * @param radius - The radius of the circle
 * @returns The area of the circle
 */
function calculateCircleArea(radius: number): number {
    if (radius <= 0) {
        throw new Error('Radius must be positive');
    }
    return Math.PI * radius * radius;
}