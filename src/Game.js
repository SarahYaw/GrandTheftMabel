import * as THREE from 'three';
import { InputManager } from './input/InputManager.js';
import { TopDownCamera } from './camera/TopDownCamera.js';
import { Mabel } from './entities/Mabel.js';
import { World } from './world/World.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { WantedSystem } from './systems/WantedSystem.js';
import { HUD } from './ui/HUD.js';

const GAME_STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
};

export class Game {
  constructor() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    // Fog for atmosphere
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 90);

    // Clock
    this.clock = new THREE.Clock();

    // Lighting
    this._setupLighting();

    // Input
    this.input = new InputManager();

    // Camera
    this.topDownCamera = new TopDownCamera();

    // Collision
    this.collisionSystem = new CollisionSystem();

    // World (builds ground, buildings, items, NPCs, couch)
    this.world = new World(this.scene, this.collisionSystem);

    // Player
    this.mabel = new Mabel(this.scene);
    // Start Mabel near the couch
    this.mabel.position.set(-28, 0, 25);

    // Camera target
    this.topDownCamera.setTarget(this.mabel.position);

    // Systems
    this.wantedSystem = new WantedSystem();
    this.hud = new HUD();
    this.interactionSystem = new InteractionSystem(
      this.mabel,
      this.world.items,
      this.world.couch,
      this.collisionSystem,
      this.hud,
      this.wantedSystem
    );

    // Game state
    this.state = GAME_STATES.TITLE;
    this.hud.showTitle();

    // Resize handler
    window.addEventListener('resize', () => this._onResize());
  }

  _setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Sun
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);
  }

  _onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.topDownCamera.handleResize();
  }

  start() {
    this.renderer.setAnimationLoop((time) => this._loop(time));
  }

  _loop(time) {
    const dt = Math.min(this.clock.getDelta(), 0.05); // cap delta to prevent huge jumps

    switch (this.state) {
      case GAME_STATES.TITLE:
        this._updateTitle(dt);
        break;
      case GAME_STATES.PLAYING:
        this._updatePlaying(dt);
        break;
      case GAME_STATES.GAME_OVER:
        this._updateGameOver(dt);
        break;
    }

    this.topDownCamera.update(dt);
    this.renderer.render(this.scene, this.topDownCamera.camera);
    this.input.lateUpdate();
  }

  _updateTitle(dt) {
    // Slowly rotate camera around the scene
    const t = this.clock.elapsedTime;
    this.topDownCamera.camera.position.set(
      Math.sin(t * 0.2) * 20,
      this.topDownCamera.height,
      Math.cos(t * 0.2) * 20
    );
    this.topDownCamera.camera.lookAt(0, 0, 0);

    // Any key starts the game
    if (this.input.keysJustPressed.size > 0) {
      this.hud.hideTitle();
      this.state = GAME_STATES.PLAYING;
      this.topDownCamera.setTarget(this.mabel.position);
    }
  }

  _updatePlaying(dt) {
    // Player
    this.mabel.update(dt, this.input);
    this.collisionSystem.resolve(this.mabel);
    this.topDownCamera.setTargetRotation(this.mabel.group.rotation.y);

    // NPCs
    for (const npc of this.world.npcs) {
      npc.update(dt, this.mabel.position, this.wantedSystem.level);

      // Check if NPC catches Mabel
      if (npc.state === 'chasing' && npc.isTouchingMabel(this.mabel.position)) {
        this._gameOver();
        return;
      }
    }

    // Interaction
    this.interactionSystem.update(this.input, this.scene);

    // Wanted system
    this.wantedSystem.update(dt);

    // HUD
    this.hud.update(this.mabel.score, this.wantedSystem.level, this.mabel.carrying);
  }

  _updateGameOver(dt) {
    if (this.input.isKeyJustPressed('KeyR')) {
      this._restart();
    }
  }

  _gameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.hud.showGameOver(this.mabel.score);
  }

  _restart() {
    this.hud.hideGameOver();
    this.state = GAME_STATES.PLAYING;

    // Reset player
    this.mabel.dropItem();
    this.mabel.score = 0;
    this.mabel.position.set(-28, 0, 25);

    // Reset wanted
    this.wantedSystem.level = 0;
    this.wantedSystem.decayTimer = 0;

    // Reset world
    this.world.reset(this.scene);

    // Update interaction system with new items
    this.interactionSystem.items = this.world.items;
  }
}
