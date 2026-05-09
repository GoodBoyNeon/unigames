import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Target, Zap, AlertCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Point {
  x: number;
  y: number;
}

interface Entity extends Point {
  width: number;
  height: number;
  speed: number;
  hp: number;
}

interface Projectile extends Point {
  speed: number;
  color: string;
  isPlayer: boolean;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Enemy extends Entity {
  type: "SCOUT" | "FIGHTER" | "BOMBER";
  angle: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface PowerupDrop extends Point {
  type: "MULTISHOT" | "RAPID" | "SHIELD" | "MEGA" | "REPAIR";
  life: number;
}

export default function GalaxyDefend() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<
    "START" | "PLAYING" | "GAMEOVER" | "PAUSED"
  >("START");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [highScore, setHighScore] = useLocalStorage<number>(
    "galaxy-defend-highscore",
    0,
  );
  const [lives, setLives] = useState(4);
  const [weaponTemp, setWeaponTemp] = useState(0);
  const [isOverheated, setIsOverheated] = useState(false);
  const weaponTempRef = useRef(0);
  const coreLockedRef = useRef(false);
  const [specialCharge, setSpecialCharge] = useState(0);
  const specialChargeRef = useRef(0);
  const [wave, setWave] = useState(1);
  const waveRef = useRef(1);
  const [stage, setStage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const stageRef = useRef(1);
  const isTransitioningRef = useRef(false);

  // Powerup state: tracks expiry time for each type
  const [activePowerups, setActivePowerups] = useState<Record<string, number>>(
    {},
  );
  const powerupRef = useRef<Record<string, number>>({});

  // Refs for high-frequency state (avoiding React re-renders for game loop)
  const playerRef = useRef<Entity>({
    x: 0,
    y: 0,
    width: 34,
    height: 34,
    speed: 6.5,
    hp: 100,
  });
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const powerupsRef = useRef<PowerupDrop[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const shakeRef = useRef(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Sync ref with state for use in game loop
  useEffect(() => {
    powerupRef.current = activePowerups;
  }, [activePowerups]);

  const POWERUP_WEIGHTS = [
    { type: "MULTISHOT", weight: 28 },
    { type: "RAPID", weight: 25 },
    { type: "SHIELD", weight: 25 },
    { type: "REPAIR", weight: 12 },
    { type: "MEGA", weight: 10 },
  ] as const;

  const STAGES = [
    { name: "NEBULA GATE", score: 0, mult: 1, color: "#22d3ee" }, // cyan-400
    { name: "ORION REACH", score: 8000, mult: 1.1, color: "#3b82f6" }, // blue-500
    { name: "VOID SECTOR", score: 20000, mult: 1.25, color: "#a855f7" }, // purple-500
    { name: "ASTEROID BELT", score: 36000, mult: 1.5, color: "#f97316" }, // orange-500
    { name: "PULSAR CORE", score: 60000, mult: 1.9, color: "#ef4444" }, // red-500
    { name: "WARP ZERO", score: 90000, mult: 2.4, color: "#ec4899" }, // pink-500
    { name: "GALAXY EDGE", score: 120000, mult: 3.0, color: "#eab308" }, // yellow-500
  ];

  // Initialize Stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 800,
      size: Math.random() * 2,
      speed: 0.5 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.5,
    }));
  }, []);

  // Initialize/Resize
  useEffect(() => {
    const resize = () => {
      if (gameAreaRef.current && canvasRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const availableWidth = rect.width;
        const availableHeight = rect.height;

        // Use narrower width for better shooter feel
        const maxWidth = Math.min(availableWidth - 32, 540);
        const height = availableHeight;

        canvasRef.current.width = maxWidth;
        canvasRef.current.height = height;

        // Spread stars across width
        starsRef.current.forEach((s) => (s.x = Math.random() * maxWidth));

        if (gameState === "START") {
          playerRef.current.x = maxWidth / 2;
          playerRef.current.y = height - 100;
        }
      }
    };

    // Use a small timeout to ensure DOM has settled for clientHeight/Width
    const timer = setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(timer);
    };
  }, [gameState]);

  const spawnExplosion = (x: number, y: number, color: string, amount = 15) => {
    shakeRef.current = Math.min(shakeRef.current + 6, 15);
    for (let i = 0; i < amount; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1 + Math.random(),
        color,
      });
    }
  };

  const spawnSteam = (x: number, y: number) => {
    for (let i = 0; i < 2; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -(1 + Math.random() * 2),
        life: 0.5 + Math.random() * 0.5,
        color: "rgba(255, 255, 255, 0.3)",
      });
    }
  };

  const spawnEnemy = useCallback(() => {
    if (!canvasRef.current) return;
    const currentStage = STAGES[stageRef.current - 1];
    const types: Enemy["type"][] = ["SCOUT", "FIGHTER", "BOMBER"];
    const type = types[Math.floor(Math.random() * types.length)];
    const width = type === "SCOUT" ? 30 : type === "FIGHTER" ? 42 : 56;
    const hp =
      ((type === "SCOUT" ? 1 : type === "FIGHTER" ? 2 : 5) +
        Math.floor(wave / 3)) *
      currentStage.mult;
    const speed =
      (1.5 + Math.random() * 1.2) *
      (0.8 + wave * 0.08) *
      (0.9 + currentStage.mult * 0.1);

    enemiesRef.current.push({
      x: Math.random() * (canvasRef.current.width - width) + width / 2,
      y: -60,
      width,
      height: width,
      speed,
      hp,
      type,
      angle: 0,
    });
  }, [wave]);

  const useSpecial = () => {
    if (specialChargeRef.current < 100) return;
    setSpecialCharge(0);
    specialChargeRef.current = 0;
    shakeRef.current = 25;
    enemiesRef.current.forEach((enemy) => {
      spawnExplosion(enemy.x, enemy.y, "#f59e0b", 25);
    });
    setScore((s) => s + enemiesRef.current.length * 150);
    enemiesRef.current = [];
  };

  const gameLoop = (time: number) => {
    if (gameState !== "PLAYING") return;

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Shake dampening
    if (shakeRef.current > 0.1) shakeRef.current *= 0.9;

    // Movement Logic
    const p = playerRef.current;
    if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) p.x -= p.speed;
    if (keysRef.current["ArrowRight"] || keysRef.current["d"]) p.x += p.speed;
    if (keysRef.current["ArrowUp"] || keysRef.current["w"]) p.y -= p.speed;
    if (keysRef.current["ArrowDown"] || keysRef.current["s"]) p.y += p.speed;

    // Boundaries
    p.x = Math.max(p.width / 2, Math.min(canvas.width - p.width / 2, p.x));
    p.y = Math.max(p.height / 2, Math.min(canvas.height - p.height / 2, p.y));

    // Powerup expiry check
    const now = time;
    let powerupsChanged = false;
    const updatedPowerups = { ...powerupRef.current };

    for (const type in updatedPowerups) {
      if (updatedPowerups[type] < now) {
        delete updatedPowerups[type];
        powerupsChanged = true;
      }
    }

    if (powerupsChanged) {
      setActivePowerups(updatedPowerups);
      powerupRef.current = updatedPowerups;
    }

    const hasPowerup = (type: string) => !!updatedPowerups[type];

    // Shooting
    const fireRate = hasPowerup("RAPID") ? 60 : hasPowerup("MEGA") ? 100 : 160;
    const isFiring = keysRef.current[" "];

    if (isFiring && time % fireRate < 20 && !coreLockedRef.current) {
      // Heating
      weaponTempRef.current = Math.min(
        100,
        weaponTempRef.current + (hasPowerup("RAPID") ? 1.2 : 3.5),
      );
      setWeaponTemp(weaponTempRef.current);

      if (weaponTempRef.current >= 100) {
        coreLockedRef.current = true;
        setIsOverheated(true);
      }

      if (hasPowerup("MULTISHOT")) {
        const pY = p.y - 15;
        projectilesRef.current.push({
          x: p.x - 12,
          y: pY,
          speed: -14,
          color: "#22d3ee",
          isPlayer: true,
        });
        projectilesRef.current.push({
          x: p.x + 12,
          y: pY,
          speed: -14,
          color: "#22d3ee",
          isPlayer: true,
        });
        projectilesRef.current.push({
          x: p.x,
          y: pY - 10,
          speed: -16,
          color: "#fbbf24",
          isPlayer: true,
        });
      } else if (hasPowerup("MEGA")) {
        projectilesRef.current.push({
          x: p.x,
          y: p.y - 25,
          speed: -18,
          color: "#f472b6",
          isPlayer: true,
        });
      } else {
        projectilesRef.current.push({
          x: p.x,
          y: p.y - 20,
          speed: -12,
          color: "#22d3ee",
          isPlayer: true,
        });
      }
    }

    // Cooling Logic
    if (coreLockedRef.current) {
      weaponTempRef.current = Math.max(0, weaponTempRef.current - 0.8);
      spawnSteam(p.x, p.y);
      if (weaponTempRef.current <= 0) {
        coreLockedRef.current = false;
        setIsOverheated(false);
      }
      setWeaponTemp(weaponTempRef.current);
    } else if (!isFiring) {
      weaponTempRef.current = Math.max(0, weaponTempRef.current - 1.2);
      setWeaponTemp(weaponTempRef.current);
    }

    // Update Stars
    starsRef.current.forEach((s) => {
      const speedMult = isTransitioningRef.current ? 15 : 1;
      s.y += s.speed * speedMult;
      if (s.y > canvas.height) {
        s.y = -s.size;
        s.x = Math.random() * canvas.width;
      }
    });

    // Update Entities
    projectilesRef.current = projectilesRef.current.filter((pr) => {
      pr.y += pr.speed;
      return pr.y > -50 && pr.y < canvas.height + 50;
    });

    enemiesRef.current.forEach((enemy) => {
      enemy.y += enemy.speed;
      enemy.angle += enemy.type === "SCOUT" ? 0.05 : 0.02;
    });

    powerupsRef.current.forEach((pw, idx) => {
      pw.y += 2;
      pw.life -= 0.005;
      if (pw.life <= 0 || pw.y > canvas.height)
        powerupsRef.current.splice(idx, 1);

      // Pick up
      if (Math.hypot(p.x - pw.x, p.y - pw.y) < p.width) {
        if (pw.type === "REPAIR") {
          setLives((l) => Math.min(4, l + 1));
          spawnExplosion(pw.x, pw.y, "#10b981", 10);
        } else {
          const duration = 9000;
          setActivePowerups((prev) => ({
            ...prev,
            [pw.type]: (prev[pw.type] > time ? prev[pw.type] : time) + duration,
          }));
        }
        powerupsRef.current.splice(idx, 1);
        setScore((s) => {
          const ns = s + 500;
          scoreRef.current = ns;
          return ns;
        });
        shakeRef.current = 5;
      }
    });

    // Wave Propagation
    projectilesRef.current.forEach((pr, prIdx) => {
      enemiesRef.current.forEach((en, enIdx) => {
        const dist = Math.hypot(pr.x - en.x, pr.y - en.y);
        if (dist < en.width / 1.8) {
          en.hp -= hasPowerup("MEGA") ? 3 : 1;
          projectilesRef.current.splice(prIdx, 1);
          if (en.hp <= 0) {
            const color =
              en.type === "BOMBER"
                ? "#ef4444"
                : en.type === "FIGHTER"
                  ? "#9333ea"
                  : "#c084fc";
            spawnExplosion(en.x, en.y, color, en.type === "BOMBER" ? 25 : 15);
            enemiesRef.current.splice(enIdx, 1);

            // Drop powerup
            if (Math.random() < 0.16) {
              const roll = Math.random() * 100;
              let currentWeight = 0;
              let selected: PowerupDrop["type"] = "RAPID";
              for (const p of POWERUP_WEIGHTS) {
                currentWeight += p.weight;
                if (roll <= currentWeight) {
                  selected = p.type;
                  break;
                }
              }

              powerupsRef.current.push({
                x: en.x,
                y: en.y,
                type: selected,
                life: 1,
              });
            }

            setScore((s) => {
              const add =
                en.type === "SCOUT" ? 100 : en.type === "FIGHTER" ? 250 : 600;
              const newScore = s + add;
              scoreRef.current = newScore;
              if (newScore > highScore) setHighScore(newScore);
              return newScore;
            });
            setSpecialCharge((prev) => {
              const ns = Math.min(100, prev + (en.type === "BOMBER" ? 10 : 5));
              specialChargeRef.current = ns;
              return ns;
            });
          }
        }
      });
    });

    // Player collision
    enemiesRef.current.forEach((en, enIdx) => {
      const dist = Math.hypot(p.x - en.x, p.y - en.y);
      if (dist < (p.width + en.width) / 2.8) {
        enemiesRef.current.splice(enIdx, 1);

        if (hasPowerup("SHIELD")) {
          spawnExplosion(en.x, en.y, "#22d3ee", 10);
          shakeRef.current += 3;
          setScore((s) => {
            const ns = s + 200;
            scoreRef.current = ns;
            return ns;
          });
          return;
        }

        spawnExplosion(p.x, p.y, "#ef4444", 30);
        setLives((l) => {
          if (l <= 1) setGameState("GAMEOVER");
          return l - 1;
        });
      }
      if (en.y > canvas.height + 50) {
        enemiesRef.current.splice(enIdx, 1);
        if (!hasPowerup("SHIELD")) {
          setLives((l) => {
            if (l <= 1) setGameState("GAMEOVER");
            return l - 1;
          });
        }
      }
    });

    // Particles logic
    particlesRef.current.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.015;
    });
    particlesRef.current = particlesRef.current.filter((pt) => pt.life > 0);

    // Spawning logic
    if (
      !isTransitioningRef.current &&
      Math.random() < 0.008 + waveRef.current * 0.003
    ) {
      spawnEnemy();
    }

    // Collision Detection
    if (scoreRef.current > waveRef.current * 6000) {
      setWave((w) => {
        const next = w + 1;
        waveRef.current = next;
        return next;
      });
    }

    // Stage Progression
    const sIdx = stageRef.current;
    if (sIdx < STAGES.length && scoreRef.current >= STAGES[sIdx].score) {
      setStage((s) => {
        const next = s + 1;
        stageRef.current = next;
        setIsTransitioning(true);
        isTransitioningRef.current = true;

        setTimeout(() => {
          setIsTransitioning(false);
          isTransitioningRef.current = false;
        }, 3000);
        return next;
      });
      // Clear screen on stage change
      enemiesRef.current = [];
      projectilesRef.current = [];
      shakeRef.current = 20;
    }

    // Drawing
    ctx.save();
    if (shakeRef.current > 0.1) {
      ctx.translate(
        (Math.random() - 0.5) * shakeRef.current,
        (Math.random() - 0.5) * shakeRef.current,
      );
    }

    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Atmospheric Nebula Glow
    const stageColor = STAGES[stageRef.current - 1].color;
    const nebulaGrad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.height,
    );
    nebulaGrad.addColorStop(0, `${stageColor}15`);
    nebulaGrad.addColorStop(1, "transparent");
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Starfield
    starsRef.current.forEach((s) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Draw Particles
    particlesRef.current.forEach((pt) => {
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw Powerups
    powerupsRef.current.forEach((pw) => {
      const colors = {
        MULTISHOT: "#fbbf24",
        RAPID: "#22d3ee",
        SHIELD: "#38bdf8",
        MEGA: "#f472b6",
        REPAIR: "#10b981",
      };
      const color = colors[pw.type];
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 + Math.sin(time / 100) * 5;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      const labels = {
        MULTISHOT: "POW",
        RAPID: "SPD",
        SHIELD: "GRD",
        MEGA: "ULT",
        REPAIR: "REP",
      };
      ctx.fillText(labels[pw.type], pw.x, pw.y + 3);
    });

    // Player
    const enginePulse = Math.sin(time / 50) * 6 + 10;
    ctx.fillStyle = `${stageColor}66`;
    ctx.shadowColor = stageColor;
    ctx.shadowBlur = enginePulse;
    ctx.beginPath();
    ctx.moveTo(p.x - 6, p.y + 12);
    ctx.lineTo(p.x, p.y + 12 + enginePulse);
    ctx.lineTo(p.x + 6, p.y + 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (hasPowerup("SHIELD")) {
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.width + 5 + Math.sin(time / 100) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(34, 211, 238, 0.1)";
      ctx.fill();
    }

    const currentStroke = hasPowerup("MEGA")
      ? "#f472b6"
      : hasPowerup("MULTISHOT")
        ? "#fbbf24"
        : hasPowerup("RAPID")
          ? "#22d3ee"
          : stageColor;
    ctx.strokeStyle = currentStroke;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = currentStroke;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 18);
    ctx.lineTo(p.x + 14, p.y + 14);
    ctx.lineTo(p.x, p.y + 8);
    ctx.lineTo(p.x - 14, p.y + 14);
    ctx.closePath();
    ctx.stroke();

    // Wings
    ctx.beginPath();
    ctx.moveTo(p.x + 8, p.y);
    ctx.lineTo(p.x + 20, p.y + 16);
    ctx.lineTo(p.x + 8, p.y + 10);
    ctx.moveTo(p.x - 8, p.y);
    ctx.lineTo(p.x - 20, p.y + 16);
    ctx.lineTo(p.x - 8, p.y + 10);
    ctx.stroke();

    // TACTICAL SHIP HUD (Direct visibility near ship)
    ctx.save();
    ctx.shadowBlur = 0;

    // 1. Right Side - Weapon Temp Bar
    const tempPercent = weaponTempRef.current / 100;
    const barHeight = 40;
    const barX = p.x + 35;
    const barY = p.y - barHeight / 2;

    // Bar Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(barX, barY, 3, barHeight);

    // Bar Fill
    const heatColor = coreLockedRef.current
      ? "#ef4444"
      : weaponTempRef.current > 75
        ? "#f97316"
        : weaponTempRef.current > 40
          ? "#fbbf24"
          : stageColor;
    ctx.fillStyle = heatColor;
    ctx.fillRect(
      barX,
      barY + barHeight - barHeight * tempPercent,
      3,
      barHeight * tempPercent,
    );

    // Temperature Label
    if (weaponTempRef.current > 20) {
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${Math.floor(weaponTempRef.current)}%`, barX + 6, p.y + 3);
    }

    // Overheat warning near ship
    if (coreLockedRef.current) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "black 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("CORE_LOCK", p.x, p.y - 30);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.width + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Left Side - Special Charge (Capacitor)
    const specPercent = specialChargeRef.current / 100;
    const lBarX = p.x - 38;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(lBarX, barY, 3, barHeight);

    ctx.fillStyle =
      specialCharge >= 100 ? "oklch(71.5% 0.143 215.221)" : "#ea580c";
    ctx.fillRect(
      lBarX,
      barY + barHeight - barHeight * specPercent,
      3,
      barHeight * specPercent,
    );
    if (specialCharge >= 100) {
      ctx.shadowColor = "oklch(71.5% 0.143 215.221)";
      ctx.shadowBlur = 10;
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "right";
      ctx.fillText("NOVA", lBarX - 6, p.y + 3);
    }

    ctx.restore();

    // Draw Projectiles
    projectilesRef.current.forEach((pr) => {
      ctx.fillStyle = pr.color;
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(pr.x - 1.5, pr.y - 6, 3, 12);
    });

    // Draw Enemies
    enemiesRef.current.forEach((en) => {
      const baseColor =
        en.type === "SCOUT"
          ? "#c084fc"
          : en.type === "FIGHTER"
            ? "#9333ea"
            : "#ef4444";
      ctx.strokeStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;

      ctx.save();
      ctx.translate(en.x, en.y);
      ctx.rotate(en.angle);

      ctx.beginPath();
      if (en.type === "SCOUT") {
        ctx.moveTo(0, -14);
        ctx.lineTo(14, 14);
        ctx.lineTo(0, 4);
        ctx.lineTo(-14, 14);
      } else if (en.type === "FIGHTER") {
        ctx.moveTo(-18, -18);
        ctx.lineTo(18, -18);
        ctx.lineTo(18, 18);
        ctx.lineTo(-18, 18);
        ctx.closePath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
      } else {
        ctx.moveTo(0, -26);
        ctx.lineTo(26, 0);
        ctx.lineTo(0, 26);
        ctx.lineTo(-26, 0);
        ctx.closePath();
        ctx.moveTo(-12, -12);
        ctx.lineTo(12, -12);
        ctx.lineTo(12, 12);
        ctx.lineTo(-12, 12);
        ctx.closePath();
      }
      ctx.stroke();

      if (en.hp > 1) {
        ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(en.x - 15, en.y - en.height / 2 - 12, 30, 4);
        ctx.fillStyle = baseColor;
        const maxHpForType = en.hp + 2; // Rough current hp tracking
        ctx.fillRect(
          en.x - 15,
          en.y - en.height / 2 - 12,
          Math.max(0, (en.hp / (en.hp + 1)) * 30),
          4,
        );
        ctx.save();
      }

      ctx.restore();
    });

    ctx.restore();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["x", "X", " ", "Escape"].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
      if (e.key === "x" || e.key === "X") useSpecial();
      if (e.key === " " && gameState === "START") setGameState("PLAYING");
      if (e.key === "Escape")
        setGameState((prev) =>
          prev === "PLAYING" ? "PAUSED" : prev === "PAUSED" ? "PLAYING" : prev,
        );
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, specialCharge]);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setLives(4);
    setWave(1);
    waveRef.current = 1;
    setStage(1);
    stageRef.current = 1;
    setIsTransitioning(false);
    isTransitioningRef.current = false;
    setWeaponTemp(0);
    weaponTempRef.current = 0;
    setIsOverheated(false);
    coreLockedRef.current = false;
    setSpecialCharge(0);
    specialChargeRef.current = 0;
    setActivePowerups({});
    powerupRef.current = {};
    enemiesRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    setGameState("PLAYING");
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#030612] overflow-hidden font-mono flex"
    >
      {/* Left Sidebar - Tactical Data */}
      <div className="hidden lg:flex flex-col w-56 border-r border-cyan-500/10 p-6 space-y-10 bg-black/40 backdrop-blur-sm relative overflow-hidden">
        {/* Background Grid Pattern for sidebar */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between text-cyan-400">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Cell Integrity
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500/50">
              {lives}/4
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`relative aspect-square border-2 transition-all duration-700 flex items-center justify-center overflow-hidden rounded-sm ${i < lives ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "border-white/5 bg-white/2 opacity-10"}`}
              >
                {i < lives && (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.3)_0%,transparent_70%)]" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        delay: i * 0.2,
                      }}
                      className="w-1.5 h-1.5 rotate-45 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      style={{ backgroundColor: STAGES[stage - 1].color }}
                    />
                    {lives === 1 && (
                      <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="absolute inset-0 bg-red-500/40"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-orange-400">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Nova Core
            </span>
          </div>
          <div className="relative h-48 bg-black/60 border border-white/5 rounded-sm overflow-hidden p-1">
            <div className="absolute inset-0 flex flex-col justify-around px-1 opacity-10">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-px bg-white w-full" />
              ))}
            </div>
            <motion.div
              className={`absolute bottom-0 left-0 right-0 transition-colors duration-500 ${specialCharge >= 100 ? "bg-cyan-500 shadow-[0_0_25px_oklch(99.5% 0.143 215.221)]" : "bg-orange-700"}`}
              initial={{ height: 0 }}
              animate={{ height: `${specialCharge}%` }}
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <span
              className={`text-[9px] ${
                specialCharge >= 100 ? "text-cyan-400/40" : "text-orange-500/60"
              } font-black`}
            >
              VOLT_0{Math.floor(specialCharge)}
            </span>
            <span
              className={`text-[9px] font-black uppercase ${specialCharge >= 100 ? "text-cyan-400 animate-pulse" : "text-orange-900"}`}
            >
              {specialCharge >= 100 ? "READY" : "CHARGING"}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-4 relative z-10">
          <div className="p-3 border border-pink-500/20 bg-pink-500/5 rounded-sm">
            <p className="text-[8px] text-pink-400/60 uppercase font-black tracking-widest mb-1">
              Stage 0{stage} / 07
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-black italic leading-none text-white">
                {STAGES[stage - 1].name.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div
        ref={gameAreaRef}
        className="flex-1 min-w-0 relative flex items-center justify-center bg-[#010204]"
      >
        {/* Playable Area Container */}
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="relative border-x border-cyan-500/10 bg-black shadow-[0_0_100px_rgba(0,0,0,1)]">
            {/* HUD - Locked to Playable Area Top */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-start z-10 px-6 pointer-events-none">
              <div className="text-left">
                <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest opacity-60">
                  Session_Score
                </p>
                <p className="text-2xl font-display font-black text-white italic tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {score.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest opacity-60">
                  High_Record
                </p>
                <p className="text-lg font-display font-black text-white/60 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {highScore.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Stage Transition Overlay */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-center"
                  >
                    <motion.div
                      className="h-px w-24 mx-auto mb-4"
                      style={{ backgroundColor: STAGES[stage - 1].color }}
                      animate={{ width: [0, 120, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p
                      className="text-xs font-black tracking-[0.5em] mb-2 uppercase opacity-60"
                      style={{ color: STAGES[stage - 1].color }}
                    >
                      Entering Stage_0{stage}
                    </p>
                    <h1 className="text-5xl font-display font-black italic text-white uppercase tracking-tighter">
                      {STAGES[stage - 1].name}
                    </h1>
                    <motion.div
                      className="mt-6 flex gap-2 justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-white rotate-45"
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Warp Lines Effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          top: "50%",
                          left: "50%",
                          width: 0,
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          width: "100px",
                          height: "2px",
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                          ease: "easeOut",
                        }}
                        className="absolute bg-white/40"
                        style={{
                          transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas ref={canvasRef} className="block relative z-0" />

            {/* Visual Environment / Cockpit Frame Effect */}
            <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black via-black/40 to-transparent z-5 pointer-events-none"></div>

            {/* Internal Scanlines overlay - only over canvas */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-1"
              style={{ backgroundSize: "100% 4px" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Status & Guides */}
      <div className="hidden lg:flex flex-col w-56 border-l border-cyan-500/10 p-6 space-y-10 bg-black/40 backdrop-blur-sm relative">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* WEAPON CORE TEMP - HEAT EXTRACTION MATRIX */}
        <div
          className={`relative z-10 p-4 border transition-all duration-500 overflow-hidden rounded-sm ${
            isOverheated
              ? "border-red-500 bg-red-500/10 shadow-[inner_0_0_20px_rgba(239,68,68,0.2)] animate-pulse"
              : weaponTemp > 75
                ? "border-orange-500/40 bg-orange-500/5"
                : "border-white/10 bg-black/20"
          }`}
          style={{
            borderColor:
              !isOverheated && weaponTemp <= 75
                ? `${STAGES[stage - 1].color}33`
                : undefined,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: isOverheated ? [0, 360] : [0, 90],
                  scale: weaponTemp > 75 ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  rotate: {
                    duration: isOverheated ? 0.5 : 2,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: { duration: 0.5, repeat: Infinity },
                }}
                className={`w-3 h-3 rotate-45 border-2`}
                style={{
                  borderColor: isOverheated
                    ? "#ef4444"
                    : weaponTemp > 75
                      ? "#f97316"
                      : STAGES[stage - 1].color,
                  boxShadow: isOverheated ? "0 0 10px #ef4444" : undefined,
                }}
              />
              <span
                className={`text-[10px] uppercase font-black tracking-[0.2em]`}
                style={{
                  color: isOverheated
                    ? "#ef4444"
                    : `${STAGES[stage - 1].color}cc`,
                }}
              >
                Thermal Core
              </span>
            </div>
            <span
              className={`text-[14px] font-mono font-black`}
              style={{ color: isOverheated ? "#ef4444" : "white" }}
            >
              {Math.floor(weaponTemp)}%
            </span>
          </div>

          {/* Segmented Matrix */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {[...Array(10)].map((_, i) => {
              const threshold = (i + 1) * 10;
              const isActive = weaponTemp >= threshold;
              const isMelting = isOverheated && isActive;

              return (
                <div
                  key={i}
                  className="relative h-6 bg-white/5 border border-white/10 overflow-hidden rounded-xs"
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isMelting ? [1, 0.4, 1] : 1,
                        backgroundColor: isOverheated
                          ? "#ef4444"
                          : weaponTemp > 75
                            ? "#f97316"
                            : weaponTemp > 40
                              ? "#fbbf24"
                              : STAGES[stage - 1].color,
                      }}
                      transition={{
                        opacity: { duration: 0.2, repeat: Infinity },
                      }}
                      className="absolute inset-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.3)]"
                    >
                      {isActive && (
                        <motion.div
                          animate={{ y: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-x-0 h-1/2 bg-linear-to-b from-transparent via-white/40 to-transparent"
                        />
                      )}
                    </motion.div>
                  )}
                  {/* Scanning line effect for active cells */}
                  {isActive && !isOverheated && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[8px] font-black tracking-widest uppercase">
              <span className={isOverheated ? "text-red-500" : "text-white/40"}>
                Status:
              </span>
              <span
                className={
                  isOverheated
                    ? "text-red-500"
                    : weaponTemp > 75
                      ? "text-orange-500"
                      : ""
                }
                style={{
                  color:
                    !isOverheated && weaponTemp <= 75
                      ? STAGES[stage - 1].color
                      : undefined,
                }}
              >
                {isOverheated
                  ? "!!! CORE LOCKED !!!"
                  : weaponTemp > 75
                    ? "DANGER: EXTREME"
                    : "Thermal_Optimal"}
              </span>
            </div>
            {isOverheated && (
              <div className="h-1 bg-red-950 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-1/3 h-full bg-red-500"
                />
              </div>
            )}
          </div>

          {/* Background Data Stream decoration */}
          <div className="absolute -right-2 -bottom-2 opacity-5 text-[40px] font-black select-none pointer-events-none">
            {Math.floor(weaponTemp)}
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-[10px] text-gray-500 uppercase font-black border-b border-white/10 pb-2 tracking-widest">
            Module Status
          </p>
          <div className="space-y-3">
            {[
              {
                id: "RAPID",
                label: "Quick-Fire",
                color: "cyan",
                icon: <Zap size={10} />,
              },
              {
                id: "MULTISHOT",
                label: "Bore Cannon",
                color: "yellow",
                icon: <Target size={10} />,
              },
              {
                id: "SHIELD",
                label: "Nova Shield",
                color: "blue",
                icon: <Shield size={10} />,
              },
              {
                id: "MEGA",
                label: "Overload",
                color: "pink",
                icon: <AlertCircle size={10} />,
              },
            ].map((p) => {
              const isActive = !!activePowerups[p.id];
              const colors = {
                cyan: "text-cyan-400 border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
                yellow:
                  "text-yellow-400 border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]",
                blue: "text-blue-400 border-blue-400 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.1)]",
                pink: "text-pink-400 border-pink-400 bg-pink-400/10 shadow-[0_0_15px_rgba(244,114,182,0.1)]",
              };
              return (
                <div
                  key={p.id}
                  className={`p-3 relative rounded-sm border transition-all duration-300 ${isActive ? colors[p.color as keyof typeof colors] : "border-white/5 bg-white/2 opacity-20 grayscale"}`}
                >
                  <p className="text-[10px] font-black uppercase flex items-center justify-between">
                    {p.label} {isActive && p.icon}
                  </p>
                  {isActive && (
                    <div className="h-1 mt-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        key={`${p.id}-${activePowerups[p.id]}`}
                        transition={{
                          duration: Math.max(
                            0,
                            (activePowerups[p.id] - lastTimeRef.current) / 1000,
                          ),
                          ease: "linear",
                        }}
                        className={`h-full bg-current`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto space-y-4 relative z-10">
          <div className="space-y-4 pt-6 border-t border-white/5">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              Protocol
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] text-white/30">
                <span>NAV</span>
                <span className="font-black text-white/60">WASD/ARROWS</span>
              </div>
              <div className="flex justify-between items-center text-[9px] text-white/30">
                <span>FIRE</span>
                <span className="font-black text-white/60">SPACE</span>
              </div>
              <div className="flex justify-between items-center text-[9px] text-white/30">
                <span>NOVA</span>
                <span className="font-black text-white/60">X-KEY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState !== "PLAYING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 z-20 text-center"
          >
            {gameState === "START" && (
              <div className="max-w-md space-y-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <h1 className="text-6xl md:text-8xl font-display font-black italic text-cyan-400 uppercase leading-none drop-shadow-[4px_4px_0px_rgba(34,211,238,0.2)]">
                    Galaxy
                    <br />
                    Defend
                  </h1>
                </motion.div>
                <div className="p-4 border-2 border-white/10 bg-white/5 space-y-4">
                  <p className="text-gray-300 text-sm leading-relaxed uppercase tracking-wide">
                    The galaxy is under attack! Take control of the Starship and
                    protect our home from waves of alien invaders.
                  </p>
                  <div className="flex justify-center gap-8 text-[10px] text-white/60">
                    <span className="flex items-center gap-2 font-black uppercase tracking-tighter">
                      <Zap size={12} className="text-yellow-400" /> Space to
                      Shoot
                    </span>
                    <span className="flex items-center gap-2 font-black uppercase tracking-tighter">
                      <Target size={12} className="text-cyan-400" /> Use X for
                      Special
                    </span>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="group relative px-12 py-4 bg-cyan-500 text-black font-black uppercase text-xl italic -skew-x-12 hover:bg-white transition-all shadow-[8px_8px_0px_rgba(34,211,238,0.3)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span className="inline-block skew-x-12">Play Now</span>
                  <div className="absolute inset-0 border-2 border-cyan-400 translate-x-2 translate-y-2 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
                </button>
                <p className="text-[10px] text-gray-500 animate-pulse uppercase tracking-[0.3em]">
                  Press SPACE to Start
                </p>
              </div>
            )}

            {gameState === "GAMEOVER" && (
              <div className="space-y-6">
                <div className="relative">
                  <h2 className="text-6xl md:text-8xl font-display font-black italic text-red-500 uppercase drop-shadow-[5px_5px_0px_#000]">
                    Game Over
                  </h2>
                  <div className="absolute -top-4 -right-4 bg-white text-black text-[10px] font-black px-2 py-1 rotate-12">
                    SECTOR LOST
                  </div>
                </div>
                <div className="bg-white border-4 border-black p-6 -rotate-1 shadow-[10px_10px_0px_#ef4444]">
                  <p className="text-black font-mono text-sm font-black uppercase mb-1">
                    Final Score
                  </p>
                  <p className="text-4xl text-red-600 font-display font-black italic">
                    {score.toLocaleString()}
                  </p>
                  {score >= highScore && score > 0 && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 uppercase tracking-tighter">
                      New High Score!
                    </p>
                  )}
                </div>
                <button
                  onClick={startGame}
                  className="w-full bg-red-600 text-white border-4 border-black py-4 font-black uppercase text-xl shadow-[6px_6px_0px_#000] hover:translate-x-1 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {gameState === "PAUSED" && (
              <div className="space-y-8">
                <h2 className="text-6xl font-display font-black italic text-yellow-400 uppercase">
                  Paused
                </h2>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setGameState("PLAYING")}
                    className="bg-yellow-400 text-black border-4 border-black px-12 py-4 font-black uppercase text-xl hover:translate-x-1 transition-all shadow-[8px_8px_0px_#000]"
                  >
                    Resume Game
                  </button>
                  <button
                    onClick={startGame}
                    className="text-white/40 font-black uppercase text-[10px] hover:text-white transition-colors tracking-widest"
                  >
                    Restart Mission
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CRT Glitch Effect Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] z-10"
        style={{ backgroundSize: "100% 4px, 3px 100%" }}
      ></div>
    </div>
  );
}
