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
  Button,
  Text,
} from "antd";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

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

  // ✅ WHATSAPP SHARE

  const shareOnWhatsApp = () => {

    if (!invoice) return;

    let productsText = "";

    invoice.items.forEach((item) => {

      productsText +=
        `• ${item.product_name}

Qty: ${item.quantity}

Price: ₹${item.price}

Total: ₹${item.subtotal}

`;
    });

    const cleanPhone =
      invoice.phone.replace(/\D/g, "");

    const message = `

🧾 Invoice Details

Invoice No:
${invoice.invoice_number}

Customer:
${invoice.customer_name}

Products:
${productsText}

Subtotal:
₹${invoice.total_amount}

CGST:
₹${invoice.cgst}

SGST:
₹${invoice.sgst}

Grand Total:
₹${invoice.grand_total}

Thank you for your business.
`;

    const whatsappUrl =

      `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank"
    );
  };

  // ✅ PRINT

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

  // ✅ TABLE

  const columns = [

    {
      title: "Product",
      dataIndex: "product_name",
    },

    {
      title: "Unit",
      dataIndex: "unit",
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

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >

          <Button
            onClick={() =>
              router.push("/invoices")
            }
          >
            Back
          </Button>

          <Button
            type="primary"
            onClick={shareOnWhatsApp}
          >
            Share on WhatsApp
          </Button>

          <Button
            style={{
              background: "#22c55e",
              color: "#fff",
            }}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

          <Button
            style={{
              background: "#1677ff",
              color: "#fff",
            }}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>

        </div>

        {/* PRINT AREA */}

        <div id="invoice-print-area">

          <Card>

            {/* HEADER */}

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
                  {invoice.company_name
                    ||
                    "Company Name"}
                </Title>

                <div>
                  {invoice.company_address}
                </div>

                <div>
                  {invoice.company_email}
                </div>

                <div>
                  {invoice.company_mobile}
                </div>

              </Col>

              <Col xs={24} md={8}>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >

                  <Title level={4}>
                    Invoice
                  </Title>

                  <div>
                    #{invoice.invoice_number}
                  </div>

                  <div>
                    {invoice.created_at}
                  </div>

                </div>

              </Col>

            </Row>

            <Divider />

            {/* CUSTOMER */}

            <Row gutter={[20, 20]}>

              <Col xs={24} md={12}>

                <Card size="small">

                  <Space direction="vertical">

                    <Title level={5}>
                      Bill To
                    </Title>

                    <div>
                      {invoice.customer_name}
                    </div>

                    <div>
                      {invoice.address}
                    </div>

                    <div>
                      {invoice.phone}
                    </div>

                  </Space>

                </Card>

              </Col>

              <Col xs={24} md={12}>

                <Card size="small">

                  <Space direction="vertical">

                    <Title level={5}>
                      Invoice Info
                    </Title>

                    <div>
                      Created By:
                      {" "}
                      {invoice.created_by}
                    </div>

                    <Tag color={statusColor}>
                      {invoice.status
                        .toUpperCase()}
                    </Tag>

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
              rowKey="id"
              pagination={false}
              bordered
            />

            {/* TOTAL */}

            <div
              style={{
                marginTop: 30,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >

              <div
                style={{
                  width: 320,
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 10,
                  }}
                >

                  <strong>
                    Subtotal
                  </strong>

                  <div>
                    ₹{invoice.total_amount}
                  </div>

                </div>

                {Number(invoice.cgst) > 0 && (

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: 10,
                    }}
                  >

                    <strong>
                      CGST
                    </strong>

                    <div>
                      ₹{invoice.cgst}
                    </div>

                  </div>

                )}

                {Number(invoice.sgst) > 0 && (

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: 10,
                    }}
                  >

                    <strong>
                      SGST
                    </strong>

                    <div>
                      ₹{invoice.sgst}
                    </div>

                  </div>

                )}

                <Divider />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                  }}
                >

                  <Title
                    level={4}
                    style={{
                      color: "#1677ff",
                    }}
                  >
                    Grand Total
                  </Title>

                  <Title
                    level={4}
                    style={{
                      color: "#1677ff",
                    }}
                  >
                    ₹
                    {invoice.grand_total
                      ||
                      invoice.total_amount}
                  </Title>

                </div>

              </div>

            </div>

            <Divider />

            <div
              style={{
                textAlign: "center",
              }}
            >

              Thank you for your business.

            </div>

          </Card>

        </div>

      </div>

    </MainLayout>
  );
}