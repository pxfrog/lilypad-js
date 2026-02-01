/**
 * LilyPad.js Engine v0.1.0
 * (c) 2026 pxfrog.com
 */

const LILYPAD = (function() {
    'use strict';

    class Game {
        constructor(config = {}) {
            this.width = config.width || 160;
            this.height = config.height || 144;
            this.scale = config.scale || 4;
            this.fps = config.fps || 60;
            this.container = document.getElementById(config.container) || document.body;

            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = (this.width * this.scale) + 'px';
            this.canvas.style.height = (this.height * this.scale) + 'px';
            this.canvas.style.imageRendering = 'pixelated';
            this.canvas.style.backgroundColor = config.bgColor || '#000';
            this.container.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.ctx.imageSmoothingEnabled = false;

            this.assets = {};
            this.scenes = {};
            this.currentScene = null;
            this.isRunning = false;
            this.lastTime = 0;

            this.shakeTime = 0;
            this.shakeIntensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;

            this.input = new Input(this.canvas);
            
            this.update = (dt) => {};
            this.draw = (ctx) => {};

            window.addEventListener('resize', () => this.autoScale());
            if (config.autoScale) this.autoScale();
        }

        autoScale() {
            const parent = this.canvas.parentElement;
            const pw = parent.clientWidth;
            const ph = parent.clientHeight;
            const s = Math.min(pw / this.width, ph / this.height);
            this.canvas.style.width = (this.width * s) + 'px';
            this.canvas.style.height = (this.height * s) + 'px';
        }

        async load(files) {
            const promises = files.map(file => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = file;
                    img.onload = () => {
                        const name = file.split('/').pop().split('.')[0];
                        this.assets[name] = img;
                        resolve(img);
                    };
                    img.onerror = reject;
                });
            });
            return Promise.all(promises);
        }

        start() {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.loop(t));
        }

        loop(currentTime) {
            if (!this.isRunning) return;

            const dt = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // Handle Camera Shake
            if (this.shakeTime > 0) {
                this.shakeTime -= dt;
                this.offsetX = (Math.random() - 0.5) * this.shakeIntensity;
                this.offsetY = (Math.random() - 0.5) * this.shakeIntensity;
                if (this.shakeTime <= 0) {
                    this.offsetX = 0;
                    this.offsetY = 0;
                }
            }

            this.update(dt);
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.ctx.save();
            this.ctx.translate(this.offsetX, this.offsetY);
            this.draw(this.ctx);
            this.ctx.restore();

            requestAnimationFrame((t) => this.loop(t));
        }

        shake(intensity = 5, duration = 0.5) {
            this.shakeIntensity = intensity;
            this.shakeTime = duration;
        }
    }

    class Sprite {
        constructor(image, x = 0, y = 0, width, height) {
            this.image = image;
            this.x = x;
            this.y = y;
            this.width = width || image.width;
            this.height = height || image.height;
            this.flipX = false;
            this.flipY = false;
            this.rotation = 0;
            this.alpha = 1;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    class Input {
        constructor(canvas) {
            this.keys = {};
            this.mouse = { x: 0, y: 0, down: false };
            this.touches = [];

            window.addEventListener('keydown', (e) => this.keys[e.code] = true);
            window.addEventListener('keyup', (e) => this.keys[e.code] = false);

            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / (rect.width / canvas.width);
                this.mouse.y = (e.clientY - rect.top) / (rect.height / canvas.height);
            });
            canvas.addEventListener('mousedown', () => this.mouse.down = true);
            canvas.addEventListener('mouseup', () => this.mouse.down = false);

            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.updateTouches(e, canvas);
            }, { passive: false });
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.updateTouches(e, canvas);
            }, { passive: false });
            canvas.addEventListener('touchend', (e) => {
                this.updateTouches(e, canvas);
            });
        }

        updateTouches(e, canvas) {
            const rect = canvas.getBoundingClientRect();
            this.touches = Array.from(e.touches).map(t => ({
                x: (t.clientX - rect.left) / (rect.width / canvas.width),
                y: (t.clientY - rect.top) / (rect.height / canvas.height)
            }));
        }

        isPressed(code) {
            return !!this.keys[code];
        }
    }

    return {
        Game,
        Sprite,
        Input
    };

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LILYPAD;
}
