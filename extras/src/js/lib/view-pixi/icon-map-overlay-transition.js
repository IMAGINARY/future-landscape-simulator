class IconMapOverlayTransition {
  constructor(duration, overlay, onCompleteCallback, reverse = false) {
    this.duration = duration;
    this.elapsed = 0;
    this.reverse = reverse;
    this.overlay = overlay;
    this.onCompleteCallback = onCompleteCallback;
    this.finished = false;
  }

  animate(time) {
    if (!this.finished) {
      this.elapsed += time;
      const factor = Math.min(this.elapsed / this.duration, 1)
        * (this.reverse ? -1 : 1)
        + (this.reverse ? 1 : 0);
      this.overlay.alpha = factor;
      if (this.elapsed > this.duration) {
        this.finished = true;
        this.onCompleteCallback();
      }
    }
  }

  finish() {
    if (!this.finished) {
      this.elapsed = this.duration;
      this.overlay.alpha = this.reverse ? 0 : 1;
      this.finished = true;
      this.onCompleteCallback();
    }
  }
}

module.exports = IconMapOverlayTransition;
