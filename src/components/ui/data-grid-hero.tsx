import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * A generative hero component with animated grid background.
 *
 * Props:
 * - rows: number of rows
 * - cols: number of columns
 * - spacing: gap between cells (px)
 * - duration: animation duration (s)
 * - color: cell color (CSS string)
 * - animationType: "pulse" | "wave" | "random"
 * - pulseEffect: enable pulse animation
 * - mouseGlow: enable mouse-follow glow
 * - opacityMin: minimum opacity
 * - opacityMax: maximum opacity
 * - background: container background (CSS string)
 */
export default function DataGridHero({ /* eslint-disable-line @typescript-eslint/no-explicit-any */
  rows,
  cols,
  spacing,
  duration,
  color,
  animationType,
  pulseEffect,
  mouseGlow,
  opacityMin,
  opacityMax,
  background,
  children,
}) {
  const gridRef = useRef(null);

  // Build grid cells on cfg change
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gap = `${spacing}px`;
    container.style.setProperty("--mouse-glow-opacity", mouseGlow ? 1 : 0);

    const total = rows * cols;
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.backgroundColor = color;
      cell.style.setProperty("--opacity-min", opacityMin);
      cell.style.setProperty("--opacity-max", opacityMax);

      if (pulseEffect) {
        let delay;
        const r = Math.floor(i / cols);
        const c = i % cols;

        if (animationType === "wave") {
          delay = (r + c) * 0.1;
        } else if (animationType === "random") {
          delay = Math.random() * duration;
        } else {
          const dr = Math.abs(r - centerRow);
          const dc = Math.abs(c - centerCol);
          delay = Math.sqrt(dr * dr + dc * dc) * 0.2;
        }

        cell.style.animation = `cell-pulse ${duration}s infinite alternate`;
        cell.style.animationDelay = `${delay.toFixed(3)}s`;
      }

      container.appendChild(cell);
    }
  }, [
    rows,
    cols,
    spacing,
    color,
    animationType,
    pulseEffect,
    duration,
    opacityMin,
    opacityMax,
    mouseGlow,
  ]);

  // Mouse-follow glow
  useEffect(() => {
    if (!mouseGlow || !gridRef.current) return;
    const handler = (e: MouseEvent) => {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gridRef.current.style.setProperty("--mouse-x", `${x}px`);
      gridRef.current.style.setProperty("--mouse-y", `${y}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseGlow]);

  return (
    <div className="data-grid-hero" style={{ background }}>
      <div
        ref={gridRef}
        className="grid-container"
        aria-hidden="true"
      />
      <div
        className="hero-content"
        role="region"
        aria-label="Hero Content"
      >
        {children}
      </div>
    </div>
  );
}

DataGridHero.propTypes = {
  rows: PropTypes.number.isRequired,
  cols: PropTypes.number.isRequired,
  spacing: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  animationType: PropTypes.oneOf(["pulse", "wave", "random"])
    .isRequired,
  pulseEffect: PropTypes.bool.isRequired,
  mouseGlow: PropTypes.bool.isRequired,
  opacityMin: PropTypes.number.isRequired,
  opacityMax: PropTypes.number.isRequired,
  background: PropTypes.string.isRequired,
  children: PropTypes.node,
};


interface DataGridHeroBackgroundProps {
  children?: React.ReactNode;
  // Expose DataGridHero props for customization
  rows?: number;
  cols?: number;
  spacing?: number;
  duration?: number;
  color?: string;
  animationType?: "pulse" | "wave" | "random";
  pulseEffect?: boolean;
  mouseGlow?: boolean;
  opacityMin?: number;
  opacityMax?: number;
  background?: string;
}

export const DataGridHeroBackground: React.FC<DataGridHeroBackgroundProps> = ({ children, ...props }) => {
  const [cfg, setCfg] = React.useState({
    rows: props.rows || 25,
    cols: props.cols || 35,
    spacing: props.spacing || 4,
    duration: props.duration || 5.0,
    color: props.color || "hsl(var(--green))",
    animationType: props.animationType || "pulse",
    pulseEffect: props.pulseEffect !== undefined ? props.pulseEffect : true,
    mouseGlow: props.mouseGlow !== undefined ? props.mouseGlow : true,
    opacityMin: props.opacityMin || 0.05,
    opacityMax: props.opacityMax || 0.6,
    background: props.background || "hsl(var(--background))",
  });

  // Update cfg if props change
  useEffect(() => {
    setCfg({
      rows: props.rows || 25,
      cols: props.cols || 35,
      spacing: props.spacing || 4,
      duration: props.duration || 5.0,
      color: props.color || "hsl(var(--green))",
      animationType: props.animationType || "pulse",
      pulseEffect: props.pulseEffect !== undefined ? props.pulseEffect : true,
      mouseGlow: props.mouseGlow !== undefined ? props.mouseGlow : true,
      opacityMin: props.opacityMin || 0.05,
      opacityMax: props.opacityMax || 0.6,
      background: props.background || "hsl(var(--background))",
    });
  }, [props]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <DataGridHero {...cfg}> {/* The component itself expects children, but we're using it as a background here. */}
        {/* We can pass children here if DataGridHero's internal structure is suitable for overlaying content. */}
      </DataGridHero>
      <div className="absolute inset-0 z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
