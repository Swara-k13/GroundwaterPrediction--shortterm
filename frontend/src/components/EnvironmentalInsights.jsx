import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "../App.css";

const VARIABLES = [
  { key: "groundwater", label: "Groundwater level", short: "Groundwater", unit: "m" },
  { key: "rainfall", label: "Rainfall", short: "Rainfall", unit: "mm" },
  { key: "temperature", label: "Average temperature", short: "Temperature", unit: "°C" },
  { key: "soilMoisture", label: "Root-zone soil wetness", short: "Soil moisture", unit: "fraction" },
  { key: "solar", label: "Solar radiation", short: "Solar radiation", unit: "MJ/m²/day" },
];

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizedKey = (key) =>
  String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

function getValue(row, candidates) {
  const entries = Object.entries(row || {});
  const map = new Map(entries.map(([key, value]) => [normalizedKey(key), value]));

  for (const candidate of candidates) {
    const value = map.get(normalizedKey(candidate));
    if (value !== undefined) return value;
  }
  return null;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const raw = String(value).trim();
  // Dataset dates are commonly formatted as DD-MM-YYYY.
  const dmy = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmy) {
    const parsed = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pearson(valuesA, valuesB) {
  const pairs = valuesA
    .map((a, index) => [a, valuesB[index]])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));

  if (pairs.length < 3) return null;

  const meanA = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const meanB = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;

  let numerator = 0;
  let sumA = 0;
  let sumB = 0;

  pairs.forEach(([a, b]) => {
    numerator += (a - meanA) * (b - meanB);
    sumA += (a - meanA) ** 2;
    sumB += (b - meanB) ** 2;
  });

  const denominator = Math.sqrt(sumA * sumB);
  return denominator === 0 ? null : numerator / denominator;
}

function correlationLabel(value) {
  if (value === null) return "Insufficient data";
  const strength =
    Math.abs(value) >= 0.7 ? "Strong" :
    Math.abs(value) >= 0.4 ? "Moderate" :
    Math.abs(value) >= 0.2 ? "Weak" : "Very weak";
  return `${strength} ${value < 0 ? "negative" : "positive"} relationship`;
}

function formatNumber(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function CustomScatterTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  return (
    <div className="env-tooltip">
      <strong>{point.date || label || "Observation"}</strong>
      {Object.entries(point)
        .filter(([key]) => ["x", "y"].includes(key))
        .map(([key, value]) => (
          <div key={key}>
            {key === "x" ? "X" : "Y"}: {formatNumber(value, 3)}
          </div>
        ))}
    </div>
  );
}

