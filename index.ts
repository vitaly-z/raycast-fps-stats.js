/**
 * Based on   
 * http://www.playfuljs.com/a-first-person-engine-in-265-lines/
 */

import './style.css';
import { Block, BlockSide, Bitmap } from './block';

declare var Stats;

var debugging = document.getElementById('debugging');

function debug(value: string) {
  debugging.innerHTML = `Debug: ${value}`;
}


var script = document.createElement('script');

script.onload = function() {
  var stats = new Stats();
  document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});
};

script.src='//mrdoob.github.io/stats.js/build/stats.min.js';
document.body.appendChild(script);


var CIRCLE = Math.PI * 2;
var MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)

class Controls {
  private codes = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward' };
  public states = { 'left': false, 'right': false, 'forward': false, 'backward': false };

  constructor() {
    document.addEventListener('keydown', this.onKey.bind(this, true), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);
    document.addEventListener('touchstart', this.onTouch.bind(this), false);
    document.addEventListener('touchmove', this.onTouch.bind(this), false);
    document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
  }

  onTouch(e) {
    var t = e.touches[0];
    this.onTouchEnd(e);
    if (t.pageY < window.innerHeight * 0.5) this.onKey(true, { keyCode: 38 });
    else if (t.pageX < window.innerWidth * 0.5) this.onKey(true, { keyCode: 37 });
    else if (t.pageY > window.innerWidth * 0.5) this.onKey(true, { keyCode: 39 });
  };

  onTouchEnd(e) {
    this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false };
    e.preventDefault();
    e.stopPropagation();
  }

  onKey(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  }
}

class Player {

  private weapon: Bitmap;
  private paces: number;

  constructor(private x: number, private y: number, private direction: number) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.weapon = new Bitmap('https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Flearnbritenglish.files.wordpress.com%2F2013%2F09%2Fknife_fo3.png&f=1', 319, 320);
    this.paces = 0;
  }

  rotate(angle) {
    this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
  }

  walk(distance, map) {
    var dx = Math.cos(this.direction) * distance;
    var dy = Math.sin(this.direction) * distance;
    if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
    if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
    this.paces += distance;
  }

  update(controls, map, seconds) {
    if (controls.left) this.rotate(-Math.PI * seconds);
    if (controls.right) this.rotate(Math.PI * seconds);
    if (controls.forward) this.walk(3 * seconds, map);
    if (controls.backward) this.walk(-3 * seconds, map);
  }
}

const Paintings = [
  'https://www.englishaccentantiques.com/wp-content/uploads/2017/04/Large-Antique-Oil-Painting-of-Sheep-and-Shepherdess-in-Antique-Giltwood-Frame.jpg',
  'https://a.1stdibscdn.com/archivesE/upload/1121189/f_82273631502350325141/8227363_master.jpg?width=768',
  'https://a.1stdibscdn.com/archivesE/1stdibs/013111/JacqAdams_JM//4Atl/x.jpg',
  'https://a.1stdibscdn.com/archivesE/upload/1722654/f_50671231468337468386/Antique_Painting_Sheep_all1_org_l.jpg',
  'https://a.1stdibscdn.com/archivesE/upload/1121189/f_67082531488174847869/6708253_l.jpg',
  'https://a.1stdibscdn.com/archivesE/1stdibs/072612/EnglishAccentAtl/10Atl/x_abp457108.jpg',
];

class WorldMap {

  private wallGrid: any[];
  private skybox: Bitmap;
  private wallTexture: Bitmap;
  private light: number;

  constructor(private size: number) {
    this.size = size;
    this.wallGrid = new Array(size * size);
    this.skybox = new Bitmap('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Chalbi_Desert_Panorama.jpg/1200px-Chalbi_Desert_Panorama.jpg', 2000, 750);
    this.wallTexture = new Bitmap('https://a.1stdibscdn.com/archivesE/upload/1121189/f_67082531488174847869/6708253_l.jpg', 768, 768);
    this.light = 0;
  }

  get(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
    return this.wallGrid[y * this.size + x];
  }

