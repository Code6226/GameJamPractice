(function() {
  window.Game = {};

  Game.getTextureFromFrame = function(frameId, unsafe) {
    var name;
    name = frameId + '.png';
    if (unsafe != null) {
      return PIXI.TextureCache[name] || null;
    } else {
      return PIXI.TextureCache[name] || PIXI.Texture.fromImage(name);
    }
  };

  Game.getTexturesFromFrameBase = function(frameBase) {
    var index, result, textures;
    textures = [];
    result = null;
    index = 0;
    while (true) {
      index++;
      result = Game.getTextureFromFrame(frameBase + index, true);
      if (result != null) {
        textures.push(result);
      } else {
        break;
      }
    }
    return textures;
  };

}).call(this);

(function() {
  Game.Asteroid = (function() {
    Asteroid.prototype.speed = 100;

    function Asteroid(x, y) {
      this.sprite = new Game.SpriteAnimation(Game.getTexturesFromFrameBase('asteroid'), 0.5);
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 0.5;
      this.sprite.position.x = x;
      this.sprite.position.y = y;
    }

    Asteroid.prototype.update = function(dt) {
      this.sprite.update(dt);
      return this.sprite.rotation += 0.5 * dt;
    };

    return Asteroid;

  })();

}).call(this);

(function() {
  Game.Bunny = (function() {
    Bunny.prototype.speed = 300;

    function Bunny(x, y) {
      this.sprite = new PIXI.Sprite(Game.getTextureFromFrame("bunny"));
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 0.5;
      this.sprite.position.x = x;
      this.sprite.position.y = y;
    }

    Bunny.prototype.update = function(dt) {
      if (Game.Key.isDown(Game.Key.UP)) {
        this.moveUp(dt);
      }
      if (Game.Key.isDown(Game.Key.LEFT)) {
        this.moveLeft(dt);
      }
      if (Game.Key.isDown(Game.Key.DOWN)) {
        this.moveDown(dt);
      }
      if (Game.Key.isDown(Game.Key.RIGHT)) {
        return this.moveRight(dt);
      }
    };

    Bunny.prototype.moveUp = function(dt) {
      return this.sprite.position.y -= this.speed * dt;
    };

    Bunny.prototype.moveDown = function(dt) {
      return this.sprite.position.y += this.speed * dt;
    };

    Bunny.prototype.moveRight = function(dt) {
      return this.sprite.position.x += this.speed * dt;
    };

    Bunny.prototype.moveLeft = function(dt) {
      return this.sprite.position.x -= this.speed * dt;
    };

    return Bunny;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Game.SpriteAnimation = (function(_super) {
    __extends(SpriteAnimation, _super);

    SpriteAnimation.prototype.textures = null;

    SpriteAnimation.prototype.timePerFrame = 1;

    SpriteAnimation.prototype.timeUntilNextFrame = 1;

    SpriteAnimation.prototype.frameCur = 0;

    function SpriteAnimation(textures, timePerFrame) {
      if (!_.isArray(textures)) {
        throw Error("bad arg");
      }
      this.textures = textures;
      this.timePerFrame = timePerFrame;
      this.timeUntilNextFrame = timePerFrame;
      SpriteAnimation.__super__.constructor.call(this, textures[0]);
    }

    SpriteAnimation.prototype.update = function(dt) {
      this.timeUntilNextFrame -= dt;
      if (this.timeUntilNextFrame <= 0) {
        this.timeUntilNextFrame += this.timePerFrame;
        this.frameCur = (this.frameCur + 1) % this.textures.length;
        return this.setTexture(this.textures[this.frameCur]);
      }
    };

    return SpriteAnimation;

  })(PIXI.Sprite);

}).call(this);

(function() {
  Game.Key = {
    _pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },
    onKeydown: function(event) {
      return this._pressed[event.keyCode] = true;
    },
    onKeyup: function(event) {
      return delete this._pressed[event.keyCode];
    }
  };

  Game.InputManager = (function() {
    function InputManager() {}

    InputManager.prototype.init = function(window) {
      window.addEventListener('keyup', (function(event) {
        return Game.Key.onKeyup(event);
      }), false);
      return window.addEventListener('keydown', (function(event) {
        return Game.Key.onKeydown(event);
      }), false);
    };

    return InputManager;

  })();

}).call(this);

(function() {
  var animate, asteroids, bunnies, input, loader, onAssetsLoaded, renderer, stage, text, time;

  stage = new PIXI.Stage(0x110022);

  renderer = PIXI.autoDetectRenderer(500, 500, null);

  renderer.view.style.position = "absolute";

  renderer.view.style.display = "block";

  renderer.view.style.top = renderer.view.style.left = "0";

  renderer.view.style.width = window.innerWidth + "px";

  renderer.view.style.height = window.innerHeight + "px";

  document.body.appendChild(renderer.view);

  $(window).resize(function() {
    renderer.view.style.width = window.innerWidth + "px";
    return renderer.view.style.height = window.innerHeight + "px";
  });

  input = new Game.InputManager;

  input.init(window);

  text = new PIXI.Text("Text", {
    font: "bold italic 14px Arvo",
    fill: "#eeffee",
    align: "left",
    stroke: "#ddeeff",
    strokeThickness: 1
  });

  text.position.x = text.position.y = 5;

  text.anchor.x = text.anchor.y = 0;

  stage.addChild(text);

  bunnies = [];

  asteroids = [];

  onAssetsLoaded = function() {
    var bunny;
    bunny = new Game.Bunny(200, 150);
    stage.addChild(bunny.sprite);
    bunnies.push(bunny);
    return asteroids = _.map(_.range(8), function() {
      var asteroid;
      asteroid = new Game.Asteroid(50 + _.random(400), 50 + _.random(400));
      stage.addChild(asteroid.sprite);
      return asteroid;
    });
  };

  loader = new PIXI.AssetLoader(['assets/main0.json']);

  loader.onComplete = onAssetsLoaded;

  loader.load();

  time = null;

  animate = function() {
    var asteroid, bunny, dt, fps, now, _i, _j, _len, _len1;
    requestAnimFrame(animate);
    now = Date.now();
    dt = now - (time || now);
    fps = 1000 / dt;
    dt *= 0.001;
    time = now;
    text.setText('FPS ' + parseInt(fps) + ' dt ' + dt);
    for (_i = 0, _len = bunnies.length; _i < _len; _i++) {
      bunny = bunnies[_i];
      bunny.update(dt);
    }
    for (_j = 0, _len1 = asteroids.length; _j < _len1; _j++) {
      asteroid = asteroids[_j];
      asteroid.update(dt);
    }
    return renderer.render(stage);
  };

  requestAnimFrame(animate);

}).call(this);
