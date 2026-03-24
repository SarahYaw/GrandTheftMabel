import * as THREE from 'three';

const ITEM_TYPES = [
  { name: 'Shoe', color: 0x8B4513, size: [0.3, 0.2, 0.4], points: 1 },
  { name: 'Steak', color: 0xCC3333, size: [0.4, 0.1, 0.3], points: 3 },
  { name: 'Newspaper', color: 0xEEEEDD, size: [0.35, 0.05, 0.5], points: 1 },
  { name: 'Tennis Ball', color: 0xCCFF00, size: [0.2, 0.2, 0.2], points: 1 },
  { name: 'Pizza Slice', color: 0xFFCC00, size: [0.35, 0.08, 0.4], points: 2 },
  { name: 'Sock', color: 0xFFFFFF, size: [0.15, 0.1, 0.35], points: 1 },
  { name: 'TV Remote', color: 0x222222, size: [0.12, 0.08, 0.4], points: 2 },
  { name: 'Sandwich', color: 0xDEB887, size: [0.3, 0.15, 0.3], points: 2 },
];

export class StealableItem {
  constructor(scene, position, typeIndex) {
    const type = ITEM_TYPES[typeIndex % ITEM_TYPES.length];
    this.name = type.name;
    this.points = type.points;
    this.stolen = false;

    const geo = new THREE.BoxGeometry(...type.size);
    const mat = new THREE.MeshStandardMaterial({ color: type.color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(position.x, type.size[1] / 2 + 0.01, position.z);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.position = this.mesh.position;
    this.interactionRadius = 2;
  }

  steal(scene) {
    this.stolen = true;
    scene.remove(this.mesh);

    // Return a clone mesh for Mabel to carry
    const carriedMesh = this.mesh.clone();
    return carriedMesh;
  }
}
