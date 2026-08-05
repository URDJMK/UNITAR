"use client";

import { useEffect, useRef } from "react";
import type { Chart as ChartType, Plugin } from "chart.js";

type SignalPoint = { x: number; y: number };

function gaussian(value: number, center: number, width: number) {
  const distance = (value - center) / width;
  return Math.exp(-0.5 * distance * distance);
}

const signalPoints: SignalPoint[] = Array.from({ length: 240 }, (_, index) => {
  const time = (index / 239) * 1200;
  const envelope = Math.min(1,
    0.035 +
    gaussian(time, 155, 58) * 0.32 +
    gaussian(time, 355, 82) * 0.56 +
    gaussian(time, 620, 112) * 0.94 +
    gaussian(time, 865, 76) * 0.48 +
    gaussian(time, 1070, 52) * 0.7
  );
  const carrier =
    Math.sin(index * 0.82) * 0.61 +
    Math.sin(index * 1.73 + 0.55) * 0.25 +
    Math.sin(index * 2.91 + 1.2) * 0.11;
  return { x: Number(time.toFixed(2)), y: Number((envelope * carrier).toFixed(4)) };
});

const acousticField: Plugin<"line"> = {
  id: "acousticField",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const { left, right, top, bottom } = chartArea;
    const centerX = right - (right - left) * 0.08;
    const centerY = top + (bottom - top) / 2;
    const maxRadius = Math.hypot(right - left, bottom - top);

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
    ctx.strokeStyle = "rgba(231, 176, 100, 0.22)";
    ctx.lineWidth = 1;
    for (let radius = 28; radius < maxRadius; radius += 34) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },
};

export function VoiceSignalGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType<"line", SignalPoint[]> | null>(null);

  useEffect(() => {
    let active = true;

    void import("chart.js/auto").then(({ default: Chart }) => {
      if (!active || !canvasRef.current) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          datasets: [{
            data: signalPoints,
            borderColor: "#e3a04c",
            borderWidth: 1.8,
            pointRadius: 0,
            pointHitRadius: 12,
            tension: 0.08,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          normalized: true,
          parsing: false,
          animation: reduceMotion ? false : { duration: 1150, easing: "easeOutQuart" },
          interaction: { intersect: false, mode: "nearest", axis: "x" },
          layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              backgroundColor: "rgba(8, 40, 33, .94)",
              borderColor: "rgba(227, 160, 76, .58)",
              borderWidth: 1,
              titleColor: "#f7ead4",
              bodyColor: "#f7ead4",
              callbacks: {
                title: (items) => `t = ${Number(items[0]?.parsed.x ?? 0).toFixed(0)} ms`,
                label: (item) => `Normalized amplitude  ${Number(item.parsed.y ?? 0).toFixed(3)}`,
              },
            },
          },
          scales: {
            x: {
              type: "linear",
              min: 0,
              max: 1200,
              border: { color: "rgba(242, 229, 205, .42)" },
              grid: { color: "rgba(242, 229, 205, .12)", tickLength: 5 },
              ticks: {
                color: "rgba(247, 234, 212, .7)",
                font: { family: "ui-monospace, SFMono-Regular, Menlo, monospace", size: 9 },
                stepSize: 200,
                callback: (value) => `${value}`,
              },
              title: {
                display: true,
                text: "TIME / ms",
                color: "rgba(247, 234, 212, .66)",
                font: { family: "ui-monospace, SFMono-Regular, Menlo, monospace", size: 9, weight: 500 },
              },
            },
            y: {
              min: -1,
              max: 1,
              border: { color: "rgba(242, 229, 205, .42)" },
              grid: {
                color: (context) => context.tick.value === 0
                  ? "rgba(227, 160, 76, .58)"
                  : "rgba(242, 229, 205, .12)",
                lineWidth: (context) => context.tick.value === 0 ? 1.25 : 1,
                tickLength: 5,
              },
              ticks: {
                color: "rgba(247, 234, 212, .7)",
                font: { family: "ui-monospace, SFMono-Regular, Menlo, monospace", size: 9 },
                stepSize: 0.5,
                callback: (value) => Number(value).toFixed(1),
              },
              title: {
                display: true,
                text: "AMPLITUDE",
                color: "rgba(247, 234, 212, .66)",
                font: { family: "ui-monospace, SFMono-Regular, Menlo, monospace", size: 9, weight: 500 },
              },
            },
          },
        },
        plugins: [acousticField],
      });
    });

    return () => {
      active = false;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <figure className="signal-figure" aria-labelledby="signal-figure-title">
      <div className="signal-figure-head">
        <span><i aria-hidden="true" /> Acoustic field study · 01</span>
        <span>Illustrative voice trace</span>
      </div>
      <div className="signal-canvas-wrap">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Illustrative voice signal plotted as normalized amplitude over 1.2 seconds"
        >
          Voice signal plotted as normalized amplitude over time.
        </canvas>
      </div>
      <figcaption id="signal-figure-title">
        <span>Every voice leaves a pattern.</span>
        <small>Time-domain signal · normalized amplitude</small>
      </figcaption>
      <div className="signal-metrics" aria-hidden="true">
        <span><strong>1.2 s</strong> observation window</span>
        <span><strong>N = 240</strong> display samples</span>
        <span><strong>200 ms</strong> reference grid</span>
      </div>
    </figure>
  );
}
