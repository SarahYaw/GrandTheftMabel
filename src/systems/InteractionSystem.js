export class InteractionSystem {
  constructor(mabel, items, couch, collisionSystem, hud, wantedSystem) {
    this.mabel = mabel;
    this.items = items;
    this.couch = couch;
    this.collision = collisionSystem;
    this.hud = hud;
    this.wantedSystem = wantedSystem;
  }

  update(input, scene) {
    const mabelPos = this.mabel.position;
    let prompt = null;

    // Check stealable items
    if (!this.mabel.carrying) {
      for (const item of this.items) {
        if (item.stolen) continue;
        const dist = this.collision.distance2D(mabelPos, item.position);
        if (dist < item.interactionRadius) {
          prompt = `Press E to steal the ${item.name}`;
          if (input.isKeyJustPressed('KeyE')) {
            const carriedMesh = item.steal(scene);
            this.mabel.carrying = item;
            this.mabel.attachItem(carriedMesh);
            this.wantedSystem.onCrime();
          }
          break;
        }
      }
    }

    // Check couch for deposit
    if (this.mabel.carrying) {
      const dist = this.collision.distance2D(mabelPos, this.couch.position);
      if (dist < this.couch.interactionRadius) {
        prompt = `Press E to stash the ${this.mabel.carrying.name}`;
        if (input.isKeyJustPressed('KeyE')) {
          const item = this.mabel.carrying;
          this.couch.depositItem(item.name, item.points);
          this.mabel.score += item.points;
          this.mabel.dropItem();
          this.wantedSystem.onDeposit();
        }
      }
    }

    this.hud.setPrompt(prompt);
  }
}
