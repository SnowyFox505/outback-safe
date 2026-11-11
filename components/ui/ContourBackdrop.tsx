/** Faint topographic lines for full-screen backgrounds. Purely decorative. */
export function ContourBackdrop({ className = "" }: { className?: string }) {
  const lines = Array.from({ length: 16 }, (_, i) => {
    const base = 30 + i * 46;
    let d = "";
    for (let x = 0; x <= 400; x += 10) {
      const y =
        base +
        18 * Math.sin(x * 0.014 + i * 0.7) +
        10 * Math.sin(x * 0.035 + i * 1.3);
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
    }
    return d;
  });
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i === 9 ? "#d9a441" : "#ede6da"}
          strokeOpacity={i === 9 ? 0.5 : 0.06}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
