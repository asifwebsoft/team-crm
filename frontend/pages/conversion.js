import { useEffect, useState } from "react";
import { Card, Row, Col, Progress, Table, Tag } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
];

export default function Conversion() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/leads/team-performance/")
      .then((res) => {
        // 🔥 sort already but safety
        const sorted = res.data.sort(
          (a, b) => b.conversion - a.conversion
        );
        setData(sorted);
      })
      .catch((err) => console.log(err));
  }, []);

  // 🔥 BADGE FUNCTION
  const getBadge = (index) => {
    if (index === 0) return <Tag color="gold">🥇 Top Performer</Tag>;
    if (index === 1) return <Tag color="silver">🥈</Tag>;
    if (index === 2) return <Tag color="orange">🥉</Tag>;
    return null;
  };

  // 🔥 TABLE (Leaderboard)
  const columns = [
    {
      title: "Rank",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      render: (_, record, index) => (
        <>
          {record.name} {getBadge(index)}
        </>
      ),
    },
    { title: "Total Leads", dataIndex: "total" },
    { title: "Closed", dataIndex: "closed" },
    {
      title: "Conversion %",
      dataIndex: "conversion",
      render: (val) => <b>{val}%</b>,
    },
  ];

  return (
    <MainLayout>
      <h2>🔥 Conversion Dashboard</h2>

      {/* 🔥 CARDS */}
      <Row gutter={[16, 16]}>
        {data.map((item, i) => (
          <Col xs={24} md={8} key={i}>
            <Card
              style={{
                border:
                  i === 0
                    ? "2px solid gold"
                    : i === 1
                    ? "2px solid silver"
                    : i === 2
                    ? "2px solid orange"
                    : "1px solid #eee",
                borderRadius: 12,
              }}
            >
              <h3>
                {item.name} {getBadge(i)}
              </h3>

              <p>Total: {item.total}</p>
              <p>Closed: {item.closed}</p>

              <Progress
                percent={item.conversion}
                strokeColor={
                  i === 0 ? "#FFD700" : COLORS[i % COLORS.length]
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 🔥 LEADERBOARD */}
      <h2 style={{ marginTop: 30 }}>🏆 Leaderboard</h2>

      <Table
        dataSource={data}
        columns={columns}
        rowKey={(r) => r.name}
        pagination={false}
      />

      {/* 🔥 CHART */}
      <h2 style={{ marginTop: 30 }}>📊 Performance Chart</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="conversion" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === 0
                    ? "#FFD700"
                    : COLORS[index % COLORS.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </MainLayout>
  );
}