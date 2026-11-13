
import { useMemo, useState } from "react";

const features = {
  rainfall: {
    label: "Rainfall",
    key: "rainfall",
    unit: "mm",
    color: "#38bdf8",
  },
  temperature: {
    label: "Temperature",
    key: "temperature",
    unit: "°C",
    color: "#f59e0b",
  },
  soil: {
    label: "Soil Moisture",
    key: "soil",
    unit: "Fraction",
    color: "#34d399",
  },
  radiation: {
    label: "Solar Radiation",
    key: "radiation",
    unit: "MJ/m²",
    color: "#a78bfa",
  },
};

function FeatureVariation({ data }) {
  const [selectedFeature, setSelectedFeature] = useState("rainfall");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const feature = features[selectedFeature];

  const chartData = useMemo(() => {
    return data
      .map((item) => ({
        date: item.date,
        value: Number(item[feature.key]),
      }))
      .filter(
        (item) =>
          item.date &&
          Number.isFinite(item.value)
      );
  }, [data, feature.key]);

  if (chartData.length === 0) {
    return <div className="chart-error">No data available.</div>;
  }

  const values = chartData.map((item) => item.value);

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const average =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const width = 800;
  const height = 300;

  // Extra left padding makes space for Y-axis labels
  const left = 75;
  const right = 25;
  const top = 25;
  const bottom = 35;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const range = maximum - minimum || 1;

  const getX = (index) =>
    left +
    (index / Math.max(chartData.length - 1, 1)) * plotWidth;

  const getY = (value) =>
    top + ((maximum - value) / range) * plotHeight;

  const points = chartData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  const ticks = Array.from({ length: 5 }, (_, index) => {
    return maximum - (index / 4) * range;
  });

  const hoveredItem =
    hoveredIndex !== null ? chartData[hoveredIndex] : null;

  const formatDate = (date) => {
    const datePart = String(date).split("T")[0];
    const parsed = new Date(`${datePart}T00:00:00`);

    return Number.isNaN(parsed.getTime())
      ? datePart
      : parsed.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX =
      ((event.clientX - rect.left) / rect.width) * width;

    const fraction = Math.max(
      0,
      Math.min(1, (mouseX - left) / plotWidth)
    );

    const index = Math.round(
      fraction * (chartData.length - 1)
    );

    setHoveredIndex(index);
  };

  return (
    <div className="feature-variation-section">

      {/* HEADING */}

      <div className="feature-chart-heading">
        <div>
          <span className="chart-label">
            ENVIRONMENTAL PARAMETERS
          </span>

          <h2>Environmental Feature Variation</h2>

          <p>
            Explore how individual environmental parameters
            change over time.
          </p>
        </div>

        <select
          className="feature-select"
          value={selectedFeature}
          onChange={(e) => {
            setSelectedFeature(e.target.value);
            setHoveredIndex(null);
          }}
        >
          {Object.entries(features).map(([key, item]) => (
            <option key={key} value={key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* CHART TITLE */}

      <div className="feature-chart-title">
        <h3>{feature.label} Variation Over Time</h3>
        <span>{feature.unit}</span>
      </div>

      {/* HOVER VALUE DISPLAY */}

      <div className="feature-hover-info">
        {hoveredItem ? (
          <>
            <span>
              {formatDate(hoveredItem.date)}
            </span>

            <strong style={{ color: feature.color }}>
              {hoveredItem.value.toFixed(2)} {feature.unit}
            </strong>
          </>
        ) : (
          <span>Move your pointer over the chart to view values</span>
        )}
      </div>

      {/* INTERACTIVE LINE CHART */}

      <div
        className="feature-svg-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="feature-svg"
          role="img"
          aria-label={`${feature.label} variation over time`}
        >

          {/* Y AXIS LABELS AND GRID */}

          {ticks.map((tick, index) => {
            const y = top + (index / 4) * plotHeight;

            return (
              <g key={index}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="currentColor"
                  opacity="0.13"
                  strokeDasharray="4 5"
                />

                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.75"
                >
                  {tick.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* DATA LINE */}

          <polyline
            points={points}
            fill="none"
            stroke={feature.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* HOVER POINTER */}

          {hoveredItem && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={top}
                x2={getX(hoveredIndex)}
                y2={height - bottom}
                stroke={feature.color}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />

              <circle
                cx={getX(hoveredIndex)}
                cy={getY(hoveredItem.value)}
                r="7"
                fill={feature.color}
                stroke="#102b28"
                strokeWidth="3"
              />
            </g>
          )}

        </svg>
      </div>

      {/* DATE LABELS */}

      <div className="feature-date-labels">
        <span>{formatDate(chartData[0].date)}</span>
        <span>
          {formatDate(chartData[chartData.length - 1].date)}
        </span>
      </div>

      {/* STATISTICS */}

      <div className="feature-statistics">
        <div>
          <span>MINIMUM</span>
          <strong>{minimum.toFixed(2)}</strong>
          <small>{feature.unit}</small>
        </div>

        <div>
          <span>MAXIMUM</span>
          <strong>{maximum.toFixed(2)}</strong>
          <small>{feature.unit}</small>
        </div>

        <div>
          <span>AVERAGE</span>
          <strong>{average.toFixed(2)}</strong>
          <small>{feature.unit}</small>
        </div>
      </div>

      <p className="feature-record-count">
        Based on {chartData.length} available records.
      </p>

    </div>
  );
}

export default FeatureVariation;
