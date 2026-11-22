interface RadarChartProps {
  data: {
    gameplay: number;
    graphics: number;
    story: number;
    sound: number;
    value: number;
  };
  size?: number;
  /** The score that reaches the outer ring. Game scores run from 0 to 10. */
  maxValue?: number;
}

export function RadarChart({ data, size = 300, maxValue = 10 }: RadarChartProps) {
  const categories = [
    { key: 'gameplay', label: 'Gameplay', value: data.gameplay },
    { key: 'graphics', label: 'Graphics', value: data.graphics },
    { key: 'story', label: 'Story', value: data.story },
    { key: 'sound', label: 'Sound', value: data.sound },
    { key: 'value', label: 'Value', value: data.value },
  ];

  const center = size / 2;
  const maxRadius = (size / 2) - 60;
  const levels = 5;
  const angleStep = (Math.PI * 2) / categories.length;

  function polarToCartesian(angle: number, radius: number) {
    return {
      x: center + radius * Math.cos(angle - Math.PI / 2),
      y: center + radius * Math.sin(angle - Math.PI / 2),
    };
  }

  const levelPaths = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius / levels) * (i + 1);
    const points = categories.map((_, index) => {
      const angle = angleStep * index;
      return polarToCartesian(angle, radius);
    });
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });

  const dataPoints = categories.map((cat, index) => {
    const angle = angleStep * index;
    // Clamp so a bad value can't draw outside the chart or through the center.
    const ratio = Math.min(Math.max(Number(cat.value) / maxValue, 0), 1);
    const radius = ratio * maxRadius;
    return polarToCartesian(angle, radius);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const axisLines = categories.map((_, index) => {
    const angle = angleStep * index;
    const end = polarToCartesian(angle, maxRadius);
    return { start: { x: center, y: center }, end };
  });

  const labels = categories.map((cat, index) => {
    const angle = angleStep * index;
    const labelRadius = maxRadius + 35;
    const pos = polarToCartesian(angle, labelRadius);
    return { ...pos, label: cat.label, value: cat.value };
  });

  return (
    <svg width={size} height={size} className="mx-auto">
      <defs>
        <radialGradient id="radarGradient">
          <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {levelPaths.map((path, i) => (
        <path
          key={i}
          d={path}
          fill="none"
          stroke="rgb(55, 65, 81)"
          strokeWidth="1"
          opacity={0.3}
        />
      ))}

      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.start.x}
          y1={line.start.y}
          x2={line.end.x}
          y2={line.end.y}
          stroke="rgb(75, 85, 99)"
          strokeWidth="1"
          opacity={0.5}
        />
      ))}

      <path
        d={dataPath}
        fill="url(#radarGradient)"
        stroke="rgb(6, 182, 212)"
        strokeWidth="2"
      />

      {dataPoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="rgb(6, 182, 212)"
          stroke="rgb(8, 145, 178)"
          strokeWidth="2"
        />
      ))}

      {labels.map((label, i) => (
        <g key={i}>
          <text
            x={label.x}
            y={label.y}
            textAnchor="middle"
            className="fill-gray-300 text-sm font-medium"
          >
            {label.label}
          </text>
          <text
            x={label.x}
            y={label.y + 16}
            textAnchor="middle"
            className="fill-cyan-400 text-xs font-bold"
          >
            {label.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
