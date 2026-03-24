import * as THREE from 'three';

export class Mabel {
  constructor(scene) {
    this.speed = 10;
    this.carrying = null;
    this.score = 0;
    this.carriedMesh = null;

    this.group = new THREE.Group();

    // Body - chunky golden rectangle
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.7, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDAA520 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    this.group.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xDAA520 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.75, 0.55);
    head.castShadow = true;
    this.group.add(head);
    this.head = head;

    // Nose (small dark box on the head)
    const noseGeo = new THREE.BoxGeometry(0.15, 0.12, 0.1);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.7, 0.85);
    this.group.add(nose);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.13, 0.85, 0.78);
    this.group.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.13, 0.85, 0.78);
    this.group.add(eyeR);

    // Legs (4 stubby boxes)
    const legGeo = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xC8961E });
    const legPositions = [
      [-0.35, 0.2, -0.2],
      [0.35, 0.2, -0.2],
      [-0.35, 0.2, 0.2],
      [0.35, 0.2, 0.2],
    ];
    for (const [x, y, z] of legPositions) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Tail - small cylinder sticking out the back
    const tailGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.5, 6);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xDAA520 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.8, -0.55);
    tail.rotation.x = 0.5;
    this.group.add(tail);
    this.tail = tail;
    this.tailTime = 0;

    scene.add(this.group);

    // Movement direction for smooth rotation
    this.direction = new THREE.Vector3();
    this.turnSpeed = 4; // radians per second

    // Collision half-extents
    this.halfExtents = new THREE.Vector3(0.6, 0.5, 0.5);

    // Jump state
    this.velocityY = 0;
    this.grounded = true;
    this.jumpForce = 8;
    this.gravity = 20;
  }

  get position() {
    return this.group.position;
  }

  getAABB() {
    return {
      min: new THREE.Vector3(
        this.group.position.x - this.halfExtents.x,
        this.group.position.y,
        this.group.position.z - this.halfExtents.z
      ),
      max: new THREE.Vector3(
        this.group.position.x + this.halfExtents.x,
        this.group.position.y + this.halfExtents.y * 2,
        this.group.position.z + this.halfExtents.z
      ),
    };
  }

  update(dt, input) {
    // A/D rotate Mabel
    if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) {
      this.group.rotation.y += this.turnSpeed * dt;
    }
    if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) {
      this.group.rotation.y -= this.turnSpeed * dt;
    }

    // W/S move forward/backward relative to facing direction
    let moveSpeed = 0;
    if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) moveSpeed = this.speed;
    if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) moveSpeed = -this.speed * 0.5;

    if (moveSpeed !== 0) {
      const angle = this.group.rotation.y;
      this.group.position.x += Math.sin(angle) * moveSpeed * dt;
      this.group.position.z += Math.cos(angle) * moveSpeed * dt;
    }

    // Jump
    if (input.isKeyJustPressed('Space') && this.grounded) {
      this.velocityY = this.jumpForce;
      this.grounded = false;
    }
    this.velocityY -= this.gravity * dt;
    this.group.position.y += this.velocityY * dt;
    if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocityY = 0;
      this.grounded = true;
    }

    // Wag tail
    this.tailTime += dt * 8;
    this.tail.rotation.z = Math.sin(this.tailTime) * 0.4;
  }

  attachItem(mesh) {
    // Attach a small item to Mabel's mouth area
    mesh.position.set(0, 0.65, 0.95);
    mesh.scale.set(0.5, 0.5, 0.5);
    this.group.add(mesh);
    this.carriedMesh = mesh;
  }

  dropItem() {
    if (this.carriedMesh) {
      this.group.remove(this.carriedMesh);
      this.carriedMesh = null;
    }
    this.carrying = null;
  }
}