  private getBlockWithImageOnRandomSide() {
    const sides = [
      {color: '#ffffff'}, 
      {color: '#ffffff'}, 
      {color: '#ffffff'}, 
      {color: '#ffffff'}, 
    ] as BlockSide[];
    const paintingOn = Math.floor(Math.random() * 4);

    const painting = Paintings[Math.floor(Math.random()*Paintings.length)];

    sides[paintingOn] = {
      texture: new Bitmap(painting, 768, 768)
    };
    return new Block(sides);
  }

  randomize() {
    for (var i = 0; i < this.size * this.size; i++) {
      this.wallGrid[i] = Math.random() < 0.3 ?
        //new Block([
        //  {color: '#ff0000'}, 
        //  {color: '#00ff00'}, 
        //  {color: '#0000ff'}, 
        //  {texture: new Bitmap('https://a.1stdibscdn.com/archivesE/upload/1121189/f_67082531488174847869/6708253_l.jpg', 768, 768)}
        //]) 
        this.getBlockWithImageOnRandomSide()
        : 0;
    }

    //this.wallGrid = [
    //  new Block([{color: '#ff0000'}, {color: '#00ff00'}, {color: '#0000ff'}, {color: '#000000'}])
    //];
    //console.log(this.wallGrid);
  }

  cast(point, angle, range) {
    var self = this;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    
    var noWall = { length2: Infinity };
    return ray({ x: point.x, y: point.y, block: 0, distance: 0 });

    function ray(origin) {
      var stepX = step(sin, cos, origin.x, origin.y);
      var stepY = step(cos, sin, origin.y, origin.x, true);
      var nextStep = stepX.length2 < stepY.length2
        ? inspect(stepX, 1, 0, origin.distance, stepX.y)
        : inspect(stepY, 0, 1, origin.distance, stepY.x);

      if (nextStep.distance > range) return [origin];
      return [origin].concat(ray(nextStep));
    }

    function step(rise, run, x, y, inverted?): any {
      
      if (run === 0) return noWall;
      var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
      var dy = dx * (rise / run);
      return {
        x: inverted ? y + dy : x + dx,
        y: inverted ? x + dx : y + dy,
        length2: dx * dx + dy * dy
      };
    }

    function inspect(step, shiftX, shiftY, distance, offset) {
      var dx = cos < 0 ? shiftX : 0;
      var dy = sin < 0 ? shiftY : 0;
      step.block = self.get(step.x - dx, step.y - dy);
      step.distance = distance + Math.sqrt(step.length2);
      if (shiftX) step.shading = cos < 0 ? 2 : 0;
      else step.shading = sin < 0 ? 2 : 1;
      step.offset = offset - Math.floor(offset);
      return step;
    }
  }

  update(seconds) {
    /* Lighting */
    //if (this.light > 0) this.light = Math.max(this.light - 10 * seconds, 0);
    //else if (Math.random() * 5 < seconds) this.light = 2;
    this.light = 1;
  }
}

class Camera {

  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private spacing: number;
  private range: number;
  private lightRange: number;
  private scale: number;

  constructor(private canvas: HTMLCanvasElement, private resolution: number, public focalLength?: number) {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth * 0.5;
    this.height = canvas.height = window.innerHeight * 0.5;
    this.resolution = resolution;
    this.spacing = this.width / resolution;
    this.focalLength = focalLength || 0.8;
    this.range = MOBILE ? 8 : 30; // render range
    this.lightRange = 8;
    this.scale = (this.width + this.height) / 1200;
  }

  render(player, map) {
    this.drawSky(player.direction, map.skybox, map.light);
    this.drawColumns(player, map);
    this.drawWeapon(player.weapon, player.paces);
  }

  private drawSky(direction, sky, ambient) {
    var width = sky.width * (this.height / sky.height) * 2;
    var left = (direction / CIRCLE) * -width;

    this.ctx.save();
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillRect(0, 0, this.width, this.height * 0.5);
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(0,this.height * 0.5 , this.width, this.height * 0.5);
    //this.ctx.drawImage(sky.image, left, 0, width, this.height);
    //if (left < width - this.width) {
    //  this.ctx.drawImage(sky.image, left + width, 0, width, this.height);
    //}
    //if (ambient > 0) {
    //  this.ctx.fillStyle = '#ffffff';
    //  this.ctx.globalAlpha = ambient * 0.1;
    //  this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
    //}
    this.ctx.restore();
  }

