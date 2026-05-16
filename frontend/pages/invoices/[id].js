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

import {
  PrinterOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import MainLayout from "../../components/Layout";
import API from "../../services/api";
import html2pdf from "html2pdf.js";

const { Title, Text } = Typography;

export default function InvoiceDetailPage() {

  const router = useRouter();

  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);

  // ✅ Fetch Invoice Detail
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

 // ✅ Download Invoice
  const handleDownloadPDF = () => {

  const element = document.getElementById(
    "invoice-print-area"
  );

  const options = {
    margin: 0.5,
    filename: `${invoice.invoice_number}.pdf`,
    image: {
      type: "jpeg",
      quality: 1,
    },
    html2canvas: {
      scale: 2,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf()
    .set(options)
    .from(element)
    .save();
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

  if (!invoice) {
    return null;
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
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 10,
            flexWrap: "wrap",
          }}
        >

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/invoices")}
          >
            Back
          </Button>

           <Space>

            <Button
                onClick={handleDownloadPDF}
            >
                Download PDF
            </Button>

            <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
            >
                Print Invoice
            </Button>

        </Space>

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

            {/* PRODUCT TABLE */}

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
