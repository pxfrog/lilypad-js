# LilyPad.js 🐸

A lightweight, pixel-art focused JavaScript game engine for the web.

## Features
- 🚀 Extremely lightweight and fast
- 🎨 Native pixel-art rendering
- 📱 Touch and mobile-friendly
- 🕹️ Simple API for rapid prototyping

## Getting Started

```html
<script src="dist/lilypad.js"></script>
<script>
    const game = new LILYPAD.Game({
        width: 160,
        height: 144,
        scale: 4,
        container: 'game-container'
    });

    game.load(['player.png', 'map.png']).then(() => {
        game.start();
    });

    game.update = (dt) => {
        // Update logic
    };

    game.draw = (ctx) => {
        // Custom drawing
    };
</script>
```

## License
MIT