function CorrelationHeatmap({ matrix }) {
  const colorFor = (value) => {
    if (value === null) return "rgba(148, 163, 184, 0.12)";
    const intensity = Math.max(0.08, Math.abs(value));
    return value >= 0
      ? `rgba(37, 150, 190, ${intensity})`
      : `rgba(220, 112, 92, ${intensity})`;
  };

  return (
    <div className="env-heatmap-wrap">
      <div className="env-heatmap">
        <div className="env-heatmap-corner" />
        {VARIABLES.map((variable) => (
          <div className="env-heatmap-top-label" key={variable.key}>
            {variable.short}
          </div>
        ))}

        {VARIABLES.map((rowVariable) => (
          <div className="env-heatmap-row" key={rowVariable.key}>
            <div className="env-heatmap-side-label">{rowVariable.short}</div>
            {VARIABLES.map((columnVariable) => {
              const value = matrix[rowVariable.key]?.[columnVariable.key] ?? null;
              return (
                <div
                  className="env-heatmap-cell"
                  key={columnVariable.key}
                  style={{ background: colorFor(value) }}
                  title={`${rowVariable.label} vs ${columnVariable.label}: ${
                    value === null ? "not available" : value.toFixed(3)
                  }`}
                >
                  {value === null ? "—" : value.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="env-heatmap-legend">
        <span><i className="negative" /> Negative</span>
        <span><i className="neutral" /> Near zero</span>
        <span><i className="positive" /> Positive</span>
      </div>
    </div>
  );
}

function EnvironmentalInsights({ data = [] }) {
  const [range, setRange] = useState("all");

  
const normalized = useMemo(() => {
  return (Array.isArray(data) ? data : [])
    .map((row) => ({
      date: parseDate(
        getValue(row, ["date", "Date", "datetime", "timestamp"])
      ),

      groundwater: numberOrNull(
        getValue(row, [
          "groundwater",
          "GW_Level_m",
          "groundwater_level",
          "gw_level"
        ])
      ),

      rainfall: numberOrNull(
        getValue(row, [
          "rainfall",
          "Rainfall_mm",
          "rainfall_mm",
          "precipitation"
        ])
      ),

      temperature: numberOrNull(
        getValue(row, [
          "temperature",
          "Avg_Temp_C",
          "avg_temp_c",
          "avg_temperature"
        ])
      ),

      soilMoisture: numberOrNull(
        getValue(row, [
          "soil",
          "Root_Zone_Soil_Wetness",
          "root_zone_soil_wetness",
          "soil_moisture"
        ])
      ),

      solar: numberOrNull(
        getValue(row, [
          "radiation",
          "Solar_Radiation_MJ_m2",
          "solar_radiation_mj_m2",
          "solar_radiation"
        ])
      )
    }))
    .filter(
      (row) => row.date && row.groundwater !== null
    )
    .sort((a, b) => a.date - b.date);
}, [data]);


  const filtered = useMemo(() => {
    if (range === "all" || !normalized.length) return normalized;
    const days = Number(range);
    const lastDate = normalized[normalized.length - 1].date;
    const cutoff = new Date(lastDate);
    cutoff.setDate(cutoff.getDate() - days + 1);
    return normalized.filter((row) => row.date >= cutoff);
  }, [normalized, range]);

  const analysis = useMemo(() => {
    const withAllFields = filtered.filter(
      (row) =>
        row.groundwater !== null &&
        row.rainfall !== null &&
        row.temperature !== null &&
        row.soilMoisture !== null &&
        row.solar !== null
    );

    const values = {
      groundwater: withAllFields.map((row) => row.groundwater),
      rainfall: withAllFields.map((row) => row.rainfall),
      temperature: withAllFields.map((row) => row.temperature),
      soilMoisture: withAllFields.map((row) => row.soilMoisture),
      solar: withAllFields.map((row) => row.solar),
    };

    const matrix = {};
    VARIABLES.forEach((rowVariable) => {
      matrix[rowVariable.key] = {};
      VARIABLES.forEach((columnVariable) => {
        matrix[rowVariable.key][columnVariable.key] = pearson(
          values[rowVariable.key],
          values[columnVariable.key]
        );
      });
    });

    const rainfallWindows = [3, 7, 15, 30];
    const accumulation = filtered.map((row, index) => {
      const result = {
        date: row.date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        fullDate: row.date.toLocaleDateString("en-IN"),
      };

      rainfallWindows.forEach((windowSize) => {
        const start = Math.max(0, index - windowSize + 1);
        const windowRows = filtered.slice(start, index + 1);
        result[`rain${windowSize}`] =
          windowRows.length === windowSize &&
          windowRows.every((item) => item.rainfall !== null)
            ? windowRows.reduce((sum, item) => sum + item.rainfall, 0)
            : null;
      });

      return result;
    });

    const scatter = {
      rainfall: filtered
        .filter((row) => row.rainfall !== null)
        .map((row) => ({
          x: row.rainfall,
          y: row.groundwater,
          date: row.date.toLocaleDateString("en-IN"),
        })),
      temperature: filtered
        .filter((row) => row.temperature !== null)
        .map((row) => ({
          x: row.temperature,
          y: row.groundwater,
          date: row.date.toLocaleDateString("en-IN"),
        })),
      soilMoisture: filtered
        .filter((row) => row.soilMoisture !== null)
        .map((row) => ({
          x: row.soilMoisture,
          y: row.groundwater,
          date: row.date.toLocaleDateString("en-IN"),
        })),
    };

    const groundwater = filtered.map((row) => row.groundwater);
    const rainfall = filtered.map((row) => row.rainfall).filter(Number.isFinite);
    const soil = filtered.map((row) => row.soilMoisture).filter(Number.isFinite);
    const average = (items) =>
      items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : null;

    const rainCorrelations = {};
    rainfallWindows.forEach((windowSize) => {
      const pairs = filtered.map((row, index) => {
        if (index < windowSize - 1) return [null, row.groundwater];
        const windowRows = filtered.slice(index - windowSize + 1, index + 1);
        if (windowRows.some((item) => item.rainfall === null)) return [null, row.groundwater];
        return [
          windowRows.reduce((sum, item) => sum + item.rainfall, 0),
          row.groundwater,
        ];
      });
      rainCorrelations[windowSize] = pearson(
        pairs.map((pair) => pair[0]),
        pairs.map((pair) => pair[1])
      );
    });

    return {
      matrix,
      accumulation,
      scatter,
      observations: filtered.length,
      averageGroundwater: average(groundwater),
      averageRainfall: average(rainfall),
      averageSoilMoisture: average(soil),
      groundwaterRainfallCorrelation: matrix.groundwater?.rainfall ?? null,
      rainCorrelations,
      firstDate: filtered[0]?.date,
      lastDate: filtered[filtered.length - 1]?.date,
    };
  }, [filtered]);

  const groundwaterRainfall = analysis.groundwaterRainfallCorrelation;
  const groundwaterSoil = analysis.matrix.groundwater?.soilMoisture;

  if (!normalized.length) {
    return (
      <section className="environmental-insights">
        <div className="env-section-heading">
          <span className="env-eyebrow">ENVIRONMENTAL ANALYSIS</span>
          <h2>Environmental Insights</h2>
          <p>
            Environmental columns were not found in the historical-data API
            response. Ensure Flask returns Date, Rainfall_mm, Avg_Temp_C,
            Root_Zone_Soil_Wetness and Solar_Radiation_MJ_m2 along with
            GW_Level_m.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="environmental-insights">
      <div className="env-section-heading">
        <div>
          <span className="env-eyebrow">ENVIRONMENTAL ANALYSIS</span>
          <h2>Environmental Insights</h2>
          <p>
            Explore how rainfall and climate variables move alongside
            groundwater levels in Varthur.
          </p>
        </div>

        <div className="env-range-control" aria-label="Select analysis period">
          {[
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
            { value: "all", label: "All data" },
          ].map((item) => (
            <button
              key={item.value}
              className={range === item.value ? "active" : ""}
              onClick={() => setRange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="env-kpi-grid">
        <article className="env-kpi-card">
          <span>OBSERVATIONS</span>
          <strong>{analysis.observations.toLocaleString("en-IN")}</strong>
          <small>Daily records in selected period</small>
        </article>
        <article className="env-kpi-card">
          <span>AVERAGE GROUNDWATER</span>
          <strong>{formatNumber(analysis.averageGroundwater, 3)} m</strong>
          <small>Mean recorded level</small>
        </article>
        <article className="env-kpi-card">
          <span>AVERAGE DAILY RAINFALL</span>
          <strong>{formatNumber(analysis.averageRainfall, 2)} mm</strong>
          <small>Across available records</small>
        </article>
        <article className="env-kpi-card">
          <span>AVERAGE SOIL WETNESS</span>
          <strong>{formatNumber(analysis.averageSoilMoisture, 3)}</strong>
          <small>Root-zone wetness fraction</small>
        </article>
      </div>

      <div className="env-chart-grid">
        <article className="env-card">
          <div className="env-card-heading">
            <div>
              <span>RELATIONSHIP ANALYSIS</span>
              <h3>Rainfall vs Groundwater</h3>
            </div>
            <small>mm vs m</small>
          </div>
          <div className="env-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 18, bottom: 22, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Rainfall"
                  unit=" mm"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Daily rainfall (mm)", position: "insideBottom", offset: -12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Groundwater"
                  unit=" m"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Groundwater (m)", angle: -90, position: "insideLeft" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter data={analysis.scatter.rainfall} fill="#2996b8" fillOpacity={0.62} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="env-chart-note">
            Pearson r: <strong>{formatNumber(groundwaterRainfall, 3)}</strong>
            <span>{correlationLabel(groundwaterRainfall)}</span>
          </p>
        </article>

        <article className="env-card">
          <div className="env-card-heading">
            <div>
              <span>RELATIONSHIP ANALYSIS</span>
              <h3>Temperature vs Groundwater</h3>
            </div>
            <small>°C vs m</small>
          </div>
          <div className="env-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 18, bottom: 22, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Temperature"
                  unit=" °C"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Average temperature (°C)", position: "insideBottom", offset: -12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Groundwater"
                  unit=" m"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Groundwater (m)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter data={analysis.scatter.temperature} fill="#d49a48" fillOpacity={0.62} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="env-chart-note">
            Pearson r: <strong>{formatNumber(analysis.matrix.groundwater?.temperature, 3)}</strong>
            <span>{correlationLabel(analysis.matrix.groundwater?.temperature)}</span>
          </p>
        </article>

        <article className="env-card">
          <div className="env-card-heading">
            <div>
              <span>RELATIONSHIP ANALYSIS</span>
              <h3>Soil Moisture vs Groundwater</h3>
            </div>
            <small>fraction vs m</small>
          </div>
          <div className="env-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 18, bottom: 22, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Soil moisture"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Root-zone soil wetness", position: "insideBottom", offset: -12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Groundwater"
                  unit=" m"
                  tick={{ fontSize: 11 }}
                  label={{ value: "Groundwater (m)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomScatterTooltip />} />
                <Scatter data={analysis.scatter.soilMoisture} fill="#5a9b79" fillOpacity={0.62} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="env-chart-note">
            Pearson r: <strong>{formatNumber(groundwaterSoil, 3)}</strong>
            <span>{correlationLabel(groundwaterSoil)}</span>
          </p>
        </article>

        <article className="env-card">
          <div className="env-card-heading">
            <div>
              <span>MULTI-VARIABLE ANALYSIS</span>
              <h3>Environmental Correlation Heatmap</h3>
            </div>
            <small>Pearson correlation</small>
          </div>
          <CorrelationHeatmap matrix={analysis.matrix} />
          <p className="env-footnote">
            Values range from -1 to +1. Correlation describes association, not causation.
          </p>
        </article>

        <article className="env-card env-card-wide">
          <div className="env-card-heading">
            <div>
              <span>RAINFALL ACCUMULATION</span>
              <h3>Rolling Rainfall — 3, 7, 15 and 30 Days</h3>
            </div>
            <small>mm</small>
          </div>
          <div className="env-chart env-chart-tall">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analysis.accumulation}
                margin={{ top: 12, right: 18, bottom: 8, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  minTickGap={28}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ""}
                  formatter={(value, name) => [
                    value === null ? "Not enough prior days" : `${formatNumber(value, 1)} mm`,
                    name,
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="rain3" name="3-day total" stroke="#d49a48" dot={false} connectNulls={false} strokeWidth={2} />
                <Line type="monotone" dataKey="rain7" name="7-day total" stroke="#2996b8" dot={false} connectNulls={false} strokeWidth={2} />
                <Line type="monotone" dataKey="rain15" name="15-day total" stroke="#5a9b79" dot={false} connectNulls={false} strokeWidth={2} />
                <Line type="monotone" dataKey="rain30" name="30-day total" stroke="#8b79b7" dot={false} connectNulls={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="env-rain-correlation">
            {[3, 7, 15, 30].map((days) => (
              <div key={days}>
                <span>{days}-day rainfall vs groundwater</span>
                <strong>{formatNumber(analysis.rainCorrelations[days], 3)}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="env-method-note">
        <strong>How to read these insights</strong>
        <p>
          Groundwater values in this dataset are negative depth measurements.
          A more negative value generally represents a deeper water table,
          while a value closer to zero represents a shallower water table.
          Correlations are descriptive and do not prove that one environmental
          variable caused a groundwater change. Rainfall totals use the
          available daily records in the selected period.
        </p>
      </div>
    </section>
  );
}

export default EnvironmentalInsights;
