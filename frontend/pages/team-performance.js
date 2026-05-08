import { useEffect, useState } from "react";

import {
  Card,
  Row,
  Col,
  Progress,
  Tag,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function TeamPerformance() {

  const [data, setData] = useState([]);

  const [isMobile, setIsMobile] =
    useState(false);

  // 🔥 LOAD DATA
  useEffect(() => {

    API.get("/leads/team-performance/")

      .then((res) => {

        // 🔥 SORT BEST FIRST
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

  // 📱 RESPONSIVE CHECK
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

  // 🏆 BADGE
  const getBadge = (index) => {

    if (index === 0) {
      return (
        <Tag color="gold">
          🥇 Top Performer
        </Tag>
      );
    }

    if (index === 1) {
      return (
        <Tag color="silver">
          🥈
        </Tag>
      );
    }

    if (index === 2) {
      return (
        <Tag color="orange">
          🥉
        </Tag>
      );
    }

    return null;
  };

  return (

    <MainLayout>

      <div
        style={{
          padding:
            isMobile
              ? 5
              : 10,

          overflowX:
            "hidden",
        }}
      >

        {/* 🔥 PAGE TITLE */}
        <h2
          style={{
            fontSize:
              isMobile
                ? 24
                : 32,

            fontWeight:
              "bold",

            marginBottom: 24,
          }}
        >
          Team Performance
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
                  borderRadius: 16,

                  border:
                    i === 0
                      ? "2px solid gold"
                      : i === 1
                      ? "2px solid silver"
                      : i === 2
                      ? "2px solid orange"
                      : "1px solid #eee",

                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.06)",

                  height: "100%",
                }}
              >

                {/* 🔥 NAME */}
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    gap: 10,

                    marginBottom: 18,

                    flexWrap: "wrap",
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                      wordBreak:
                        "break-word",

                      fontSize:
                        isMobile
                          ? 18
                          : 22,
                    }}
                  >
                    {item.name}
                  </h3>

                  {getBadge(i)}

                </div>

                {/* 🔥 TOTAL */}
                <div
                  style={{
                    marginBottom: 12,
                    color: "#555",
                    fontSize: 15,
                  }}
                >
                  <b>Total Leads:</b>{" "}
                  {item.total}
                </div>

                {/* 🔥 CLOSED */}
                <div
                  style={{
                    marginBottom: 18,
                    color: "#555",
                    fontSize: 15,
                  }}
                >
                  <b>Closed Leads:</b>{" "}
                  {item.closed}
                </div>

                {/* 🔥 PROGRESS */}
                <Progress
                  percent={
                    item.conversion
                  }

                  strokeColor={
                    i === 0
                      ? "#FFD700"
                      : i === 1
                      ? "#C0C0C0"
                      : i === 2
                      ? "#CD7F32"
                      : "#1677ff"
                  }

                  status="active"
                />

              </Card>

            </Col>

          ))}

        </Row>

      </div>

    </MainLayout>

  );
}
