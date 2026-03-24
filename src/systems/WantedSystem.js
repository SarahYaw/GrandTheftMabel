export class WantedSystem {
  constructor() {
    this.level = 0;
    this.maxLevel = 3;
    this.decayTimer = 0;
    this.decayInterval = 20; // seconds before wanted level decays by 1
  }

  onCrime() {
    this.level = Math.min(this.level + 1, this.maxLevel);
    this.decayTimer = 0;
  }

  onDeposit() {
    this.level = Math.max(this.level - 1, 0);
    this.decayTimer = 0;
  }

  update(dt) {
    if (this.level > 0) {
      this.decayTimer += dt;
      if (this.decayTimer >= this.decayInterval) {
        this.level = Math.max(this.level - 1, 0);
        this.decayTimer = 0;
      }
    }
  }
}
