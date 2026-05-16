import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space
} from "antd";

import MainLayout from "../../components/Layout";
import API from "../../services/api";

const { Title, Text } = Typography;

export default function InvoiceDetailPage() {

  const router = useRouter();

  const { id } = router.query;

  const [invoice, setInvoice] = useState(null);

  // ✅ Fetch Detail
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

  // ✅ TABLE
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

  return (
    <MainLayout>

      <Card
        style={{
          maxWidth: 1000,
          margin: "20px auto",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >

          <div>

            <Title level={3}>
              Invoice
            </Title>

            <Text>
              #{invoice.invoice_number}
            </Text>

          </div>

          <Button
            type="primary"
            onClick={() => window.print()}
          >
            Print
          </Button>

        </div>

        {/* CUSTOMER */}

        <Space
          direction="vertical"
          style={{
            marginBottom: 20,
          }}
        >

          <Text strong>
            Customer:
          </Text>

          <Text>
            {invoice.customer_name}
          </Text>

          <Text>
            {invoice.phone}
          </Text>

          <Tag color="blue">
            {invoice.status.toUpperCase()}
          </Tag>

        </Space>

        {/* TABLE */}

        <Table
          columns={columns}
          dataSource={invoice.items}
          pagination={false}
          rowKey="product_name"
        />

        {/* FOOTER */}

        <div
          style={{
            marginTop: 30,
            textAlign: "right",
          }}
        >

          <Title level={4}>
            Total: ₹{invoice.total_amount}
          </Title>

        </div>

      </Card>

    </MainLayout>
  );
}