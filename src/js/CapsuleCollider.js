// Capsule Collider Class
class CapsuleCollider {
  constructor(start, end, radius) {
    this.start = start;
    this.end = end;
    this.radius = radius;
  }
  translate(offset) {
    this.start.add(offset);
    this.end.add(offset);
  }
}
export default CapsuleCollider;