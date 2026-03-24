export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; font-family: 'Courier New', monospace;
      color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(this.container);

    // Score (top-left)
    this.scoreEl = this._makeEl('top: 20px; left: 20px; font-size: 24px;');
    // Wanted stars (top-right)
    this.wantedEl = this._makeEl('top: 20px; right: 20px; font-size: 28px;');
    // Carrying indicator (top-left, below score)
    this.carryingEl = this._makeEl('top: 52px; left: 20px; font-size: 18px; color: #FFD700;');
    // Controls hint (bottom-left)
    this.controlsEl = this._makeEl('bottom: 20px; left: 20px; font-size: 14px; color: #CCC; line-height: 1.6;');
    this.controlsEl.innerHTML = 'W — Go / S — Back up<br>A/D — Turn<br>Space — Jump<br>E — Interact';
    // Interaction prompt (bottom-center)
    this.promptEl = this._makeEl(`
      bottom: 60px; left: 50%; transform: translateX(-50%);
      font-size: 20px; background: rgba(0,0,0,0.6); padding: 8px 16px;
      border-radius: 8px; white-space: nowrap;
    `);
    // Game over overlay
    this.gameOverEl = this._makeEl(`
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 36px; text-align: center; background: rgba(0,0,0,0.8);
      padding: 40px; border-radius: 16px; display: none;
    `);
    // Title
    this.titleEl = this._makeEl(`
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 48px; text-align: center; background: rgba(0,0,0,0.85);
      padding: 40px 60px; border-radius: 16px; display: none;
    `);
    this.titleEl.innerHTML = `
      <div style="font-size: 56px; margin-bottom: 10px;">GRAND THEFT MABEL</div>
      <div style="font-size: 20px; color: #DAA520;">&#x25BC;(&#xB4;&#x1D25;&#x60;)&#x25BC;</div>
      <div style="font-size: 18px; margin-top: 20px; color: #AAA;">Press any key to start</div>
    `;
  }

  _makeEl(style) {
    const el = document.createElement('div');
    el.style.cssText = `position: absolute; ${style}`;
    this.container.appendChild(el);
    return el;
  }

  update(score, wantedLevel, carrying) {
    this.scoreEl.textContent = `Loot: ${score}`;

    let stars = '';
    for (let i = 0; i < 3; i++) {
      stars += i < wantedLevel ? '\u2605' : '\u2606';
    }
    this.wantedEl.textContent = stars;
    this.wantedEl.style.color = wantedLevel >= 3 ? '#FF4444' : wantedLevel >= 2 ? '#FFAA00' : '#FFFFFF';

    this.carryingEl.textContent = carrying ? `Carrying: ${carrying.name}` : '';
  }

  setPrompt(text) {
    if (text) {
      this.promptEl.textContent = text;
      this.promptEl.style.display = 'block';
    } else {
      this.promptEl.style.display = 'none';
    }
  }

  showGameOver(score) {
    this.gameOverEl.style.display = 'block';
    this.gameOverEl.innerHTML = `
      <div style="color: #FF4444; margin-bottom: 10px;">BUSTED!</div>
      <div style="font-size: 24px; margin-bottom: 20px;">Mabel has been caught!</div>
      <div style="font-size: 28px; color: #FFD700;">Loot Scored: ${score}</div>
      <div style="font-size: 18px; margin-top: 20px; color: #AAA;">Press R to try again</div>
    `;
  }

  hideGameOver() {
    this.gameOverEl.style.display = 'none';
  }

  showTitle() {
    this.titleEl.style.display = 'block';
  }

  hideTitle() {
    this.titleEl.style.display = 'none';
  }
}
