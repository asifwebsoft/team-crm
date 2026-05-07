import { useEffect, useState } from "react";
import { Row, Col, Card } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/login";
    } else {
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    API.get("/leads/dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => {
        const error = err.response?.data?.error;

        if (error === "No active subscription") {
          window.location.href = "/subscription";
        } else if (error === "No company") {
          window.location.href = "/company";
        }
      });
  }, []);

  if (role === null) return null;

  return (
    <MainLayout>
      <Row gutter={20}>
        <Col span={8}>
          <Card title="Total Leads">
            {data.total_leads || 0}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Today Followups">
            {data.today_followups?.length || 0}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Upcoming Followups">
            {data.upcoming_followups?.length || 0}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Overdue Followups">
            {data.overdue_followups?.length || 0}
          </Card>
        </Col>
      </Row>

      {/* 👑 ADMIN */}
      {role === "admin" && (
        <Card title="Admin Panel" style={{ marginTop: 20 }}>
          Manage staff, leads and analytics
        </Card>
      )}

      {/* 👨‍💼 STAFF */}
      {role === "staff" && (
        <Card title="My Work" style={{ marginTop: 20 }}>
          Your assigned leads
        </Card>
      )}
    </MainLayout>
  );
}