"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./DemoComponents";

interface GameControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function RacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControlsRef = useRef<GameControls | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'menu'>('menu');
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Original Vroom racing game code adapted for React
    const $ = {
      canvas: canvasRef.current,
      ctx: canvasRef.current.getContext('2d')!,
      canvas2: null as HTMLCanvasElement | null,
      ctx2: null as CanvasRenderingContext2D | null,
      colors: {
        sky: "#D4F5FE",
        mountains: "#83CACE", 
        ground: "#8FC04C",
        groundDark: "#73B043",
        road: "#606a7c",
        roadLine: "#FFF",
        hud: "#FFF"
      },
      settings: {
        fps: 60,
        skySize: 120,
        ground: {
          size: 350,
          min: 4,
          max: 120
        },
        road: {
          min: 60,  // Adjusted for narrower canvas
          max: 450, // Adjusted for narrower canvas
        }
      },
      state: {
        bgpos: 0,
        offset: 0,
        startDark: true,
        curve: 0,
        currentCurve: 0,
        turn: 1,
        speed: 27,
        xpos: 0,
        section: 50,
        car: {
          maxSpeed: 50,
          friction: 0.4,
          acc: 0.85,
          deAcc: 0.5
        },
        keypress: {
          up: false,
          left: false,
          right: false,
          down: false
        }
      },
      storage: {
        bg: null as ImageData | null
      }
    };

    $.canvas2 = document.createElement('canvas');
    $.canvas2.width = $.canvas.width;
    $.canvas2.height = $.canvas.height;
    $.ctx2 = $.canvas2.getContext('2d')!;

    let gameRunning = false;
    let animationId: number;

    // Utility functions
    function randomRange(min: number, max: number): number {
      return min + Math.random() * (max - min);
    }

    function norm(value: number, min: number, max: number): number {
      return (value - min) / (max - min);
    }

    function lerp(norm: number, min: number, max: number): number {
      return (max - min) * norm + min;
    }

    function map(value: number, sourceMin: number, sourceMax: number, destMin: number, destMax: number): number {
      return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
    }

    function getCirclePoint(x: number, y: number, radius: number, angle: number) {
      const radian = (angle / 180) * Math.PI;
      return {
        x: x + radius * Math.cos(radian),
        y: y + radius * Math.sin(radian)
      }
    }

    // Input handling
    function move(e: KeyboardEvent, isKeyDown: boolean) {
      if(e.keyCode >= 37 && e.keyCode <= 40) {
        e.preventDefault();
      }

      if(e.keyCode === 37) {
        $.state.keypress.left = isKeyDown;
      } 

      if(e.keyCode === 38) {
        $.state.keypress.up = isKeyDown;
      } 

      if(e.keyCode === 39) {
        $.state.keypress.right = isKeyDown;
      } 

      if(e.keyCode === 40) {
        $.state.keypress.down = isKeyDown;
      }
    }

    function keyUp(e: KeyboardEvent) {
      move(e, false);
    }

    function keyDown(e: KeyboardEvent) {
      move(e, true);
    }

    function calcMovement() {
      const move = $.state.speed * 0.01;
      let newCurve = 0;
      
      if($.state.keypress.up) {
        $.state.speed += $.state.car.acc - ($.state.speed * 0.015);
      } else if ($.state.speed > 0) {
        $.state.speed -= $.state.car.friction;
      }
      
      if($.state.keypress.down && $.state.speed > 0) {
        $.state.speed -= 1;
      }
      
      // Left and right
      $.state.xpos -= ($.state.currentCurve * $.state.speed) * 0.005;
      
      if($.state.speed) {
        if($.state.keypress.left) {
          $.state.xpos += (Math.abs($.state.turn) + 7 + ($.state.speed > $.state.car.maxSpeed / 4 ? ($.state.car.maxSpeed - ($.state.speed / 2)) : $.state.speed)) * 0.2;
          $.state.turn -= 1;
        }
      
        if($.state.keypress.right) {
          $.state.xpos -= (Math.abs($.state.turn) + 7 + ($.state.speed > $.state.car.maxSpeed / 4 ? ($.state.car.maxSpeed - ($.state.speed / 2)) : $.state.speed)) * 0.2;
          $.state.turn += 1;
        }
        
        if($.state.turn !== 0 && !$.state.keypress.left && !$.state.keypress.right) {
          $.state.turn += $.state.turn > 0 ? -0.25 : 0.25;
        }
      }
      
      $.state.turn = clamp($.state.turn, -5, 5);
      $.state.speed = clamp($.state.speed, 0, $.state.car.maxSpeed);
      
      // section
      $.state.section -= $.state.speed;
      
      if($.state.section < 0) {
        $.state.section = randomRange(1000, 9000);
        
        newCurve = randomRange(-50, 50);
        
        if(Math.abs($.state.curve - newCurve) < 20) {
          newCurve = randomRange(-50, 50);
        }
        
        $.state.curve = newCurve;
      }
      
      if($.state.currentCurve < $.state.curve && move < Math.abs($.state.currentCurve - $.state.curve)) {
        $.state.currentCurve += move;
      } else if($.state.currentCurve > $.state.curve && move < Math.abs($.state.currentCurve - $.state.curve)) {
        $.state.currentCurve -= move;
      }
      
      if(Math.abs($.state.xpos) > 350) {
        $.state.speed *= 0.96;
      }
      
      $.state.xpos = clamp($.state.xpos, -400, 400);
      
      // Update React state
      setSpeed(Math.floor($.state.speed));
    }

    function drawMountain(pos: number, height: number, width: number) {
      $.ctx.fillStyle = $.colors.mountains;
      $.ctx.strokeStyle = $.colors.mountains;
      $.ctx.lineJoin = "round";
      $.ctx.lineWidth = 20;
      $.ctx.beginPath();
      $.ctx.moveTo(pos, $.settings.skySize);
      $.ctx.lineTo(pos + (width / 2), $.settings.skySize - height);
      $.ctx.lineTo(pos + width, $.settings.skySize);
      $.ctx.closePath();
      $.ctx.stroke();
      $.ctx.fill();
    }

    function drawBg() {
      $.ctx.fillStyle = $.colors.sky;
      $.ctx.fillRect(0, 0, $.canvas.width, $.settings.skySize);
      drawMountain(0, 60, 150);
      drawMountain(120, 40, 120);
      drawMountain(200, 80, 140);
      drawMountain(300, 60, 100);
      
      $.storage.bg = $.ctx.getImageData(0, 0, $.canvas.width, $.canvas.height);
    }

    function drawRoad(min: number, max: number, squishFactor: number, color: string | CanvasPattern) {
      const basePos = $.canvas.width + $.state.xpos;
      
      $.ctx.fillStyle = color;
      $.ctx.beginPath();
      $.ctx.moveTo(((basePos + min) / 2) - ($.state.currentCurve * 3), $.settings.skySize);
      $.ctx.quadraticCurveTo((((basePos / 2) + min)) + ($.state.currentCurve / 3) + squishFactor, $.settings.skySize + 52, (basePos + max) / 2, $.canvas.height);
      $.ctx.lineTo((basePos - max) / 2, $.canvas.height);
      $.ctx.quadraticCurveTo((((basePos / 2) - min)) + ($.state.currentCurve / 3) - squishFactor, $.settings.skySize + 52, ((basePos - min) / 2) - ($.state.currentCurve * 3), $.settings.skySize);
      $.ctx.closePath();
      $.ctx.fill();
    }

    function roundedRect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, width: number, height: number, radius: number, turn?: boolean, turneffect?: number) {
      const skew = turn === true ? $.state.turn * (turneffect || 0) : 0;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + radius, y - skew);
      
      // top right
      ctx.lineTo(x + width - radius, y + skew);
      ctx.arcTo(x + width, y + skew, x + width, y + radius + skew, radius);
      ctx.lineTo(x + width, y + radius + skew);
      
      // down right
      ctx.lineTo(x + width, (y + height + skew) - radius);
      ctx.arcTo(x + width, y + height + skew, (x + width) - radius, y + height + skew, radius);
      ctx.lineTo((x + width) - radius, y + height + skew);
      
      // down left
      ctx.lineTo(x + radius, y + height - skew);
      ctx.arcTo(x, y + height - skew, x, (y + height - skew) - radius, radius);
      ctx.lineTo(x, (y + height - skew) - radius);
      
      // top left
      ctx.lineTo(x, y + radius - skew);
      ctx.arcTo(x, y - skew, x + radius, y - skew, radius);
      ctx.lineTo(x + radius, y - skew);
      ctx.fill();
    }

    function drawCarBody(ctx: CanvasRenderingContext2D) {
      const startX = ($.canvas.width / 2) - 80; // Centered for our canvas
      const startY = $.canvas.height - 200;
      const lights = [10, 26, 134, 152];
      let lightsY = 0;
      
      /* Front */
      roundedRect($.ctx, "#C2C2C2", startX + 6 + ($.state.turn * 1.1), startY - 18, 146, 40, 18);
      
      ctx.beginPath(); 
      ctx.lineWidth = 12;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#FFFFFF";
      ctx.moveTo(startX + 30, startY);
      ctx.lineTo(startX + 46 + $.state.turn, startY - 25);
      ctx.lineTo(startX + 114 + $.state.turn, startY - 25);
      ctx.lineTo(startX + 130, startY);
      ctx.fill();
      ctx.stroke();
      /* END: Front */
      
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath(); 
      ctx.fillStyle = "#DEE0E2";
      ctx.strokeStyle = "#DEE0E2";
      ctx.moveTo(startX + 2, startY + 12 + ($.state.turn * 0.2));
      ctx.lineTo(startX + 159, startY + 12 + ($.state.turn * 0.2));
      ctx.quadraticCurveTo(startX + 166, startY + 35, startX + 159, startY + 55 + ($.state.turn * 0.2));
      ctx.lineTo(startX + 2, startY + 55 - ($.state.turn * 0.2));
      ctx.quadraticCurveTo(startX - 5, startY + 32, startX + 2, startY + 12 - ($.state.turn * 0.2));
      ctx.fill();
      ctx.stroke();

      ctx.beginPath(); 
      ctx.lineWidth = 12;
      ctx.fillStyle = "#DEE0E2";
      ctx.strokeStyle = "#DEE0E2";
      ctx.moveTo(startX + 30, startY);
      ctx.lineTo(startX + 40 + ($.state.turn * 0.7), startY - 15);
      ctx.lineTo(startX + 120 + ($.state.turn * 0.7), startY - 15);
      ctx.lineTo(startX + 130, startY);
      ctx.fill();
      ctx.stroke();
      
      roundedRect(ctx, "#474747", startX - 4, startY, 169, 10, 3, true, 0.2);
      roundedRect(ctx, "#474747", startX + 40, startY + 5, 80, 10, 5, true, 0.1);
      
      ctx.fillStyle = "#FF9166";
      
      lights.forEach(function(xPos) {
        ctx.beginPath();
        ctx.arc(startX + xPos, startY + 20 + lightsY, 6, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fill();
        lightsY += $.state.turn * 0.05;
      });
      
      ctx.lineWidth = 9;
      ctx.fillStyle = "#222222";
      ctx.strokeStyle = "#444";
      
      roundedRect($.ctx, "#FFF", startX + 60, startY + 25, 40, 18, 3, true, 0.05);
    }

    function drawCar() {
      const carWidth = 160;
      const carHeight = 50;
      const carX = ($.canvas.width / 2) - (carWidth / 2);
      const carY = $.canvas.height - 180;
      
      // shadow
      roundedRect($.ctx, "rgba(0, 0, 0, 0.35)", carX - 1 + $.state.turn, carY + (carHeight - 35), carWidth + 10, carHeight, 9);
      
      // tires
      roundedRect($.ctx, "#111", carX, carY + (carHeight - 30), 30, 40, 6);
      roundedRect($.ctx, "#111", (carX - 22) + carWidth, carY + (carHeight - 30), 30, 40, 6);
      
      drawCarBody($.ctx);
    }

    function drawGround(ctx: CanvasRenderingContext2D, offset: number, lightColor: string, darkColor: string, width: number) {
      let pos = ($.settings.skySize - $.settings.ground.min) + offset;
      let stepSize = 1;
      let drawDark = $.state.startDark;
      let firstRow = true;
      
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, $.settings.skySize, width, $.settings.ground.size);

      ctx.fillStyle = darkColor;
      while(pos <= $.canvas.height) {
        stepSize = norm(pos, $.settings.skySize, $.canvas.height) * $.settings.ground.max;
        if(stepSize < $.settings.ground.min) {
          stepSize = $.settings.ground.min;
        }
      
        if(drawDark) {
          if(firstRow) {
            ctx.fillRect(0, $.settings.skySize, width, stepSize - (offset > $.settings.ground.min ? $.settings.ground.min : $.settings.ground.min - offset));
          } else {
            ctx.fillRect(0, pos < $.settings.skySize ? $.settings.skySize : pos, width, stepSize);
          }
        }
        
        firstRow = false;
        pos += stepSize;
        drawDark = !drawDark;
      }
    }

    function drawPointer(ctx: CanvasRenderingContext2D, color: string, radius: number, centerX: number, centerY: number, angle: number) {
      const point = getCirclePoint(centerX, centerY, radius - 20, angle);
      const point2 = getCirclePoint(centerX, centerY, 2, angle + 90);
      const point3 = getCirclePoint(centerX, centerY, 2, angle - 90);
      
      ctx.beginPath();
      ctx.strokeStyle = "#FF9166";
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      ctx.moveTo(point2.x, point2.y);
      ctx.lineTo(point.x, point.y);
      ctx.lineTo(point3.x, point3.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 9, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
    }

    function drawTig(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, size: number) {
      const startPoint = getCirclePoint(x, y, radius - 4, angle);
      const endPoint = getCirclePoint(x, y, radius - size, angle);
      
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }

    function drawHUD(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, color: string) {
      const radius = 50;
      const tigs = [0, 90, 135, 180, 225, 270, 315];
      let angle = 90;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = 7;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
      
      for (let i = 0; i < tigs.length; i++) {
        drawTig(ctx, centerX, centerY, radius, tigs[i], 7);
      }
      
      // draw pointer
      angle = map($.state.speed, 0, $.state.car.maxSpeed, 90, 360);
      drawPointer(ctx, color, 50, centerX, centerY, angle);
    }

    function draw() {
      setTimeout(function() {
        if (!gameRunning) return;
        
        calcMovement();
        
        $.state.bgpos += ($.state.currentCurve * 0.02) * ($.state.speed * 0.2);
        $.state.bgpos = $.state.bgpos % $.canvas.width;
        
        $.ctx.putImageData($.storage.bg!, $.state.bgpos, 5);
        $.ctx.putImageData($.storage.bg!, $.state.bgpos > 0 ? $.state.bgpos - $.canvas.width : $.state.bgpos + $.canvas.width, 5);
        
        $.state.offset += $.state.speed * 0.05;
        if($.state.offset > $.settings.ground.min) {
          $.state.offset = $.settings.ground.min - $.state.offset;
          $.state.startDark = !$.state.startDark;
        }
        drawGround($.ctx, $.state.offset, $.colors.ground, $.colors.groundDark, $.canvas.width);
        
        drawRoad($.settings.road.min + 6, $.settings.road.max + 36, 10, $.colors.roadLine);
        drawGround($.ctx2, $.state.offset, $.colors.roadLine, $.colors.road, $.canvas.width);
        drawRoad($.settings.road.min, $.settings.road.max, 10, $.colors.road);
        drawRoad(3, 24, 0, $.ctx.createPattern($.canvas2!, 'repeat')!);
        drawCar();
        drawHUD($.ctx, 300, 150, $.colors.hud);
        
        animationId = requestAnimationFrame(draw);
      }, 1000 / $.settings.fps);
    }

    // Game controls
    function startGame() {
      gameRunning = true;
      setGameState('playing');
      draw();
    }

    function pauseGame() {
      gameRunning = false;
      setGameState('paused');
    }

    function resetGame() {
      gameRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      $.state.speed = 27;
      $.state.xpos = 0;
      $.state.curve = 0;
      $.state.currentCurve = 0;
      $.state.turn = 1;
      $.state.section = 50;
      $.state.offset = 0;
      $.state.bgpos = 0;
      setGameState('menu');
      setSpeed(0);
      
      // Redraw initial state
      $.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
      drawBg();
      drawGround($.ctx, $.state.offset, $.colors.ground, $.colors.groundDark, $.canvas.width);
      drawRoad($.settings.road.min + 6, $.settings.road.max + 36, 10, $.colors.roadLine);
      drawGround($.ctx2, $.state.offset, $.colors.roadLine, $.colors.road, $.canvas.width);
      drawRoad($.settings.road.min, $.settings.road.max, 10, $.colors.road);
      drawRoad(3, 24, 0, $.ctx.createPattern($.canvas2!, 'repeat')!);
      drawCar();
      drawHUD($.ctx, 300, 150, $.colors.hud);
    }

    // Event listeners
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    // Initial setup
    drawBg();
    resetGame();

    // Store controls in ref instead of window
    gameControlsRef.current = {
      start: startGame,
      pause: pauseGame,
      reset: resetGame
    };

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const handleStart = () => {
    if (gameState === 'menu' || gameState === 'paused') {
      gameControlsRef.current?.start();
    } else {
      gameControlsRef.current?.pause();
    }
  };

  const handleReset = () => {
    gameControlsRef.current?.reset();
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Game stats */}
      <div className="flex justify-center w-full text-sm font-bold">
        <div className="text-[var(--app-foreground)]">Speed: {speed} km/h</div>
      </div>
      
      {/* Game canvas */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={400}
          height={600}
          className="border border-[var(--app-card-border)] rounded-lg shadow-xl"
        />
        
        {/* Game overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">🏎️ Racing Game</h2>
              <p className="text-sm mb-4">Use arrow keys to control</p>
            </div>
          </div>
        )}
        
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <h2 className="text-xl font-bold">⏸️ PAUSED</h2>
            </div>
          </div>
        )}
      </div>

      {/* Hamburger Menu Controls */}
      <div className="w-full max-w-sm">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[var(--app-card-border)]">
          <div className="flex items-center justify-center space-x-4">
            {/* Play/Pause Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              className="flex-1"
            >
              {gameState === 'playing' ? '⏸️ Pause' : '▶️ Start'}
            </Button>
            
            {/* Reset Button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={handleReset}
              className="flex-1"
            >
              🔄 Reset
            </Button>
          </div>
          
          {/* Controls info */}
          <div className="mt-3 text-center text-xs text-[var(--app-foreground-muted)]">
            <p>🎮 Use ← → ↑ ↓ arrow keys</p>
          </div>
        </div>
      </div>
    </div>
  );
}