  private drawColumns(player, map: WorldMap) {
    this.ctx.save();
    for (var column = 0; column < this.resolution; column++) {
      
      // these are always the same if resolution and focalLength stays the same
      var x = column / this.resolution - 0.5;
      var angle = Math.atan2(x, this.focalLength);


      var ray = map.cast(player, player.direction + angle, this.range);
      this.drawColumn(column, ray, angle, map, player);
    }
    this.ctx.restore();
  }

  private drawWeapon(weapon, paces) {
    var bobX = Math.cos(paces * 2) * this.scale * 6;
    var bobY = Math.sin(paces * 4) * this.scale * 6;
    var left = this.width * 0.66 + bobX;
    var top = this.height * 0.6 + bobY;
    this.ctx.drawImage(weapon.image, left, top, weapon.width * this.scale, weapon.height * this.scale);
  }

  private drawColumn(column, ray, angle, map, player) {
    var ctx = this.ctx;
    var texture = map.wallTexture;
    var left = Math.floor(column * this.spacing);
    var width = Math.ceil(this.spacing);
    var hit = -1;

    while (++hit < ray.length && ray[hit].block <= 0);

    for (var s = ray.length - 1; s >= 0; s--) {
      var step = ray[s];
      //var rainDrops = Math.pow(Math.random(), 3) * s;
      //var rain = (rainDrops > 0) && this.project(0.1, angle, step.distance);

      const stepXFrac = step.x - Math.floor(step.x);
      //const stepYFrac = step.y - Math.floor(step.y);
      const invY = player.y > step.y;
      const invX = player.x > step.x;

      function getDir() {
        if (stepXFrac === 0 ) {
          return invX ? 0 : 2;
        } else {
          return invY ? 1 : 3;
        }
      }
      const dir = getDir();

      if (s === hit) {
        var textureX = Math.floor(texture.width * step.offset);

        // step.block is value in map position
        if (step.block === -1 || step.block === 0) {
          var wall = this.project(step.block, angle, step.distance);
        } else {
          var wall = this.project(step.block.height, angle, step.distance);
          ctx.globalAlpha = 1;
          if (step.block.sides[dir].texture) {
            ctx.drawImage(
              step.block.sides[dir].texture.image, 
              textureX, 0, 1, texture.height, left, wall.top, width, wall.height
            );
          }
          else if (step.block.sides[dir].color) {
            ctx.fillStyle = step.block.sides[dir].color;
            ctx.fillRect(left, wall.top, width, wall.height);
          } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(left, wall.top, width, wall.height);
          }
        }
        //var wall = this.project(step.block * Math.random() * 2, angle, step.distance); psycho stuff

       
        
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
        ctx.fillRect(left, wall.top, width, wall.height);
      }
      
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.15;

      //while (--rainDrops > 0) ctx.fillRect(left, Math.random() * rain.top, 1, rain.height);
    }
  }

  private project(height, angle, distance) {
    var z = distance * Math.cos(angle);
    var wallHeight = (this.height * height / z);
    var bottom = this.height / 2 * (1 + 1 / z);
    return {
      top: bottom - wallHeight,
      height: wallHeight
    }; 
  }
}

class GameLoop {

  private lastTime: number;
  private callback: Function;

  constructor() {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.callback = function() {};
  }

  start(callback) {
    this.callback = callback;
    requestAnimationFrame(this.frame);
  }

  frame(time) {
    var seconds = (time - this.lastTime) / 1000;
    this.lastTime = time;
    if (seconds < 0.2) this.callback(seconds);
    requestAnimationFrame(this.frame);
  }
}

var display = document.getElementById('display') as HTMLCanvasElement;
var player = new Player(15.3, -1.2, Math.PI * 0.3);
var map = new WorldMap(320);
var controls = new Controls();
var camera = new Camera(display, MOBILE ? 160 : 320, 0.8);
var loop = new GameLoop();

map.randomize();

var deltaTime = 0;

loop.start(function frame(seconds) {
  deltaTime += seconds;
  map.update(seconds);
  player.update(controls.states, map, seconds);
  camera.render(player, map);
  //camera.focalLength = 0.8 + Math.pow(Math.cos(deltaTime)/2, 2); // <-- drunk mode
});
