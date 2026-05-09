"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Point {
  x: number;
  y: number;
}
const GRID_WIDTH = 32;
const GRID_HEIGHT = 16;
const INITIAL_SNAKE: Point[] = [
  { x: 15, y: 10 },
  { x: 15, y: 11 },
  { x: 15, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: 1 };

interface PowerUp {
  position: Point;
  type: "SPEED" | "SLOW" | "DOUBLE";
  expiry: number;
}

type Difficulty = "NOVICE" | "VETERAN" | "INSANE";

const DIFFICULTY_MAP: Record<Difficulty, { speed: number; growth: number }> = {
  NOVICE: { speed: 180, growth: 1 },
  VETERAN: { speed: 130, growth: 1 },
  INSANE: { speed: 80, growth: 1 },
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>("VETERAN");
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [powerUp, setPowerUp] = useState<PowerUp | null>(null);

  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Point>(INITIAL_DIRECTION);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage<number>(
    "snake-highscore",
    0,
  );
  const [speed, setSpeed] = useState(DIFFICULTY_MAP.VETERAN.speed);
  const [multiplier, setMultiplier] = useState(1);

  // Responsive Canvas Setup
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const uiHeight = 160;
        const padding = window.innerWidth < 768 ? 24 : 48;

        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - uiHeight - padding;

        const cellSize = Math.floor(
          Math.min(
            availableWidth / GRID_WIDTH,
            availableHeight / GRID_HEIGHT,
            16,
          ),
        );

        const width = cellSize * GRID_WIDTH;
        const height = cellSize * GRID_HEIGHT;

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
      }
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateCanvasSize();
    return () => resizeObserver.disconnect();
  }, []);

  const getRandomPos = useCallback(
    (currentSnake: Point[], blockedPos?: Point) => {
      let pos: { x: number; y: number };
      while (true) {
        pos = {
          x: Math.floor(Math.random() * GRID_WIDTH),
          y: Math.floor(Math.random() * GRID_HEIGHT),
        };
        const isOnSnake = currentSnake.some(
          (s) => s.x === pos.x && s.y === pos.y,
        );
        const isBlocked =
          blockedPos && blockedPos.x === pos.x && blockedPos.y === pos.y;
        if (!isOnSnake && !isBlocked) break;
      }
      return pos;
    },
    [],
  );

  const spawnPowerUp = useCallback(
    (currentSnake: Point[]) => {
      if (Math.random() > 0.08) return; // Slightly higher chance

      const types: PowerUp["type"][] = ["SPEED", "SLOW", "DOUBLE"];
      const type = types[Math.floor(Math.random() * types.length)];

      setPowerUp({
        position: getRandomPos(currentSnake, food),
        type,
        expiry: Date.now() + 6000, // 6 seconds
      });
    },
    [getRandomPos, food],
  );

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(true);
    setFood(getRandomPos(INITIAL_SNAKE));
    setPowerUp(null);
    setSpeed(DIFFICULTY_MAP[difficulty].speed);
    setMultiplier(1);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + nextDirection.x + GRID_WIDTH) % GRID_WIDTH,
        y: (head.y - nextDirection.y + GRID_HEIGHT) % GRID_HEIGHT,
      };

      setDirection(nextDirection);

      if (
        prevSnake.some((part) => part.x === newHead.x && part.y === newHead.y)
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10 * multiplier;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(getRandomPos(newSnake));
        setSpeed((prev) => Math.max(50, prev - 1));
        spawnPowerUp(newSnake);
      } else if (
        powerUp &&
        newHead.x === powerUp.position.x &&
        newHead.y === powerUp.position.y
      ) {
        // Apply Powerup
        if (powerUp.type === "SPEED") {
          setSpeed((prev) => Math.max(40, prev - 30));
          setMultiplier((prev) => prev + 2);
          setTimeout(() => {
            setSpeed(DIFFICULTY_MAP[difficulty].speed);
            setMultiplier(1);
          }, 4000);
        } else if (powerUp.type === "SLOW") {
          setSpeed((prev) => prev + 40);
          setTimeout(() => setSpeed(DIFFICULTY_MAP[difficulty].speed), 4000);
        } else if (powerUp.type === "DOUBLE") {
          setMultiplier((prev) => prev * 2);
          setTimeout(() => setMultiplier(1), 6000);
        }
        setPowerUp(null);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    // Handle powerup expiry
    if (powerUp && powerUp.expiry < Date.now()) {
      setPowerUp(null);
    }
  }, [
    nextDirection,
    food,
    powerUp,
    isGameOver,
    isPaused,
    getRandomPos,
    highScore,
    multiplier,
    difficulty,
    spawnPowerUp,
  ]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
        case "k":
        case "K":
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
        case "j":
        case "J":
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
        case "h":
        case "H":
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
        case "l":
        case "L":
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  // Game Loop
  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = canvas.width / GRID_WIDTH;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Pulse animation factor
    const pulse = Math.sin(Date.now() / 200) * 2;

    // Food
    ctx.shadowBlur = 15 + pulse;
    ctx.shadowColor = "#ff3e3e";
    ctx.fillStyle = "#ff3e3e";
    ctx.fillRect(
      food.x * cellSize + 4 - pulse / 2,
      food.y * cellSize + 4 - pulse / 2,
      cellSize - 8 + pulse,
      cellSize - 8 + pulse,
    );

    // Powerup
    if (powerUp) {
      const colors = { SPEED: "#fbbf24", SLOW: "#22d3ee", DOUBLE: "#f472b6" };
      ctx.shadowColor = colors[powerUp.type];
      ctx.shadowBlur = 20 + pulse * 2;
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      const radius = cellSize / 3 + pulse / 2;
      ctx.arc(
        powerUp.position.x * cellSize + cellSize / 2,
        powerUp.position.y * cellSize + cellSize / 2,
        Math.max(2, radius),
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Timer ring
      const remaining = (powerUp.expiry - Date.now()) / 6000;
      if (remaining > 0) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(
          powerUp.position.x * cellSize + cellSize / 2,
          powerUp.position.y * cellSize + cellSize / 2,
          cellSize / 2.5,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * remaining,
        );
        ctx.stroke();
      }
    }

    // Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = multiplier > 1 ? "#fbbf24" : "#9333ea";
    snake.forEach((part, index) => {
      ctx.fillStyle =
        index === 0 ? "#c084fc" : multiplier > 1 ? "#fbbf24" : "#9333ea";
      ctx.fillRect(
        part.x * cellSize + 1,
        part.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      );
    });

    ctx.shadowBlur = 0;
  }, [snake, food, powerUp, multiplier]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-gray-950 p-4 md:p-8 border-4 border-black"
    >
      {/* HUD */}
      <div className="w-full max-w-125 flex justify-between items-end">
        <div className="bg-black border-2 border-purple-500 px-3 py-1 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]">
          <p className="text-[8px] font-mono text-purple-400 uppercase font-bold mb-0.5">
            Score
          </p>
          <p className="text-xl md:text-2xl font-display font-black text-white italic">
            {score.toString().padStart(4, "0")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1.5">
            <div
              className={`w-2 h-2 border border-black ${!isPaused ? "bg-green-500" : "bg-gray-800"}`}
            ></div>
            <div
              className={`w-2 h-2 border border-black ${isGameOver ? "bg-red-500 font-bold" : "bg-gray-800"}`}
            ></div>
            {multiplier > 1 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity }}
                className="w-2 h-2 bg-yellow-400"
              ></motion.div>
            )}
          </div>
          <p className="font-mono text-[7px] text-gray-500 uppercase tracking-tighter">
            Difficulty: {difficulty}
          </p>
        </div>

        <div className="bg-black border-2 border-yellow-400 px-3 py-1 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] text-right">
          <p className="text-[8px] font-mono text-yellow-500 uppercase font-bold mb-0.5">
            Best
          </p>
          <p className="text-xl md:text-2xl font-display font-black text-white italic">
            {highScore.toString().padStart(4, "0")}
          </p>
        </div>
      </div>

      {/* Arcade Monitor */}
      <div className="relative border-12 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.5)] bg-black overflow-visible flex items-center justify-center">
        <canvas ref={canvasRef} className="display-block" />

        {/* Overlay States */}
        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 text-center overflow-hidden"
            >
              {isGameOver ? (
                <div className="w-full max-w-60 md:max-w-[320px] space-y-4">
                  <h2 className="text-3xl md:text-5xl font-display font-black italic uppercase text-red-500 drop-shadow-[2px_2px_0px_#000] leading-none">
                    Oof.
                    <br />
                    You died
                  </h2>
                  <div className="bg-white border-2 border-black p-3 -rotate-1 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                    <p className="font-mono text-[9px] text-black uppercase font-black">
                      Final Score:{" "}
                      <span className="text-red-600 text-sm">{score}</span>
                    </p>
                    {score >= highScore && score > 0 && (
                      <p className="text-[7px] text-green-600 font-bold mt-0.5 uppercase tracking-tighter">
                        New high score!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={resetGame}
                    className="w-full bg-purple-600 text-white border-4 border-black py-2 md:py-3 font-black uppercase text-xs md:text-sm hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    One more try (you got this)
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-60 md:max-w-[320px] space-y-6">
                  <h2 className="text-4xl md:text-6xl font-display font-black italic uppercase text-yellow-400 drop-shadow-[2px_2px_0px_#000]">
                    Standby
                  </h2>

                  {/* Difficulty Selection */}
                  <div className="grid grid-cols-3 gap-1">
                    {(["NOVICE", "VETERAN", "INSANE"] as Difficulty[]).map(
                      (d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDifficulty(d);
                            setSpeed(DIFFICULTY_MAP[d].speed);
                          }}
                          className={`p-1 border-2 border-black text-[7px] md:text-[9px] font-mono font-bold transition-all ${difficulty === d ? "bg-white text-black underline" : "bg-gray-800 text-gray-400"}`}
                        >
                          {d}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full bg-green-500 text-white border-4 border-gray-800 py-2.5 md:py-4 font-black uppercase text-base md:text-xl hover:translate-x-1 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Play
                    </button>
                    <p className="text-white/30 font-mono text-[9px] uppercase tracking-widest animate-pulse">
                      Sync via Space
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanlines Effect Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10"
          style={{ backgroundSize: "100% 2px" }}
        ></div>
      </div>

      {/* Legend & Stats */}
      <div className="w-full max-w-125 flex flex-wrap gap-2 justify-center">
        <div className="flex gap-4 p-2 border border-white/10 rounded font-mono text-[8px] text-gray-500 uppercase font-bold">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-red-500"></div> CORE: +10
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div> SLOW:
            SLOW TO STABILIZE
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> BOLT:
            3X SCORE
          </span>
        </div>
      </div>
    </div>
  );
}
