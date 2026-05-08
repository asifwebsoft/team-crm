import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function Dashboard() {

  const [data, setData] = useState({});

  const [role, setRole] = useState(null);

  const [isMobile, setIsMobile] = useState(false);

  // 🔥 AUTH + RESPONSIVE
  useEffect(() => {

    if (typeof window !== "undefined") {

      const token =
        localStorage.getItem("token");

      const userRole =
        localStorage.getItem("role");

      // 🔒 LOGIN CHECK
      if (!token) {

        window.location.href = "/login";

      } else {

        setRole(userRole);

      }

      // 📱 MOBILE CHECK
      const checkScreen = () => {
        setIsMobile(window.innerWidth < 768);
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

  // 🔥 DASHBOARD API
  useEffect(() => {

    API.get("/leads/dashboard/")

      .then((res) => {

        setData(res.data);

      })

      .catch((err) => {

        const error =
          err.response?.data?.error;

        // 🔥 SUBSCRIPTION
        if (
          error ===
          "No active subscription"
        ) {

          window.location.href =
            "/subscription";

        }

        // 🔥 COMPANY
        else if (
          error === "No company"
        ) {

          window.location.href =
            "/company";

        }

      });

  }, []);

  // 🔥 LOADING
  if (role === null) return null;

  // 🔥 CARD STYLE
  const cardStyle = {
    borderRadius: 16,
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.06)",
    border: "none",
    height: "100%",
  };

  // 🔥 CARD NUMBER STYLE
  const numberStyle = {
    fontSize: isMobile ? 24 : 32,
    fontWeight: "bold",
    color: "#1677ff",
  };

  return (

    <MainLayout>

      <div
        style={{
          padding: isMobile ? 5 : 10,
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
          Dashboard
        </h2>

        {/* 🔥 STATS */}
        <Row gutter={[16, 16]}>

          {/* TOTAL */}
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={6}
          >

            <Card
              style={cardStyle}
            >

              <div
                style={{
                  fontSize: 15,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Total Leads
              </div>

              <div
                style={numberStyle}
              >
                {data.total_leads || 0}
              </div>

            </Card>

          </Col>

          {/* TODAY */}
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={6}
          >

            <Card
              style={cardStyle}
            >

              <div
                style={{
                  fontSize: 15,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Today Followups
              </div>

              <div
                style={{
                  ...numberStyle,
                  color: "#16a34a",
                }}
              >
                {data.today_followups
                  ?.length || 0}
              </div>

            </Card>

          </Col>

          {/* UPCOMING */}
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={6}
          >

            <Card
              style={cardStyle}
            >

              <div
                style={{
                  fontSize: 15,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Upcoming Followups
              </div>

              <div
                style={{
                  ...numberStyle,
                  color: "#f59e0b",
                }}
              >
                {data.upcoming_followups
                  ?.length || 0}
              </div>

            </Card>

          </Col>

          {/* OVERDUE */}
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={6}
          >

            <Card
              style={cardStyle}
            >

              <div
                style={{
                  fontSize: 15,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Overdue Followups
              </div>

              <div
                style={{
                  ...numberStyle,
                  color: "#dc2626",
                }}
              >
                {data.overdue_followups
                  ?.length || 0}
              </div>

            </Card>

          </Col>

        </Row>

        {/* 👑 ADMIN */}
        {role === "admin" && (

          <Card
            style={{
              marginTop: 20,
              borderRadius: 16,
              border: "none",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >

            <h3
              style={{
                marginBottom: 10,
              }}
            >
              Admin Panel
            </h3>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              Manage staff, leads,
              analytics and CRM
              operations.
            </p>

          </Card>

        )}

        {/* 👨‍💼 MANAGER */}
        {role === "manager" && (

          <Card
            style={{
              marginTop: 20,
              borderRadius: 16,
              border: "none",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >

            <h3
              style={{
                marginBottom: 10,
              }}
            >
              Manager Panel
            </h3>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              Track your team
              performance and lead
              conversions.
            </p>

          </Card>

        )}

        {/* 👨‍💻 STAFF */}
        {role === "staff" && (

          <Card
            style={{
              marginTop: 20,
              borderRadius: 16,
              border: "none",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >

            <h3
              style={{
                marginBottom: 10,
              }}
            >
              My Work
            </h3>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              Manage your assigned
              leads and followups.
            </p>

          </Card>

        )}

      </div>

    </MainLayout>

  );
}