// Budget meter for the landing hero. The needle sweeps once on load;
// static (final state) when the visitor prefers reduced motion.
const CX = 120, CY = 120, R = 92;
const polar = (deg, r) => {
  const a = (Math.PI * (180 - deg)) / 180; // 0deg = left end, 180deg = right end
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};

const MeterGauge = ({ percent = 71 }) => {
  const sweep = (percent / 100) * 180;
  const ticks = Array.from({ length: 11 }, (_, i) => i * 18);
  const [x0, y0] = polar(0, R), [x1, y1] = polar(180, R);
  const arc = `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;

  return (
    <svg viewBox="0 0 240 136" role="img" aria-label={`Budget meter showing ${percent} percent of the monthly budget used`} className="w-full h-auto">
      <style>{`
        .meter-arc { stroke-dasharray: 100; stroke-dashoffset: ${100 - percent}; animation: meterFill 1.4s cubic-bezier(.22,1,.36,1) .3s both; }
        .meter-needle { transform-origin: ${CX}px ${CY}px; transform: rotate(${sweep - 90}deg); animation: meterSweep 1.4s cubic-bezier(.22,1,.36,1) .3s both; }
        @keyframes meterFill { from { stroke-dashoffset: 100; } }
        @keyframes meterSweep { from { transform: rotate(-90deg); } }
        @media (prefers-reduced-motion: reduce) { .meter-arc, .meter-needle { animation: none; } }
      `}</style>
      <path d={arc} fill="none" stroke="#E7E3F4" strokeWidth="12" strokeLinecap="butt" pathLength="100" />
      <path className="meter-arc" d={arc} fill="none" stroke="#6D28D9" strokeWidth="12" strokeLinecap="butt" pathLength="100" />
      {ticks.map((deg, i) => {
        const [ax, ay] = polar(deg, R - 14), [bx, by] = polar(deg, R - (i % 5 === 0 ? 26 : 21));
        return <line key={deg} x1={ax} y1={ay} x2={bx} y2={by} stroke="#8B8A99" strokeWidth={i % 5 === 0 ? 1.8 : 1} />;
      })}
      <g className="meter-needle">
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 20} stroke="#1B1A2E" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <circle cx={CX} cy={CY} r="7" fill="#1B1A2E" />
      <circle cx={CX} cy={CY} r="2.5" fill="#FAF8F5" />
    </svg>
  );
};

export default MeterGauge;
