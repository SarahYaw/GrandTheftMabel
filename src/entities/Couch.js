import * as THREE from 'three';

export class Couch {
  constructor(scene, position) {
    this.group = new THREE.Group();

    // Couch seat
    const seatGeo = new THREE.BoxGeometry(3, 0.4, 1.5);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x8B6914 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.3;
    seat.castShadow = true;
    seat.receiveShadow = true;
    this.group.add(seat);

    // Couch back
    const backGeo = new THREE.BoxGeometry(3, 0.6, 0.3);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x7A5C10 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 0.7, 0.6);
    back.castShadow = true;
    this.group.add(back);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.3, 0.5, 1.5);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x7A5C10 });
    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-1.35, 0.55, 0);
    armL.castShadow = true;
    this.group.add(armL);
    const armR = armL.clone();
    armR.position.x = 1.35;
    this.group.add(armR);

    this.group.position.set(position.x, 0, position.z);
    scene.add(this.group);

    this.position = this.group.position;
    this.interactionRadius = 3;

    // Loot pile - items deposited here appear stacked
    this.lootPile = [];
    this.lootGroup = new THREE.Group();
    this.lootGroup.position.set(position.x, 0.55, position.z);
    scene.add(this.lootGroup);

    // Home zone marker - slightly different ground color
    const zoneGeo = new THREE.CircleGeometry(5, 16);
    const zoneMat = new THREE.MeshStandardMaterial({ color: 0x5A8A3A, side: THREE.DoubleSide });
    const zone = new THREE.Mesh(zoneGeo, zoneMat);
    zone.rotation.x = -Math.PI / 2;
    zone.position.set(position.x, 0.02, position.z);
    scene.add(zone);
  }

  depositItem(itemName, points) {
    // Add a small colored cube to the loot pile
    const geo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
    const mat = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
    });
    const lootMesh = new THREE.Mesh(geo, mat);
    const count = this.lootPile.length;
    // Stack items in a messy pile
    lootMesh.position.set(
      (Math.random() - 0.5) * 1.5,
      count * 0.2,
      (Math.random() - 0.5) * 0.8
    );
    lootMesh.rotation.y = Math.random() * Math.PI;
    lootMesh.castShadow = true;
    this.lootGroup.add(lootMesh);
    this.lootPile.push({ name: itemName, points });
  }

  reset(scene) {
    while (this.lootGroup.children.length > 0) {
      this.lootGroup.remove(this.lootGroup.children[0]);
    }
    this.lootPile = [];
  }
}
