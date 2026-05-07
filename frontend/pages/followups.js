import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Tag, Empty, Spin } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function Followups() {
  const [data, setData] = useState({
    today: [],
    overdue: [],
    upcoming: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/leads/followups/")
      .then((res) => {
        console.log("FOLLOWUP DATA:", res.data); // 🔥 DEBUG

        setData({
          today: res.data?.today || [],
          overdue: res.data?.overdue || [],
          upcoming: res.data?.upcoming || [],
        });
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const renderCard = (lead, color) => (
    <Card
      key={lead.id}
      style={{
        marginBottom: 12,
        borderRadius: 10,
      }}
    >
      {/* 🔥 SAFE DATA DISPLAY */}
      <h3 style={{ marginBottom: 5 }}>
        {lead?.name || "No Name"}
      </h3>

      <p style={{ marginBottom: 5 }}>
        {lead?.phone || "No Phone"}
      </p>

      <Tag color={color}>
        {lead?.date || "No Date"}
      </Tag>

      <Button
        style={{
          marginTop: 10,
          width: "100%",
          background: "#25D366",
          color: "#fff",
          borderRadius: 6,
        }}
        onClick={() => {
          const msg = `Hi ${lead?.name || ""}, just following up with you.`;

          window.open(
            `https://wa.me/${lead?.phone}?text=${encodeURIComponent(msg)}`
          );
        }}
      >
        WhatsApp Followup
      </Button>
    </Card>
  );

  const renderSection = (title, list, color) => (
    <Col xs={24} md={8}>
      <h3 style={{ marginBottom: 15 }}>{title}</h3>

      {list && list.length > 0 ? (
        list.map((l) => renderCard(l, color))
      ) : (
        <Empty description="No followups" />
      )}
    </Col>
  );

  return (
    <MainLayout>
      <h2 style={{ marginBottom: 20 }}>Follow Ups</h2>

      {/* 🔥 LOADING FIX */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={16}>
          {renderSection("Today", data.today, "blue")}
          {renderSection("Overdue", data.overdue, "red")}
          {renderSection("Upcoming", data.upcoming, "green")}
        </Row>
      )}
    </MainLayout>
  );
}