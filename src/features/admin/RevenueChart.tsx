"use client";

import { useEffect, useRef, useState } from "react";
import { formatDay, formatMoney, niceMax, type DayTotals } from "../../domain/admin/dashboard";
import styles from "./admin.module.css";

const AXIS = 52; // room for the dollar labels on the left
const BOTTOM = 26; // room for the dates

/**
 * Revenue per day as bars, one series in one colour. Drawn at the container's real width
 * (measured), so text and bars stay crisp instead of being stretched. Hovering or tapping a
 * day shows its revenue and orders; a table carries the same numbers for screen readers.
 */
export default function RevenueChart({ series }: { series: DayTotals[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const height = width < 500 ? 170 : 230;
  const plotWidth = Math.max(width - AXIS, 1);
  const plotHeight = height - BOTTOM;
  const max = niceMax(Math.max(...series.map((day) => day.revenueCents), 0) / 100) * 100;
  const step = plotWidth / Math.max(series.length, 1);
  const barWidth = Math.max(2, step - (step > 12 ? 6 : 2));
  const y = (cents: number) => plotHeight - (cents / max) * plotHeight;
  const ticks = width < 500 ? [0, max] : [0, max / 2, max];
  const dateLabels = new Set([0, Math.floor((series.length - 1) / 2), series.length - 1]);
  const hovered = active === null ? null : series[active];

  return (
    <div className={styles.chartFrame} ref={frame} onMouseLeave={() => setActive(null)}>
      <svg width={width} height={height} aria-hidden="true">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={AXIS} x2={width} y1={y(tick)} y2={y(tick)} className={styles.grid} />
            <text x={AXIS - 10} y={y(tick) + 4} textAnchor="end">
              {formatMoney(tick).replace(".00", "")}
            </text>
          </g>
        ))}
        {series.map((day, index) => {
          const x = AXIS + index * step + (step - barWidth) / 2;
          const top = y(day.revenueCents);
          const radius = Math.min(4, barWidth / 2, plotHeight - top);
          return (
            <g key={day.day} onMouseEnter={() => setActive(index)} onClick={() => setActive(index)}>
              {day.revenueCents > 0 && (
                <path
                  className={index === active ? styles.barOn : styles.bar}
                  d={`M${x} ${plotHeight}V${top + radius}a${radius} ${radius} 0 0 1 ${radius} -${radius}h${barWidth - radius * 2}a${radius} ${radius} 0 0 1 ${radius} ${radius}V${plotHeight}z`}
                />
              )}
              {/* A hit area the full height of the plot, wider than thin bars. */}
              <rect
                x={AXIS + index * step}
                y={0}
                width={step}
                height={plotHeight}
                fill="transparent"
              />
              {dateLabels.has(index) && (
                <text
                  x={AXIS + index * step + step / 2}
                  y={height - 6}
                  textAnchor={
                    index === 0 ? "start" : index === series.length - 1 ? "end" : "middle"
                  }
                >
                  {formatDay(day.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hovered && active !== null && (
        <p
          className={styles.tip}
          style={{
            left: Math.min(Math.max(AXIS + active * step + step / 2, 70), width - 70),
            top: Math.max(y(hovered.revenueCents) - 8, 30),
          }}
        >
          <span>
            {formatDay(hovered.day)} · {hovered.orders} {hovered.orders === 1 ? "order" : "orders"}
          </span>
          <strong>{formatMoney(hovered.revenueCents)}</strong>
        </p>
      )}
      {/* A table ignores the 1px box of srOnly, so the wrapper is the hidden one. */}
      <div className="srOnly">
        <table>
          <caption>Revenue by day</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Orders</th>
              <th scope="col">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {series.map((day) => (
              <tr key={day.day}>
                <th scope="row">{formatDay(day.day)}</th>
                <td>{day.orders}</td>
                <td>{formatMoney(day.revenueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
