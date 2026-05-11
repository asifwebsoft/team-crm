import { useEffect } from "react";
import { Card, Button, Row, Col, message } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";
import Script from "next/script";

export default function Subscription() {

  // 🔐 Login check
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const handlePayment = async (plan) => {
    if (!window.Razorpay) {
      alert("Razorpay not loaded");
      return;
    }

    try {
      const res = await API.post("/subscription/create-order/", { plan });

      const options = {
        key: res.data.key,
        order_id: res.data.order_id,

        handler: async function (response) {
          await API.post("/subscription/verify/", {
            ...response,
            plan,
          });

          message.success("Subscription Activated");
          window.location.href = "/dashboard";
        },
      };

      const rzp = new window.Razorpay(options);
      console.log("Razorpay Key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY);
      console.log("Order Data:", data);
      console.log("Razorpay Object:", window.Razorpay);
      rzp.open();

    } catch {
      message.error("Payment Failed");
    }
  };

  return (
    <MainLayout>

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <Row gutter={20}>
        <Col span={8}>
          <Card title="Basic">
            <h2>₹199</h2>
            <Button type="primary" block onClick={() => handlePayment("basic")}>
              Buy Basic
            </Button>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Pro">
            <h2>₹499</h2>
            <Button type="primary" block onClick={() => handlePayment("pro")}>
              Buy Pro
            </Button>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Advance">
            <h2>₹799</h2>
            <Button type="primary" block onClick={() => handlePayment("advance")}>
              Buy Advance
            </Button>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}