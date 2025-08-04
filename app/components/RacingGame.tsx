"use client";

import { useEffect, useRef, useState } from "react";

interface GameControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function RacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControlsRef = useRef<GameControls | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'menu'>('menu');
  const leftControlRef = useRef<HTMLDivElement>(null);
  const rightControlRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 120 // Account for header and footer
      });
    };

    // Set initial size
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

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
          min: Math.max(60, canvasSize.width * 0.1),  // Scale with canvas width
          max: Math.min(450, canvasSize.width * 0.8), // Scale with canvas width
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
    $.canvas2.width = canvasSize.width;
    $.canvas2.height = canvasSize.height;
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
      
      // Auto-accelerate to a constant speed
      if ($.state.speed < $.state.car.maxSpeed / 1.5) {
        $.state.speed += $.state.car.acc;
      } else {
        $.state.speed -= $.state.car.friction / 2;
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
      // setSpeed(Math.floor($.state.speed)); // This line was removed as per the edit hint
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
      const startY = $.canvas.height - Math.min(200, $.canvas.height * 0.33);
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
      const carY = $.canvas.height - Math.min(180, $.canvas.height * 0.3);
      
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
        if (!gameRunning || !$.ctx2) return;
        
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
        drawGround($.ctx2!, $.state.offset, $.colors.roadLine, $.colors.road, $.canvas.width);
        drawRoad($.settings.road.min, $.settings.road.max, 10, $.colors.road);
        drawRoad(3, 24, 0, $.ctx.createPattern($.canvas2!, 'repeat')!);
        drawCar();
        drawHUD($.ctx, $.canvas.width - 100, 100, $.colors.hud);
        
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
      // setSpeed(0); // This line was removed as per the edit hint
      
      // Redraw initial state
      $.ctx.clearRect(0, 0, $.canvas.width, $.canvas.height);
      drawBg();
      drawGround($.ctx, $.state.offset, $.colors.ground, $.colors.groundDark, $.canvas.width);
      drawRoad($.settings.road.min + 6, $.settings.road.max + 36, 10, $.colors.roadLine);
      drawGround($.ctx2!, $.state.offset, $.colors.roadLine, $.colors.road, $.canvas.width);
      drawRoad($.settings.road.min, $.settings.road.max, 10, $.colors.road);
      drawRoad(3, 24, 0, $.ctx.createPattern($.canvas2!, 'repeat')!);
      drawCar();
      drawHUD($.ctx, $.canvas.width - 100, 100, $.colors.hud);
    }

    // Event listeners
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    const leftControl = leftControlRef.current;
    const rightControl = rightControlRef.current;

    const handleLeftPress = (e: TouchEvent | MouseEvent) => { 
      e.preventDefault(); 
      $.state.keypress.left = true; 
    };
    const handleLeftRelease = (e: TouchEvent | MouseEvent) => { 
      e.preventDefault(); 
      $.state.keypress.left = false; 
    };
    const handleRightPress = (e: TouchEvent | MouseEvent) => { 
      e.preventDefault(); 
      $.state.keypress.right = true; 
    };
    const handleRightRelease = (e: TouchEvent | MouseEvent) => { 
      e.preventDefault(); 
      $.state.keypress.right = false; 
    };

    if (leftControl && rightControl) {
      // Touch events for mobile
      leftControl.addEventListener('touchstart', handleLeftPress, { passive: false });
      leftControl.addEventListener('touchend', handleLeftRelease, { passive: false });
      rightControl.addEventListener('touchstart', handleRightPress, { passive: false });
      rightControl.addEventListener('touchend', handleRightRelease, { passive: false });
      
      // Mouse events for desktop compatibility
      leftControl.addEventListener('mousedown', handleLeftPress);
      leftControl.addEventListener('mouseup', handleLeftRelease);
      rightControl.addEventListener('mousedown', handleRightPress);
      rightControl.addEventListener('mouseup', handleRightRelease);
    }

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
      if (leftControl && rightControl) {
        leftControl.removeEventListener('touchstart', handleLeftPress);
        leftControl.removeEventListener('touchend', handleLeftRelease);
        rightControl.removeEventListener('touchstart', handleRightPress);
        rightControl.removeEventListener('touchend', handleRightRelease);
        leftControl.removeEventListener('mousedown', handleLeftPress);
        leftControl.removeEventListener('mouseup', handleLeftRelease);
        rightControl.removeEventListener('mousedown', handleRightPress);
        rightControl.removeEventListener('mouseup', handleRightRelease);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [canvasSize]);

  const handleStart = () => {
    if (gameState === 'menu' || gameState === 'paused') {
      gameControlsRef.current?.start();
    } else {
      gameControlsRef.current?.pause();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Game canvas container - Full Screen */}
      <div className="relative w-full h-full overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Game overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button 
              onClick={handleStart} 
              className="w-full h-full text-center text-white"
            >
              <h2 className="text-4xl font-bold mb-4">🏎️ Racing Game</h2>
              <p className="text-lg mb-4">Tap to Start</p>
            </button>
          </div>
        )}
        
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button 
              onClick={handleStart} 
              className="text-center text-white bg-gradient-to-br from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8 py-4 rounded-2xl shadow-2xl border border-white border-opacity-30 backdrop-blur-sm active:scale-95 transition-all duration-200"
            >
              <h2 className="text-3xl font-bold mb-2">⏸️ PAUSED</h2>
              <p className="text-lg">Tap to Resume</p>
              <div className="text-4xl mt-2">▶️</div>
            </button>
          </div>
        )}

        {/* HUD */}
        {gameState === 'playing' && (
          <>
            <div className="absolute top-4 left-4 text-white font-bold text-sm bg-black bg-opacity-60 px-4 py-2 rounded-full backdrop-blur-sm border border-white border-opacity-20">
              <p>LAP: 1/3</p>
            </div>
            <div className="absolute top-4 right-4 text-white font-bold text-sm bg-black bg-opacity-60 px-4 py-2 rounded-full backdrop-blur-sm border border-white border-opacity-20">
              <p>POS: 1/8</p>
            </div>
            
            {/* Pause Button */}
            <div 
              onClick={() => gameControlsRef.current?.pause()}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-2xl border-2 border-white border-opacity-30 backdrop-blur-sm active:scale-95 transition-transform duration-100 cursor-pointer"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(75, 85, 99, 0.9), rgba(31, 41, 55, 0.95))',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-white text-lg font-bold">⏸</div>
            </div>
          </>
        )}

        {/* Touch Controls */}
        {(gameState === 'playing' || gameState === 'menu') && (
          <>
            {/* Left Control */}
            <div 
              ref={leftControlRef}
              className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white border-opacity-30 backdrop-blur-sm active:scale-95 transition-transform duration-100"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.95))',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-white text-2xl font-bold drop-shadow-lg">←</div>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
            </div>
            
            {/* Right Control */}
            <div 
              ref={rightControlRef}
              className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white border-opacity-30 backdrop-blur-sm active:scale-95 transition-transform duration-100"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.95))',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-white text-2xl font-bold drop-shadow-lg">→</div>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}