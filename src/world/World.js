import * as THREE from 'three';
import { Building } from './Building.js';
import { StealableItem } from '../entities/StealableItem.js';
import { NPC } from '../entities/NPC.js';
import { Couch } from '../entities/Couch.js';

export class World {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.buildings = [];
    this.items = [];
    this.npcs = [];
    this.couch = null;

    this._buildGround(scene);
    this._buildRoads(scene);
    this._buildBuildings(scene, collisionSystem);
    this._placeItems(scene);
    this._placeCouch(scene);
    this._placeNPCs(scene);
    this._buildBoundary(collisionSystem);
  }

  _buildGround(scene) {
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4A7A2E });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  _buildRoads(scene) {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x555555 });

    // Horizontal road
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.y = 0.01;
    hRoad.receiveShadow = true;
    scene.add(hRoad);

    // Vertical road
    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.y = 0.01;
    vRoad.receiveShadow = true;
    scene.add(vRoad);

    // Road markings (dashed center lines)
    const dashMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
    for (let i = -35; i < 35; i += 4) {
      // Horizontal road dashes
      const dashH = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.15), dashMat);
      dashH.rotation.x = -Math.PI / 2;
      dashH.position.set(i, 0.02, 0);
      scene.add(dashH);
      // Vertical road dashes
      const dashV = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.5), dashMat);
      dashV.rotation.x = -Math.PI / 2;
      dashV.position.set(0, 0.02, i);
      scene.add(dashV);
    }
  }

  _buildBuildings(scene, collisionSystem) {
    const buildingConfigs = [
      // Top-left quadrant
      { position: { x: -15, z: -15 }, size: { x: 8, y: 4, z: 6 }, color: 0xCC8866 },
      { position: { x: -25, z: -20 }, size: { x: 6, y: 3, z: 5 }, color: 0x88AACC },
      // Top-right quadrant
      { position: { x: 18, z: -18 }, size: { x: 7, y: 5, z: 7 }, color: 0xAA6644 },
      { position: { x: 28, z: -12 }, size: { x: 5, y: 3, z: 4 }, color: 0x99BB77 },
      // Bottom-left quadrant
      { position: { x: -20, z: 18 }, size: { x: 6, y: 4, z: 5 }, color: 0xDDDD88 },
      // Bottom-right quadrant
      { position: { x: 20, z: 15 }, size: { x: 8, y: 3, z: 6 }, color: 0xBB7799 },
      { position: { x: 12, z: 25 }, size: { x: 5, y: 4, z: 5 }, color: 0x7799BB },
    ];

    for (const config of buildingConfigs) {
      const building = new Building(scene, config);
      this.buildings.push(building);
      collisionSystem.addStatic(building.aabb);
    }
  }

  _placeItems(scene) {
    const itemPositions = [
      { x: -10, z: -10 },
      { x: 15, z: -8 },
      { x: -22, z: 12 },
      { x: 25, z: 10 },
      { x: 8, z: 20 },
      { x: -8, z: 22 },
      { x: 30, z: -25 },
      { x: -30, z: -8 },
    ];

    itemPositions.forEach((pos, i) => {
      const item = new StealableItem(scene, pos, i);
      this.items.push(item);
    });
  }

  _placeCouch(scene) {
    // Mabel's home base - bottom-left area
    this.couch = new Couch(scene, { x: -30, z: 28 });
  }

  _placeNPCs(scene) {
    this.npcs.push(new NPC(scene, {
      position: { x: -12, z: -18 },
      color: 0x4444CC,
      type: 'neighbor',
      speed: 3,
    }));
    this.npcs.push(new NPC(scene, {
      position: { x: 22, z: 12 },
      color: 0x44CC44,
      type: 'neighbor',
      speed: 2.5,
    }));
    this.npcs.push(new NPC(scene, {
      position: { x: 30, z: -30 },
      color: 0xCC4444,
      type: 'dogcatcher',
      speed: 4,
    }));
  }

  _buildBoundary(collisionSystem) {
    const size = 40; // half-size of the map
    const wall = 2;
    // North
    collisionSystem.addStatic({
      min: new THREE.Vector3(-size, 0, -size - wall),
      max: new THREE.Vector3(size, 10, -size),
    });
    // South
    collisionSystem.addStatic({
      min: new THREE.Vector3(-size, 0, size),
      max: new THREE.Vector3(size, 10, size + wall),
    });
    // West
    collisionSystem.addStatic({
      min: new THREE.Vector3(-size - wall, 0, -size),
      max: new THREE.Vector3(-size, 10, size),
    });
    // East
    collisionSystem.addStatic({
      min: new THREE.Vector3(size, 0, -size),
      max: new THREE.Vector3(size + wall, 10, size),
    });
  }

  reset(scene) {
    // Remove existing items and re-place them
    for (const item of this.items) {
      if (!item.stolen) {
        scene.remove(item.mesh);
      }
    }
    this.items = [];
    this._placeItems(scene);

    // Reset NPCs
    for (const npc of this.npcs) {
      npc.reset();
    }

    // Reset couch loot pile
    this.couch.reset(scene);
  }
}
