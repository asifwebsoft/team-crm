import { useEffect, useState } from "react";

import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Tag,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

  const [isMobile, setIsMobile] =
    useState(false);

  // 🔥 LOAD DATA
  useEffect(() => {

    API.get("/leads/team-performance/")

      .then((res) => {

        // 🔥 SAFE SORT
        const sorted =
          res.data.sort(
            (a, b) =>
              b.conversion -
              a.conversion
          );

        setData(sorted);

      })

      .catch((err) =>
        console.log(err)
      );

  }, []);

  // 📱 MOBILE CHECK
  useEffect(() => {

    if (typeof window !== "undefined") {

      const checkScreen = () => {
        setIsMobile(
          window.innerWidth < 768
        );
      };

      checkScreen();

      window.addEventListener(
        "resize",
        checkScreen
      );

      return () => {
        window.removeEventListener(
          "resize",
          checkScreen
        );
      };
    }

  }, []);

  // 🏆 BADGES
  const getBadge = (index) => {

    if (index === 0)
      return (
        <Tag color="gold">
          🥇 Top Performer
        </Tag>
      );

    if (index === 1)
      return (
        <Tag color="silver">
          🥈
        </Tag>
      );

    if (index === 2)
      return (
        <Tag color="orange">
          🥉
        </Tag>
      );

    return null;
  };

  // 🔥 TABLE
  const columns = [
    {
      title: "Rank",
      render: (_, __, index) =>
        index + 1,
      width: 70,
    },

    {
      title: "Name",
      render: (
        _,
        record,
        index
      ) => (
        <>
          {record.name}{" "}
          {getBadge(index)}
        </>
      ),
    },

    {
      title: "Total Leads",
      dataIndex: "total",
    },

    {
      title: "Closed",
      dataIndex: "closed",
    },

    {
      title: "Conversion %",
      dataIndex: "conversion",

      render: (val) => (
        <b>{val}%</b>
      ),
    },
  ];

  return (

    <MainLayout>

      <div
        style={{
          padding: isMobile
            ? 5
            : 10,

          overflowX: "hidden",
        }}
      >

        {/* 🔥 PAGE TITLE */}
        <h2
          style={{
            fontSize:
              isMobile ? 24 : 32,

            fontWeight: "bold",

            marginBottom: 20,
          }}
        >
          🔥 Conversion Dashboard
        </h2>

        {/* 🔥 CARDS */}
        <Row gutter={[16, 16]}>

          {data.map((item, i) => (

            <Col
              xs={24}
              sm={12}
              md={12}
              lg={8}
              key={i}
            >

              <Card
                hoverable
                style={{
                  border:
                    i === 0
                      ? "2px solid gold"
                      : i === 1
                      ? "2px solid silver"
                      : i === 2
                      ? "2px solid orange"
                      : "1px solid #eee",

                  borderRadius: 16,

                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.06)",

                  height: "100%",
                }}
              >

                <h3
                  style={{
                    marginBottom: 15,
                    wordBreak:
                      "break-word",
                  }}
                >
                  {item.name}{" "}
                  {getBadge(i)}
                </h3>

                <p>
                  <b>Total:</b>{" "}
                  {item.total}
                </p>

                <p>
                  <b>Closed:</b>{" "}
                  {item.closed}
                </p>

                <Progress
                  percent={
                    item.conversion
                  }

                  strokeColor={
                    i === 0
                      ? "#FFD700"
                      : COLORS[
                          i %
                            COLORS.length
                        ]
                  }
                />

              </Card>

            </Col>

          ))}

        </Row>

        {/* 🔥 TABLE */}
        <h2
          style={{
            marginTop: 35,
            marginBottom: 15,
            fontSize:
              isMobile ? 22 : 28,
          }}
        >
          🏆 Leaderboard
        </h2>

        <Card
          style={{
            borderRadius: 16,
            overflow: "hidden",
          }}
        >

          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r) => r.name}
            pagination={false}

            scroll={{
              x: true,
            }}
          />

        </Card>

        {/* 🔥 CHART */}
        <h2
          style={{
            marginTop: 35,
            marginBottom: 15,
            fontSize:
              isMobile ? 22 : 28,
          }}
        >
          📊 Performance Chart
        </h2>

        <Card
          style={{
            borderRadius: 16,
          }}
        >

          <div
            style={{
              width: "100%",
              height: isMobile
                ? 280
                : 350,
            }}
          >

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={data}
              >

                <XAxis
                  dataKey="name"

                  tick={{
                    fontSize:
                      isMobile
                        ? 10
                        : 12,
                  }}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="conversion"

                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                >

                  {data.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={`cell-${index}`}

                        fill={
                          index === 0
                            ? "#FFD700"
                            : COLORS[
                                index %
                                  COLORS.length
                              ]
                        }
                      />

                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>

    </MainLayout>

  );
}