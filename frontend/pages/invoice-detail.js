import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Row,
  Col,
  Divider,
  Space,
} from "antd";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title, Text } = Typography;

export default function InvoiceDetailPage() {

  const router = useRouter();

  const { id } = router.query;

  const [invoice, setInvoice] =
    useState(null);

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

    const printContent =
      document.getElementById(
        "invoice-print-area"
      ).innerHTML;

    const originalContent =
      document.body.innerHTML;

    document.body.innerHTML =
      printContent;

    window.print();

    document.body.innerHTML =
      originalContent;

    window.location.reload();
  };

  // ✅ DOWNLOAD PDF

  const handleDownloadPDF =
    async () => {

      const jsPDF = (
        await import("jspdf")
      ).default;

      const html2canvas = (
        await import("html2canvas")
      ).default;

      const input =
        document.getElementById(
          "invoice-print-area"
        );

      const canvas =
        await html2canvas(input);

      const imgData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4"
      );

      const pdfWidth =
        pdf.internal.pageSize
          .getWidth();

      const pdfHeight =
        (canvas.height * pdfWidth)
        / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight
      );

      pdf.save(
        `${invoice.invoice_number}.pdf`
      );
    };

  // ✅ TABLE COLUMNS

  const columns = [

    {
      title: "Product",
      dataIndex: "product_name",
    },

    {
      title: "Qty",
      dataIndex: "quantity",
    },

    {
      title: "Price",
      dataIndex: "price",

      render: (price) =>
        `₹${price}`,
    },

    {
      title: "Subtotal",
      dataIndex: "subtotal",

      render: (subtotal) =>
        `₹${subtotal}`,
    },

  ];

  // ✅ LOADING

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

  // ✅ STATUS COLOR

  let statusColor = "orange";

  if (invoice.status === "paid") {

    statusColor = "green";
  }

  if (invoice.status === "partial") {

    statusColor = "blue";
  }

  if (invoice.status === "cancelled") {

    statusColor = "red";
  }

  return (

    <MainLayout>

      <div
        style={{
          maxWidth: 1100,
          margin: "20px auto",
          padding: 10,
        }}
      >

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >

          {/* BACK */}

          <button
            onClick={() =>
              router.push("/invoices")
            }

            style={{
              padding: "10px 18px",
              border:
                "1px solid #d9d9d9",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            ← Back
          </button>

          {/* DOWNLOAD */}

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
            Download PDF
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

        {/* PRINT AREA */}

        <div id="invoice-print-area">

          <Card
            bordered={false}

            style={{
              borderRadius: 14,
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            {/* ✅ COMPANY HEADER */}

            <div
              style={{
                marginBottom: 30,
                borderBottom:
                  "2px solid #ddd",
                paddingBottom: 20,
              }}
            >

              <Row
                justify="space-between"
                gutter={[20, 20]}
              >

                <Col xs={24} md={16}>

                  <Title
                      level={2}
                      style={{
                        margin: 0,
                        color: "#1677ff",
                      }}
                    >
                      {invoice.company_name || "Company Name"}
                    </Title>

                  <Text>
                    Address:{" "}
                    {invoice.company_address}
                  </Text>

                  <br />

                  <Text>
                    Email:{" "}
                    {invoice.company_email}
                  </Text>

                  <br />

                  <Text>
                    Mobile:{" "}
                    {invoice.company_mobile}
                  </Text>

                  <br />

                  <Text strong>
                    GSTIN:{" "}
                    {invoice.company_gstin}
                  </Text>

                </Col>

                <Col xs={24} md={8}>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >

                    <Title
                      level={4}
                      style={{
                        marginBottom: 5,
                      }}
                    >
                      Invoice
                    </Title>

                    <Text>
                      Invoice #:
                      {invoice.invoice_number}
                    </Text>

                    <br />

                    <Text>
                      Date:
                      {" "}
                      {invoice.created_at}
                    </Text>

                  </div>

                </Col>

              </Row>

            </div>

            {/* ✅ CUSTOMER DETAILS */}

            <Row gutter={[20, 20]}>

              {/* CUSTOMER */}

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
                      style={{
                        margin: 0,
                      }}
                    >
                      Bill To
                    </Title>

                    <Text>
                      <strong>
                        Name:
                      </strong>
                      {" "}
                      {invoice.customer_name}
                    </Text>

                    <Text>
                      <strong>
                        Address:
                      </strong>
                      {" "}
                      {invoice.address}
                    </Text>

                    <Text>
                      <strong>
                        Mobile:
                      </strong>
                      {" "}
                      {invoice.phone}
                    </Text>

                  </Space>

                </Card>

              </Col>

              {/* INVOICE INFO */}

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
                      style={{
                        margin: 0,
                      }}
                    >
                      Invoice Info
                    </Title>

                    <Text>
                      <strong>
                        Created By:
                      </strong>
                      {" "}
                      {invoice.created_by}
                    </Text>

                    <div>

                      <Tag color={statusColor}>
                        {invoice.status
                          .toUpperCase()}
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

              style={{
                marginTop: 20,
              }}
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
                Grand Total:
                ₹{invoice.total_amount}
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
                Thank you for your
                business.
              </Text>

            </div>

          </Card>

        </div>

      </div>

    </MainLayout>
  );
}