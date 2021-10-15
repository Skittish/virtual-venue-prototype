export const circleIntersects = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {
    if (r1 <= 0 || r2 <= 0) return false
    const dist = Math.hypot(x2 - x1, y2 - y1);
    return dist <= r1 + r2 ? true : false;
}