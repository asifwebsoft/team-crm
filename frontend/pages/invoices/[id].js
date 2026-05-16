import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Divider,
} from "antd";

import MainLayout from "../../components/Layout";
import API from "../../services/api";

const { Title, Text } = Typography;

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function InvoiceDetailPage() {

  const router = useRouter();

  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);

  // ✅ FETCH INVOICE
  const fetchInvoice = async () => {

    try {

      const response = await API.get(
        `/invoices/${id}/`
      );

      setInvoice(response.data);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    if (id) {
      fetchInvoice();
    }

  }, [id]);

  // ✅ PRINT ONLY INVOICE
  const handlePrint = () => {

    const printContent = document.getElementById(
      "invoice-print-area"
    ).innerHTML;

    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;

    window.print();

    document.body.innerHTML = originalContent;

    window.location.reload();
  };

  // ✅ SAVE PDF
  const handleDownloadPDF = () => {

    window.print();
  };

  // ✅ TABLE COLUMNS
  const columns = [
    {
      title: "Product",
      dataIndex: "product_name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      render: (subtotal) => `₹${subtotal}`,
    },
  ];

  // ✅ LOADING FIX
  if (!invoice) {

    return (

      <MainLayout>

        <div
          style={{
            padding: 40,
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Loading Invoice...
        </div>

      </MainLayout>
    );
  }

  let statusColor = "orange";

  if (invoice.status === "paid") {
    statusColor = "green";
  }

  if (invoice.status === "partial") {
    statusColor = "blue";
  }

  return (
    <MainLayout>

      <div
        style={{
          maxWidth: 1100,
          margin: "20px auto",
        }}
      >

        {/* ACTION BUTTONS */}

        <div
          style={{
            marginBottom: 20,
          }}
        >

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >

            {/* BACK */}

            <button
              onClick={() => router.push("/invoices")}
              style={{
                padding: "10px 18px",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ← Back
            </button>

            {/* SAVE PDF */}

            <button
              onClick={handleDownloadPDF}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: 6,
                background: "#22c55e",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save PDF
            </button>

            {/* PRINT */}

            <button
              onClick={handlePrint}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: 6,
                background: "#1677ff",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Print Invoice
            </button>

          </div>

        </div>

        {/* PRINT AREA */}

        <div id="invoice-print-area">

          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            {/* HEADER */}

            <Row
              justify="space-between"
              align="middle"
              gutter={[20, 20]}
            >

              <Col>

                <Title
                  level={2}
                  style={{
                    marginBottom: 0,
                    color: "#1677ff",
                  }}
                >
                  CRM Invoice
                </Title>

                <Text type="secondary">
                  Professional Billing Invoice
                </Text>

              </Col>

              <Col>

                <div style={{ textAlign: "right" }}>

                  <Title
                    level={4}
                    style={{ marginBottom: 5 }}
                  >
                    Invoice #{invoice.invoice_number}
                  </Title>

                  <Text>
                    Date: {invoice.created_at}
                  </Text>

                </div>

              </Col>

            </Row>

            <Divider />

            {/* CUSTOMER DETAILS */}

            <Row gutter={[20, 20]}>

              <Col xs={24} md={12}>

                <Card
                  size="small"
                  style={{
                    borderRadius: 10,
                    background: "#fafafa",
                  }}
                >

                  <Space direction="vertical">

                    <Title
                      level={5}
                      style={{ margin: 0 }}
                    >
                      Customer Details
                    </Title>

                    <Text>
                      <strong>Name:</strong> {invoice.customer_name}
                    </Text>

                    <Text>
                      <strong>Phone:</strong> {invoice.phone}
                    </Text>

                    <Text>
                      <strong>Address:</strong> {invoice.address}
                    </Text>

                  </Space>

                </Card>

              </Col>

              <Col xs={24} md={12}>

                <Card
                  size="small"
                  style={{
                    borderRadius: 10,
                    background: "#fafafa",
                  }}
                >

                  <Space direction="vertical">

                    <Title
                      level={5}
                      style={{ margin: 0 }}
                    >
                      Invoice Info
                    </Title>

                    <Text>
                      <strong>Created By:</strong> {invoice.created_by}
                    </Text>

                    <div>
                      <Tag color={statusColor}>
                        {invoice.status.toUpperCase()}
                      </Tag>
                    </div>

                  </Space>

                </Card>

              </Col>

            </Row>

            <Divider />

            {/* PRODUCTS */}

            <Title level={4}>
              Products
            </Title>

            <Table
              columns={columns}
              dataSource={invoice.items}
              pagination={false}
              rowKey="product_name"
              bordered
              style={{ marginTop: 20 }}
            />

            {/* TOTAL */}

            <div
              style={{
                marginTop: 30,
                textAlign: "right",
              }}
            >

              <Title
                level={3}
                style={{
                  color: "#1677ff",
                }}
              >
                Grand Total: ₹{invoice.total_amount}
              </Title>

            </div>

            <Divider />

            {/* FOOTER */}

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
              }}
            >

              <Text type="secondary">
                Thank you for your business.
              </Text>

            </div>

          </Card>

        </div>

      </div>

    </MainLayout>
  );
}