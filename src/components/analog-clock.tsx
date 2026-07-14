"use client";
import { useEffect, useState, useId } from "react";
import { useThemeStore } from "@/lib/stores/theme-store";

interface AnalogClockProps {
  size?: number;
  className?: string;
}

export function AnalogClock({ size = 160, className = "" }: AnalogClockProps) {
  const [time, setTime] = useState(new Date());
  const { theme } = useThemeStore();
  const [isDark, setIsDark] = useState(false);
  const uniqueId = useId();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkDark = () => {
      if (theme === "dark") setIsDark(true);
      else if (theme === "light") setIsDark(false);
      else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    checkDark();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => { if (theme === "system") checkDark(); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  const center = size / 2;
  const radius = size / 2 - 8;

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const innerR = radius - 10;
    const outerR = radius - 2;
    return {
      x1: center + innerR * Math.cos(angle),
      y1: center + innerR * Math.sin(angle),
      x2: center + outerR * Math.cos(angle),
      y2: center + outerR * Math.sin(angle),
      label: i === 0 ? 12 : i,
      labelX: center + (radius - 22) * Math.cos(angle),
      labelY: center + (radius - 22) * Math.sin(angle),
    };
  });

  const minuteMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null;
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const innerR = radius - 5;
    const outerR = radius - 2;
    return {
      x1: center + innerR * Math.cos(angle),
      y1: center + innerR * Math.sin(angle),
      x2: center + outerR * Math.cos(angle),
      y2: center + outerR * Math.sin(angle),
    };
  }).filter((m): m is NonNullable<typeof m> => m !== null);

  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.7;
  const secondHandLength = radius * 0.8;

  const hourHandX = center + hourHandLength * Math.cos((hourAngle - 90) * (Math.PI / 180));
  const hourHandY = center + hourHandLength * Math.sin((hourAngle - 90) * (Math.PI / 180));
  const minuteHandX = center + minuteHandLength * Math.cos((minuteAngle - 90) * (Math.PI / 180));
  const minuteHandY = center + minuteHandLength * Math.sin((minuteAngle - 90) * (Math.PI / 180));
  const secondHandX = center + secondHandLength * Math.cos((secondAngle - 90) * (Math.PI / 180));
  const secondHandY = center + secondHandLength * Math.sin((secondAngle - 90) * (Math.PI / 180));

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Colors that adapt to dark/light mode
  const faceGradient = isDark ? `url(#clockFaceDark${uniqueId})` : `url(#clockFace${uniqueId})`;
  const hourHandColor = isDark ? "oklch(0.96 0.005 100)" : "oklch(0.15 0.02 250)";
  const hourMarkerColor = isDark ? "oklch(0.75 0.15 85)" : "oklch(0.35 0.15 155)";
  const minuteMarkerColor = isDark ? "oklch(0.65 0.02 250)" : "oklch(0.5 0.02 250)";
  const minuteHandColor = isDark ? "oklch(0.85 0.12 155)" : "oklch(0.35 0.15 155)";
  const numberColor = isDark ? "oklch(0.92 0.005 100)" : "oklch(0.15 0.02 250)";
  const shadowColor = isDark ? "oklch(0.60 0.20 155)" : "oklch(0.45 0.18 155)";

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`clockShadow${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={shadowColor} floodOpacity="0.3" />
          </filter>
          <radialGradient id={`clockFace${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.98 0.002 100)" />
            <stop offset="100%" stopColor="oklch(0.96 0.01 155)" />
          </radialGradient>
          <radialGradient id={`clockFaceDark${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.22 0.02 250)" />
            <stop offset="100%" stopColor="oklch(0.18 0.02 250)" />
          </radialGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={faceGradient}
          stroke="oklch(0.45 0.18 155)"
          strokeWidth="3"
          filter={`url(#clockShadow${uniqueId})`}
        />

        <circle
          cx={center}
          cy={center}
          r={radius - 2}
          fill="none"
          stroke="oklch(0.45 0.18 155)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {minuteMarkers.map((m, i) => (
          <line
            key={`min-${i}`}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke={minuteMarkerColor}
            strokeWidth="1"
          />
        ))}

        {hourMarkers.map((m, i) => (
          <g key={`hour-${i}`}>
            <line
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              stroke={hourMarkerColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x={m.labelX}
              y={m.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={numberColor}
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-sans), system-ui, sans-serif"
            >
              {m.label}
            </text>
          </g>
        ))}

        <line
          x1={center}
          y1={center}
          x2={hourHandX}
          y2={hourHandY}
          stroke={hourHandColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke={minuteHandColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <line
          x1={center}
          y1={center}
          x2={secondHandX}
          y2={secondHandY}
          stroke="oklch(0.75 0.15 85)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <circle cx={center} cy={center} r="4" fill={hourMarkerColor} />
        <circle cx={center} cy={center} r="2" fill="oklch(0.75 0.15 85)" />
      </svg>

      <div className="text-lg font-bold text-islamic-green font-mono tabular-nums">
        {timeString}
      </div>
      <p className="text-xs text-muted-foreground">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
