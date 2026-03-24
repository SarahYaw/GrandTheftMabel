import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.staticColliders = []; // { min: Vector3, max: Vector3 }
  }

  addStatic(aabb) {
    this.staticColliders.push(aabb);
  }

  resolve(mabel) {
    const mabelAABB = mabel.getAABB();

    for (const collider of this.staticColliders) {
      // Check overlap
      if (
        mabelAABB.min.x < collider.max.x &&
        mabelAABB.max.x > collider.min.x &&
        mabelAABB.min.z < collider.max.z &&
        mabelAABB.max.z > collider.min.z
      ) {
        // Find minimum penetration axis
        const overlapLeft = mabelAABB.max.x - collider.min.x;
        const overlapRight = collider.max.x - mabelAABB.min.x;
        const overlapFront = mabelAABB.max.z - collider.min.z;
        const overlapBack = collider.max.z - mabelAABB.min.z;

        const minOverlapX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
        const minOverlapZ = overlapFront < overlapBack ? -overlapFront : overlapBack;

        // Push out along the axis with the smallest penetration
        if (Math.abs(minOverlapX) < Math.abs(minOverlapZ)) {
          mabel.position.x += minOverlapX;
        } else {
          mabel.position.z += minOverlapZ;
        }
      }
    }
  }

  checkOverlap(aabbA, aabbB) {
    return (
      aabbA.min.x < aabbB.max.x &&
      aabbA.max.x > aabbB.min.x &&
      aabbA.min.z < aabbB.max.z &&
      aabbA.max.z > aabbB.min.z
    );
  }

  distance2D(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}
