import { load } from "@cashfreepayments/cashfree-js";
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

  try {

    const res = await API.post("/subscription/create-order/", { plan });

    console.log("CashFree Response:", res.data);

    const paymentSessionId = res.data.payment_session_id;

    const cashfree = await load({
      mode: "sandbox"
    });

    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: "_self"
    });

  } catch (err) {

    console.log(err);

    message.error("Payment Failed");
  }
};

      return (
        <MainLayout>

          <Row gutter={20}>

            <Col span={8}>
              <Card title="Basic">
                <h2>₹199</h2>

                <Button
                  type="primary"
                  block
                  onClick={() => handlePayment("basic")}
                >
                  Buy Basic
                </Button>

              </Card>
            </Col>

            <Col span={8}>
              <Card title="Pro">
                <h2>₹499</h2>

                <Button
                  type="primary"
                  block
                  onClick={() => handlePayment("pro")}
                >
                  Buy Pro
                </Button>

              </Card>
            </Col>

            <Col span={8}>
              <Card title="Advance">
                <h2>₹799</h2>

                <Button
                  type="primary"
                  block
                  onClick={() => handlePayment("advance")}
                >
                  Buy Advance
                </Button>

              </Card>
            </Col>

          </Row>

        </MainLayout>
      );
}