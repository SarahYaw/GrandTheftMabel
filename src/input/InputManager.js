export class InputManager {
  constructor() {
    this.keysDown = new Set();
    this.keysJustPressed = new Set();

    window.addEventListener('keydown', (e) => {
      if (!this.keysDown.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });
  }

  isKeyDown(code) {
    return this.keysDown.has(code);
  }

  isKeyJustPressed(code) {
    return this.keysJustPressed.has(code);
  }

  lateUpdate() {
    this.keysJustPressed.clear();
  }
}
