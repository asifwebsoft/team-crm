import { useEffect, useState } from "react";

import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Empty,
  Spin,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function Followups() {

  const [data, setData] = useState({
    today: [],
    overdue: [],
    upcoming: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [isMobile, setIsMobile] =
    useState(false);

  // 🔥 RESPONSIVE CHECK
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

  // 🔥 API
  useEffect(() => {

    API.get("/leads/followups/")

      .then((res) => {

        console.log(
          "FOLLOWUP DATA:",
          res.data
        );

        setData({
          today:
            res.data?.today || [],
          overdue:
            res.data?.overdue || [],
          upcoming:
            res.data?.upcoming || [],
        });

      })

      .catch((err) =>
        console.log(err)
      )

      .finally(() =>
        setLoading(false)
      );

  }, []);

  // 🔥 CARD
  const renderCard = (
    lead,
    color
  ) => (

    <Card
      key={lead.id}
      hoverable
      style={{
        marginBottom: 14,
        borderRadius: 16,
        border: "none",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >

      {/* 🔥 NAME */}
      <h3
        style={{
          marginBottom: 8,
          wordBreak:
            "break-word",
          fontSize:
            isMobile
              ? 17
              : 19,
        }}
      >
        {lead?.name || "No Name"}
      </h3>

      {/* 🔥 PHONE */}
      <p
        style={{
          marginBottom: 10,
          color: "#666",
          wordBreak:
            "break-word",
        }}
      >
        {lead?.phone ||
          "No Phone"}
      </p>

      {/* 🔥 DATE */}
      <Tag
        color={color}
        style={{
          borderRadius: 6,
          padding:
            "4px 10px",
          fontSize: 13,
        }}
      >
        {lead?.date ||
          "No Date"}
      </Tag>

      {/* 🔥 WHATSAPP */}
      <Button
        style={{
          marginTop: 14,
          width: "100%",
          background:
            "#25D366",
          color: "#fff",
          borderRadius: 8,
          height: 42,
          fontWeight: 600,
        }}
        onClick={() => {

          const msg =
            `Hi ${
              lead?.name || ""
            }, just following up with you.`;

          window.open(
            `https://wa.me/${lead?.phone}?text=${encodeURIComponent(msg)}`
          );

        }}
      >
        WhatsApp Followup
      </Button>

    </Card>

  );

  // 🔥 SECTION
  const renderSection = (
    title,
    list,
    color
  ) => (

    <Col
      xs={24}
      sm={24}
      md={12}
      lg={8}
    >

      {/* 🔥 TITLE */}
      <div
        style={{
          marginBottom: 15,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize:
              isMobile
                ? 20
                : 24,
          }}
        >
          {title}
        </h3>

        <Tag
          color={color}
          style={{
            borderRadius: 20,
            padding:
              "2px 10px",
          }}
        >
          {list?.length || 0}
        </Tag>

      </div>

      {/* 🔥 DATA */}
      {list &&
      list.length > 0 ? (

        list.map((l) =>
          renderCard(
            l,
            color
          )
        )

      ) : (

        <Card
          style={{
            borderRadius: 16,
          }}
        >

          <Empty description="No followups" />

        </Card>

      )}

    </Col>

  );

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
            marginBottom: 24,
            fontSize:
              isMobile
                ? 24
                : 32,

            fontWeight:
              "bold",
          }}
        >
          Follow Ups
        </h2>

        {/* 🔥 LOADING */}
        {loading ? (

          <div
            style={{
              display: "flex",
              justifyContent:
                "center",

              alignItems:
                "center",

              minHeight: 300,
            }}
          >

            <Spin size="large" />

          </div>

        ) : (

          <Row gutter={[16, 16]}>

            {renderSection(
              "Today",
              data.today,
              "blue"
            )}

            {renderSection(
              "Overdue",
              data.overdue,
              "red"
            )}

            {renderSection(
              "Upcoming",
              data.upcoming,
              "green"
            )}

          </Row>

        )}

      </div>

    </MainLayout>

  );
}
