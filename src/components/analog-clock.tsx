"use client";
import { useEffect, useState } from "react";

interface AnalogClockProps {
  size?: number;
  className?: string;
}

export function AnalogClock({ size = 160, className = "" }: AnalogClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="oklch(0.45 0.18 155)" floodOpacity="0.3" />
          </filter>
          <radialGradient id="clockFace" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.98 0.002 100)" />
            <stop offset="100%" stopColor="oklch(0.96 0.01 155)" />
          </radialGradient>
          <radialGradient id="clockFaceDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.22 0.02 250)" />
            <stop offset="100%" stopColor="oklch(0.18 0.02 250)" />
          </radialGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#clockFace)"
          stroke="oklch(0.45 0.18 155)"
          strokeWidth="3"
          filter="url(#clockShadow)"
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
            stroke="oklch(0.5 0.02 250)"
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
              stroke="oklch(0.35 0.15 155)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x={m.labelX}
              y={m.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[10px] font-semibold"
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
          stroke="oklch(0.15 0.02 250)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1={center}
          y1={center}
          x2={minuteHandX}
          y2={minuteHandY}
          stroke="oklch(0.35 0.15 155)"
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

        <circle cx={center} cy={center} r="4" fill="oklch(0.35 0.15 155)" />
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
