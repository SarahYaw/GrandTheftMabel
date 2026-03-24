import * as THREE from 'three';

export class TopDownCamera {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.height = 35;
    this.behindDistance = 12; // how far behind Mabel the camera sits
    this.followSpeed = 5;
    this.rotationSpeed = 5;
    this.target = new THREE.Vector3();
    this.targetRotation = 0; // Mabel's facing angle
    this.currentRotation = 0;

    this.camera.position.set(0, this.height, this.behindDistance);
    this.camera.lookAt(0, 0, 0);
  }

  setTarget(targetPosition) {
    this.target = targetPosition;
  }

  setTargetRotation(rotation) {
    this.targetRotation = rotation;
  }

  update(dt) {
    // Smoothly rotate to match Mabel's facing direction
    let rotDiff = this.targetRotation - this.currentRotation;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    this.currentRotation += rotDiff * (1 - Math.exp(-this.rotationSpeed * dt));

    // Position camera behind Mabel based on her rotation
    const offsetX = Math.sin(this.currentRotation) * this.behindDistance;
    const offsetZ = Math.cos(this.currentRotation) * this.behindDistance;

    const desiredX = this.target.x - offsetX;
    const desiredY = this.height;
    const desiredZ = this.target.z - offsetZ;

    const lerpFactor = 1 - Math.exp(-this.followSpeed * dt);
    this.camera.position.x += (desiredX - this.camera.position.x) * lerpFactor;
    this.camera.position.y += (desiredY - this.camera.position.y) * lerpFactor;
    this.camera.position.z += (desiredZ - this.camera.position.z) * lerpFactor;

    this.camera.lookAt(this.target.x, 0, this.target.z);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
