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
  Select,
  Row,
  Col,
  Statistic
} from "antd";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

export default function InvoicesPage() {

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [searchText, setSearchText] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [items, setItems] = useState([
    {
      product_name: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const [loading, setLoading] =
    useState(false);

  const [invoiceList, setInvoiceList] =
    useState([]);

  // ✅ USER ROLE

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("role")
      : null;

  // ✅ FETCH INVOICES

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

  // ✅ ADD PRODUCT

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

  // ✅ HANDLE PRODUCT CHANGE

  const handleChange = (
    index,
    field,
    value
  ) => {

    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  };

  // ✅ TOTAL

  const totalAmount = items.reduce(
    (sum, item) => {

      return (
        sum +
        (item.quantity * item.price)
      );

    },
    0
  );

  // ✅ CREATE INVOICE

  const createInvoice = async () => {

    // ✅ FRONTEND VALIDATION

    if (!customerName.trim()) {

      return message.error(
        "Customer name required"
      );
    }

    if (!phone.trim()) {

      return message.error(
        "Phone number required"
      );
    }

    if (!address.trim()) {

      return message.error(
        "Address required"
      );
    }

    const invalidItem = items.find(
      (item) =>

        !item.product_name.trim()

        ||

        item.quantity <= 0

        ||

        item.price <= 0
    );

    if (invalidItem) {

      return message.error(
        "Please fill all product details correctly"
      );
    }

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

        message.success(
          "Invoice Created"
        );

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

        fetchInvoices();
      }

    } catch (err) {

      console.log(err);

      const errorMessage =

        err?.response?.data?.error

        ||

        "Failed to create invoice";

      message.error(errorMessage);

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

      message.success(
        "Status Updated"
      );

      fetchInvoices();

    } catch (err) {

      message.error("Failed");
    }
  };

  // ✅ SEARCH + FILTER

  const filteredData =
    invoiceList.filter((item) => {

      const matchesSearch =

        item.customer_name
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )

        ||

        item.invoice_number
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      const matchesStatus =

        statusFilter
          ? item.status === statusFilter
          : true;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ✅ DASHBOARD SUMMARY

  const totalInvoices =
    invoiceList.length;

  const totalRevenue =
    invoiceList.reduce(
      (sum, item) =>
        sum +
        Number(item.total_amount),
      0
    );

  const paidAmount =
    invoiceList
      .filter(
        (item) =>
          item.status === "paid"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.total_amount),
        0
      );

  const pendingAmount =
    invoiceList
      .filter(
        (item) =>
          item.status === "pending"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.total_amount),
        0
      );

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
      render: (amount) =>
        `₹${amount}`,
    },

    // ✅ STATUS

    {
      title: "Status",
      dataIndex: "status",

      render: (
        status,
        record
      ) => {

        let color = "orange";

        if (status === "paid") {
          color = "green";
        }

        if (status === "partial") {
          color = "blue";
        }

        // ✅ STAFF VIEW

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
              updateStatus(
                record.id,
                value
              )
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
              `/invoice-detail?id=${record.id}`
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

        {/* ✅ DASHBOARD CARDS */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 25,
          }}
        >

          <Col xs={24} sm={12} md={6}>

            <Card>
              <Statistic
                title="Total Invoices"
                value={totalInvoices}
              />
            </Card>

          </Col>

          <Col xs={24} sm={12} md={6}>

            <Card>
              <Statistic
                title="Total Revenue"
                value={totalRevenue}
                prefix="₹"
              />
            </Card>

          </Col>

          <Col xs={24} sm={12} md={6}>

            <Card>
              <Statistic
                title="Paid Amount"
                value={paidAmount}
                prefix="₹"
              />
            </Card>

          </Col>

          <Col xs={24} sm={12} md={6}>

            <Card>
              <Statistic
                title="Pending Amount"
                value={pendingAmount}
                prefix="₹"
              />
            </Card>

          </Col>

        </Row>

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
              setCustomerName(
                e.target.value
              )
            }
          />

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />

          <Input.TextArea
            placeholder="Customer Address"
            value={address}
            rows={3}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
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
                    Number(
                      e.target.value
                    )
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
                    Number(
                      e.target.value
                    )
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

        {/* ✅ INVOICE LIST */}

        <Title level={4}>
          Invoice List
        </Title>

        {/* ✅ FILTERS */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col xs={24} md={12}>

            <Input
              placeholder="Search customer or invoice number"
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

          </Col>

          <Col xs={24} md={12}>

            <Select
              style={{
                width: "100%"
              }}
              placeholder="Filter by status"
              value={
                statusFilter ||
                undefined
              }
              onChange={(value) =>
                setStatusFilter(
                  value
                )
              }
              allowClear
            >

              <Select.Option value="pending">
                Pending
              </Select.Option>

              <Select.Option value="paid">
                Paid
              </Select.Option>

              <Select.Option value="partial">
                Partial
              </Select.Option>

            </Select>

          </Col>

        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 5
          }}
        />

      </Card>

    </MainLayout>
  );
}