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
  Divider,
  Select
} from "antd";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

export default function InvoicesPage() {

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [items, setItems] = useState([
    {
      product_name: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [invoiceList, setInvoiceList] = useState([]);

  // ✅ USER ROLE
  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

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
          address,
          status: "pending",
          items,
        }
      );

      if (response.status === 201) {

        message.success("Invoice Created");

        setCustomerName("");
        setPhone("");
        setAddress("");

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

  // ✅ UPDATE STATUS
  const updateStatus = async (
    invoiceId,
    status
  ) => {

    try {

      await API.patch(
        `/invoices/status/${invoiceId}/`,
        {
          status
        }
      );

      message.success("Status Updated");

      fetchInvoices();

    } catch (err) {

      message.error("Failed");
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

    // ✅ STATUS COLUMN
    {
      title: "Status",
      dataIndex: "status",

      render: (status, record) => {

        let color = "orange";

        if (status === "paid") {
          color = "green";
        }

        if (status === "partial") {
          color = "blue";
        }

        // ✅ STAFF VIEW ONLY
        if (role === "staff") {

          return (
            <Tag color={color}>
              {status.toUpperCase()}
            </Tag>
          );
        }

        // ✅ ADMIN & MANAGER
        return (

          <Select
            value={status}
            style={{ width: 120 }}
            onChange={(value) =>
              updateStatus(record.id, value)
            }
            options={[
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Paid",
                value: "paid",
              },
              {
                label: "Partial",
                value: "partial",
              },
            ]}
          />
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

    {
      title: "Action",

      render: (_, record) => (

        <Button
          type="link"
          onClick={() =>
            window.location.href =
              `/invoices-detail/${record.id}`
          }
        >
          View
        </Button>
      ),
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
          <Input.TextArea
              placeholder="Customer Address"
              value={address}
              rows={3}
              onChange={(e) =>
                setAddress(e.target.value)
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