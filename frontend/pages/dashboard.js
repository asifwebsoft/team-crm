import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
  Modal,
  Button,
  Statistic
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function Dashboard() {

  const [
    followupModal,
    setFollowupModal
  ] = useState(false);

  const [
    todayFollowups,
    setTodayFollowups
  ] = useState([]);

  const [data, setData] = useState({});

  const [role, setRole] = useState(null);

  const [isMobile, setIsMobile] =
    useState(false);

  // ✅ BUSINESS OVERVIEW STATES

  const [totalSales,
    setTotalSales] =
    useState(0);

  const [pendingPayments,
    setPendingPayments] =
    useState(0);

  const [inventoryValue,
    setInventoryValue] =
    useState(0);

  const [lowStockCount,
    setLowStockCount] =
    useState(0);

  // ✅ MONTHLY ANALYTICS

const [monthlySales,
  setMonthlySales] =
  useState(0);

const [monthlyExpense,
  setMonthlyExpense] =
  useState(0);

const [monthlyProfit,
  setMonthlyProfit] =
  useState(0);

const [totalExpense,
  setTotalExpense] =
  useState(0);

const [netProfit,
  setNetProfit] =
  useState(0);

  // 🔥 AUTH + RESPONSIVE

  useEffect(() => {

    if (typeof window !== "undefined") {

      const token =
        localStorage.getItem("access");

      const userRole =
        localStorage.getItem("role");

      // 🔒 LOGIN CHECK

      if (!token) {

        window.location.href =
          "/login";

      } else {

        setRole(userRole);
      }

      // 📱 MOBILE CHECK

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

  // 🔥 DASHBOARD API

  useEffect(() => {

    API.get("/leads/dashboard/")

      .then((res) => {

        setData(res.data);

// ✅ BUSINESS OVERVIEW ROLE BASED

const currentRole =
  localStorage.getItem("role");

// 👑 ADMIN
// Full access

if (currentRole === "admin") {

  setTotalSales(
    res.data.total_sales || 0
  );

  setPendingPayments(
    res.data.pending_payments || 0
  );

  setInventoryValue(
    res.data.inventory_value || 0
  );

  setLowStockCount(
    res.data.low_stock_count || 0
  );
  
  // ✅ MONTHLY

setMonthlySales(
  res.data.monthly_sales || 0
);

setMonthlyExpense(
  res.data.monthly_expense || 0
);

setMonthlyProfit(
  res.data.monthly_profit || 0
);

// ✅ TOTAL

setTotalExpense(
  res.data.total_expense || 0
);

setNetProfit(
  res.data.net_profit || 0
);
}

// 👨‍💼 MANAGER
// Limited business access

else if (
  currentRole === "manager"
) {

  setTotalSales(
    res.data.total_sales || 0
  );

  // ✅ MONTHLY

setMonthlySales(
  res.data.monthly_sales || 0
);

setMonthlyExpense(
  res.data.monthly_expense || 0
);

// ❌ HIDE PROFIT

setMonthlyProfit(0);

// ✅ TOTAL

setTotalExpense(
  res.data.total_expense || 0
);

setNetProfit(0);

  // ❌ hidden for manager

  setPendingPayments(0);

  setInventoryValue(
    res.data.inventory_value || 0
  );

  setLowStockCount(
    res.data.low_stock_count || 0
  );
}

// 👨‍💻 STAFF
// Hide all business analytics

else if (
  currentRole === "staff"
) {

  setTotalSales(0);

  setPendingPayments(0);

  setInventoryValue(0);

  setLowStockCount(0);

  setMonthlySales(0);

  setMonthlyExpense(0);

  setMonthlyProfit(0);

  setTotalExpense(0);

  setNetProfit(0);
}

        // ✅ FOLLOWUPS

        if (

          res.data.today_followups

          &&

          res.data.today_followups
            .length > 0

        ) {

          setTodayFollowups(
            res.data.today_followups
          );

          setFollowupModal(true);
        }

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

    fontSize:
      isMobile ? 24 : 32,

    fontWeight: "bold",

    color: "#1677ff",
  };

  return (

    <MainLayout>

      <div
        style={{
          padding:
            isMobile ? 5 : 10,

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

        {/* 🔥 CRM STATS */}

        <Row gutter={[16, 16]}>

          {/* TOTAL LEADS */}

          <Col
            xs={24}
            sm={12}
            md={12}
            lg={6}
          >

            <Card style={cardStyle}>

              <div
                style={{
                  fontSize: 15,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                Total Leads
              </div>

              <div style={numberStyle}>
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

            <Card style={cardStyle}>

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
                {
                  data.today_followups
                    ?.length || 0
                }
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

            <Card style={cardStyle}>

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
                {
                  data.upcoming_followups
                    ?.length || 0
                }
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

            <Card style={cardStyle}>

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
                {
                  data.overdue_followups
                    ?.length || 0
                }
              </div>

            </Card>

          </Col>

        </Row>

        {/* ✅ BUSINESS OVERVIEW */}

        <div
          style={{
            marginTop: 30,
          }}
        >

          {localStorage.getItem("role")
              !== "staff" && (

                <h2
                  style={{
                    fontSize:
                      isMobile ? 22 : 28,

                    fontWeight: "bold",

                    marginBottom: 20,
                  }}
                >
                  Business Overview
                </h2>

              )}

          <Row gutter={[16, 16]}>

            {/* SALES */}
          {role !== "staff" && (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
            >

              <Card style={cardStyle}>

                <div
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  Total Sales
                </div>

                <div
                  style={{
                    ...numberStyle,
                    color: "#16a34a",
                  }}
                >
                  ₹{totalSales}
                </div>

              </Card>

              

            </Col>
          )}

            {/* PENDING */}
          {role === "admin" && (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
            >

              <Card style={cardStyle}>

                <div
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  Pending Payments
                </div>

                <div
                  style={{
                    ...numberStyle,
                    color: "#f59e0b",
                  }}
                >
                  ₹{pendingPayments}
                </div>

              </Card>

            </Col>
          )}

            {/* INVENTORY */}
          {role !== "staff" && (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
            >

              <Card style={cardStyle}>

                <div
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  Inventory Value
                </div>

                <div
                  style={{
                    ...numberStyle,
                    color: "#2563eb",
                  }}
                >
                  ₹{inventoryValue}
                </div>

              </Card>

            </Col>
          )}

            {/* LOW STOCK */}
          {role !== "staff" && (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={6}
            >

              <Card style={cardStyle}>

                <div
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginBottom: 10,
                  }}
                >
                  Low Stock Items
                </div>

                <div
                  style={{
                    ...numberStyle,
                    color: "#dc2626",
                  }}
                >
                  {lowStockCount}
                </div>

              </Card>

            </Col>
          )}

          </Row>

        </div>
      {/* ✅ MONTHLY ANALYTICS */}

{role !== "staff" && (

  <div
    style={{
      marginTop: 30,
    }}
  >

    <h2
      style={{
        fontSize:
          isMobile ? 22 : 28,

        fontWeight: "bold",

        marginBottom: 20,
      }}
    >
      Monthly Analytics
    </h2>

    <Row gutter={[16, 16]}>

      {/* MONTHLY SALES */}

      <Col
        xs={24}
        sm={12}
        md={12}
        lg={8}
      >

        <Card style={cardStyle}>

          <div
            style={{
              fontSize: 15,
              color: "#666",
              marginBottom: 10,
            }}
          >
            Monthly Sales
          </div>

          <div
            style={{
              ...numberStyle,
              color: "#16a34a",
            }}
          >
            ₹{monthlySales}
          </div>

        </Card>

      </Col>

      {/* MONTHLY EXPENSE */}

      <Col
        xs={24}
        sm={12}
        md={12}
        lg={8}
      >

        <Card style={cardStyle}>

          <div
            style={{
              fontSize: 15,
              color: "#666",
              marginBottom: 10,
            }}
          >
            Monthly Expense
          </div>

          <div
            style={{
              ...numberStyle,
              color: "#dc2626",
            }}
          >
            ₹{monthlyExpense}
          </div>

        </Card>

      </Col>

      {/* 👑 ADMIN ONLY */}

      {role === "admin" && (

        <Col
          xs={24}
          sm={12}
          md={12}
          lg={8}
        >

          <Card style={cardStyle}>

            <div
              style={{
                fontSize: 15,
                color: "#666",
                marginBottom: 10,
              }}
            >
              Monthly Profit
            </div>

            <div
              style={{
                ...numberStyle,
                color: "#2563eb",
              }}
            >
              ₹{monthlyProfit}
            </div>

          </Card>

        </Col>

      )}

    </Row>

  </div>
)}

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

      {/* ✅ FOLLOWUP MODAL */}

      <Modal

        title="Today's Followups"

        open={followupModal}

        footer={null}

        onCancel={() =>
          setFollowupModal(false)
        }

        width={
          isMobile
            ? "95%"
            : 650
        }
      >

        {

          todayFollowups.map((item) => (

            <div

              key={item.id}

              style={{

                border:
                  "1px solid #eee",

                borderRadius: 12,

                padding: 12,

                marginBottom: 12,

                background: "#fafafa",
              }}
            >

              <p>
                <strong>
                  Customer:
                </strong>

                {" "}

                {item.name}
              </p>

              <p>
                <strong>
                  Phone:
                </strong>

                {" "}

                {item.phone}
              </p>

              <p>
                <strong>
                  Followup Date:
                </strong>

                {" "}

                {item.date}
              </p>

            </div>
          ))
        }

        <Button

          type="primary"

          block

          onClick={() =>
            setFollowupModal(false)
          }
        >
          Close
        </Button>

      </Modal>

    </MainLayout>
  );
}