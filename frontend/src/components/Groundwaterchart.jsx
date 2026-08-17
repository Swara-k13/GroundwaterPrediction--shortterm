import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function GroundwaterChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: 10,
          bottom: 10
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.08)"
        />

        <XAxis
          dataKey="date"
          tick={{ fill: "#718987", fontSize: 11 }}
          tickFormatter={(value) => {
            const date = new Date(value);

            return date.toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric"
            });
          }}
        />

        <YAxis
          tick={{ fill: "#718987", fontSize: 11 }}
          label={{
            value: "Groundwater Level (m)",
            angle: -90,
            position: "insideLeft",
            fill: "#718987"
          }}
        />

        <Tooltip
          contentStyle={{
            background: "#102727",
            border: "1px solid rgba(101,207,192,0.25)",
            borderRadius: "10px"
          }}
          labelFormatter={(value) => {
            const date = new Date(value);

            return date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
          }}
          formatter={(value) => [
            `${Number(value).toFixed(2)} m`,
            "Groundwater"
          ]}
        />

        <Line
          type="monotone"
          dataKey="groundwater"
          stroke="#65cfc0"
          strokeWidth={3}
          dot={false}
          activeDot={{
            r: 5
          }}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}

export default GroundwaterChart;