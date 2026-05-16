import { useEffect, useState } from "react";

import {
  Card,
  Input,
  Button,
  Space,
  message,
  Typography,
  Table,
  Tag,
  Divider
} from "antd";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

export default function InvoicesPage() {

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [items, setItems] = useState([
    {
      product_name: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [invoiceList, setInvoiceList] = useState([]);

  // ✅ Fetch Invoices
  const fetchInvoices = async () => {

    try {

      const response = await API.get(
        "/invoices/list/"
      );

      setInvoiceList(response.data);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    fetchInvoices();

  }, []);

  // ✅ Add Product Row
  const addItem = () => {

    setItems([
      ...items,
      {
        product_name: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  // ✅ Handle Input
  const handleChange = (index, field, value) => {

    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  };

  // ✅ Total
  const totalAmount = items.reduce((sum, item) => {

    return sum + (item.quantity * item.price);

  }, 0);

  // ✅ Create Invoice
  const createInvoice = async () => {

    try {

      setLoading(true);

      const response = await API.post(
        "/invoices/create/",
        {
          customer_name: customerName,
          phone,
          status: "pending",
          items,
        }
      );

      if (response.status === 201) {

        message.success("Invoice Created");

        setCustomerName("");
        setPhone("");

        setItems([
          {
            product_name: "",
            quantity: 1,
            price: 0,
          },
        ]);

        // ✅ Refresh Table
        fetchInvoices();

      }

    } catch (err) {

      message.error(
        err?.response?.data?.error || "Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  // ✅ TABLE COLUMNS
  const columns = [
    {
      title: "Invoice No",
      dataIndex: "invoice_number",
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {

        let color = "orange";

        if (status === "paid") {
          color = "green";
        }

        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "created_by",
    },
    {
      title: "Date",
      dataIndex: "created_at",
    },
  ];

  return (
    <MainLayout>

      <Card
        style={{
          maxWidth: 1100,
          margin: "20px auto",
        }}
      >

        <Title level={3}>
          Create Invoice
        </Title>

        <Space
          direction="vertical"
          style={{ width: "100%" }}
        >

          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
          />

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          {/* PRODUCTS */}

          {items.map((item, index) => (

            <Space
              key={index}
              style={{
                display: "flex",
                marginBottom: 10,
              }}
            >

              <Input
                placeholder="Product Name"
                value={item.product_name}
                onChange={(e) =>
                  handleChange(
                    index,
                    "product_name",
                    e.target.value
                  )
                }
              />

              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  handleChange(
                    index,
                    "quantity",
                    Number(e.target.value)
                  )
                }
              />

              <Input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  handleChange(
                    index,
                    "price",
                    Number(e.target.value)
                  )
                }
              />

            </Space>
          ))}

          <Button onClick={addItem}>
            Add Product
          </Button>

          <Title level={4}>
            Total: ₹{totalAmount}
          </Title>

          <Button
            type="primary"
            loading={loading}
            onClick={createInvoice}
          >
            Generate Invoice
          </Button>

        </Space>

        <Divider />

        {/* ✅ TABLE */}

        <Title level={4}>
          Invoice List
        </Title>

        <Table
          columns={columns}
          dataSource={invoiceList}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />

      </Card>

    </MainLayout>
  );
}