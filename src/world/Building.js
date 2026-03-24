import * as THREE from 'three';

export class Building {
  constructor(scene, { position, size, color }) {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(position.x, size.y / 2, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // AABB for collision
    this.aabb = {
      min: new THREE.Vector3(
        position.x - size.x / 2,
        0,
        position.z - size.z / 2
      ),
      max: new THREE.Vector3(
        position.x + size.x / 2,
        size.y,
        position.z + size.z / 2
      ),
    };
  }
}
