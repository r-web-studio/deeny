"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface GoalCelebrationProps {
  show: boolean;
}

export function GoalCelebration({ show }: GoalCelebrationProps) {
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show || !confettiRef.current) return;

    const canvas = confettiRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      life: number;
    }[] = [];

    const colors = ["#F2C94C", "#E6C15A", "#F5DFA0", "#C9A23D", "#FFD700", "#FFF"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.rotationSpeed;
        p.life -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (alive) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <canvas
            ref={confettiRef}
            className="fixed inset-0 pointer-events-none z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-tasbeeh-card/95 dark:bg-tasbeeh-card/95 backdrop-blur-xl rounded-3xl px-8 py-6 shadow-2xl border border-tasbeeh-gold/20 text-center max-w-xs">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.2 }}
                className="w-14 h-14 rounded-full bg-tasbeeh-gold/15 flex items-center justify-center mx-auto mb-3"
              >
                <Trophy className="h-7 w-7 text-tasbeeh-gold" />
              </motion.div>
              <p className="text-lg font-semibold text-tasbeeh-text mb-1">
                Alhamdulillah!
              </p>
              <p className="text-sm text-tasbeeh-text-secondary">
                You completed today&apos;s Dhikr.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
