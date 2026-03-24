import * as THREE from 'three';

const NPC_STATES = {
  IDLE: 'idle',
  SUSPICIOUS: 'suspicious',
  CHASING: 'chasing',
};

export class NPC {
  constructor(scene, { position, color = 0x4444CC, type = 'neighbor', speed = 3 }) {
    this.type = type;
    this.state = NPC_STATES.IDLE;
    this.baseSpeed = speed;
    this.chaseSpeed = speed * 2.5;
    this.suspiciousSpeed = speed * 0.5;

    this.group = new THREE.Group();

    // Body - capsule
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    this.group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    head.castShadow = true;
    this.group.add(head);

    // Exclamation mark (hidden by default, shown when suspicious/chasing)
    const excGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const excMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    this.exclamation = new THREE.Mesh(excGeo, excMat);
    this.exclamation.position.y = 1.8;
    this.exclamation.visible = false;
    this.group.add(this.exclamation);

    this.group.position.set(position.x, 0, position.z);
    scene.add(this.group);

    this.position = this.group.position;
    this.halfExtents = new THREE.Vector3(0.3, 0.8, 0.3);

    // Patrol
    this.spawnPosition = new THREE.Vector3(position.x, 0, position.z);
    this.patrolTarget = new THREE.Vector3(
      position.x + (Math.random() - 0.5) * 10,
      0,
      position.z + (Math.random() - 0.5) * 10
    );
    this.patrolTimer = 0;

    // For catch detection
    this.catchRadius = 1.2;
  }

  getAABB() {
    return {
      min: new THREE.Vector3(
        this.position.x - this.halfExtents.x,
        0,
        this.position.z - this.halfExtents.z
      ),
      max: new THREE.Vector3(
        this.position.x + this.halfExtents.x,
        this.halfExtents.y * 2,
        this.position.z + this.halfExtents.z
      ),
    };
  }

  update(dt, mabelPosition, wantedLevel) {
    // State transitions based on wanted level
    if (wantedLevel === 0) {
      this.state = NPC_STATES.IDLE;
    } else if (wantedLevel === 1) {
      const dist = this.distTo(mabelPosition);
      this.state = dist < 15 ? NPC_STATES.SUSPICIOUS : NPC_STATES.IDLE;
    } else {
      this.state = NPC_STATES.CHASING;
    }

    // Dogcatcher is more aggressive
    if (this.type === 'dogcatcher' && wantedLevel >= 2) {
      this.state = NPC_STATES.CHASING;
    }

    // Behavior
    switch (this.state) {
      case NPC_STATES.IDLE:
        this.exclamation.visible = false;
        this.patrol(dt);
        break;
      case NPC_STATES.SUSPICIOUS:
        this.exclamation.visible = true;
        this.exclamation.material.color.setHex(0xFFFF00);
        this.moveToward(mabelPosition, this.suspiciousSpeed, dt);
        break;
      case NPC_STATES.CHASING:
        this.exclamation.visible = true;
        this.exclamation.material.color.setHex(0xFF0000);
        const speed = wantedLevel >= 3 ? this.chaseSpeed * 1.3 : this.chaseSpeed;
        this.moveToward(mabelPosition, speed, dt);
        break;
    }
  }

  patrol(dt) {
    this.patrolTimer += dt;
    if (this.patrolTimer > 4) {
      this.patrolTimer = 0;
      this.patrolTarget.set(
        this.spawnPosition.x + (Math.random() - 0.5) * 10,
        0,
        this.spawnPosition.z + (Math.random() - 0.5) * 10
      );
    }
    this.moveToward(this.patrolTarget, this.baseSpeed * 0.3, dt);
  }

  moveToward(target, speed, dt) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.5) return;

    const nx = dx / dist;
    const nz = dz / dist;
    this.position.x += nx * speed * dt;
    this.position.z += nz * speed * dt;

    // Face movement direction
    this.group.rotation.y = Math.atan2(nx, nz);
  }

  distTo(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  isTouchingMabel(mabelPosition) {
    return this.distTo(mabelPosition) < this.catchRadius;
  }

  reset() {
    this.position.copy(this.spawnPosition);
    this.state = NPC_STATES.IDLE;
    this.exclamation.visible = false;
    this.patrolTimer = 0;
  }
}
