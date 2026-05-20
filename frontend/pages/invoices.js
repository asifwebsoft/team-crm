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
  Statistic,
  Modal,
  Switch
} from "antd";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  const [isEditModalOpen,
  setIsEditModalOpen] =
  useState(false);

  const [editingInvoice,
    setEditingInvoice] =
    useState(null);

  const [editCustomerName,
    setEditCustomerName] =
    useState("");

  const [editPhone,
    setEditPhone] =
    useState("");

  const [editAddress,
    setEditAddress] =
    useState("");

  const [editStatus,
    setEditStatus] =
    useState("pending");

  const [cgst, setCgst] =
  useState("");

  const [sgst, setSgst] =
    useState("");

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
      alert(
          JSON.stringify(
            err?.response?.data
          )
        );
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

    alert("Customer name required");

    message.error(
      "Customer name required"
    );

    return;
  }

  if (!phone.trim()) {

    alert("Phone number required");

    message.error(
      "Phone number required"
    );

    return;
  }

  // ✅ PHONE VALIDATION

const phoneRegex = /^[0-9]+$/;

if (!phoneRegex.test(phone)) {

  alert(
    "Phone number must contain only numbers"
  );

  message.error(
    "Phone number must contain only numbers"
  );

  return;
}

if (phone.length < 10) {

  alert(
    "Phone number must be at least 10 digits"
  );

  message.error(
    "Phone number must be at least 10 digits"
  );

  return;
}

if (phone.length > 12) {

  alert(
    "Phone number cannot exceed 12 digits"
  );

  message.error(
    "Phone number cannot exceed 12 digits"
  );

  return;
}

  if (!address.trim()) {

    alert("Address required");

    message.error(
      "Address required"
    );

    return;
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

    alert(
      "Please fill all product details correctly"
    );

    message.error(
      "Please fill all product details correctly"
    );

    return;
  }

  try {

    setLoading(true);

    const response = await API.post(
  "/invoices/create/",
  {

    customer_name:
      customerName,

    phone,

    address,

    status: "pending",

    items,

    cgst,

    sgst,

    // ✅ GST FLAG

  
  }
);

    if (response.status === 201) {

      message.success(
        "Invoice Created"
      );

      alert(
        "Invoice Created Successfully"
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

    alert(
      JSON.stringify(
        err?.response?.data
      )
    );

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

  // ✅ OPEN EDIT MODAL

const openEditModal = (
  invoice
) => {

  setEditingInvoice(invoice);

  setEditCustomerName(
    invoice.customer_name
  );

  setEditPhone(
    invoice.phone
  );

  setEditAddress(
    invoice.address
  );

  setEditStatus(
    invoice.status
  );

  setIsEditModalOpen(true);
};

// ✅ UPDATE INVOICE

const handleUpdateInvoice =
  async () => {

    try {

      await API.patch(
        `/invoices/update/${editingInvoice.id}/`,
        {
          customer_name:
            editCustomerName,

          phone:
            editPhone,

          address:
            editAddress,

          status:
            editStatus,
        }
      );

      message.success(
        "Invoice Updated"
      );

      setIsEditModalOpen(false);

      fetchInvoices();

    } catch (err) {

      message.error(
        err?.response?.data?.error
        ||
        "Update failed"
      );
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

      // ✅ CHART DATA

const chartData = [
  {
    name: "Paid",
    value: paidAmount,
  },
  {
    name: "Pending",
    value: pendingAmount,
  },
  {
    name: "Cancelled",
    value: invoiceList.filter(
      (item) =>
        item.status === "cancelled"
    ).length,
  },
];

const COLORS = [
  "#52c41a",
  "#faad14",
  "#ff4d4f",
];

  // ✅ TABLE COLUMNS

  const columns = [

  {
    title: "Invoice No",
    dataIndex: "invoice_number",
    width: 180,
  },

  {
    title: "Customer",
    dataIndex: "customer_name",
    width: 200,
  },

  {
    title: "Phone",
    dataIndex: "phone",
    width: 150,
  },

  {
    title: "Amount",
    dataIndex: "total_amount",
    width: 140,

    render: (amount) =>
      `₹${amount}`,
  },

  {
    title: "Status",
    dataIndex: "status",
    width: 180,

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

      if (status === "cancelled") {
        color = "red";
      }

      if (role === "staff") {

        return (
          <Tag color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      }

      return (

        <Select
          value={status}
          style={{ width: 140 }}
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
            {
              label: "Cancelled",
              value: "cancelled",
            },
          ]}
        />
      );
    },
  },

  {
    title: "Created By",
    dataIndex: "created_by",
    width: 180,
  },

  {
    title: "Date",
    dataIndex: "created_at",
    width: 220,
  },

  {
    title: "Action",
    width: 180,

    render: (_, record) => (

      <Space>

        <Button
          type="link"
          onClick={() =>
            window.location.href =
              `/invoice-detail?id=${record.id}`
          }
        >
          View
        </Button>

        {role !== "staff" && (

          <Button
            type="link"
            onClick={() =>
              openEditModal(record)
            }
          >
            Edit
          </Button>

        )}

      </Space>
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

        <Card
  style={{
    marginBottom: 25,
  }}
>

  <Title level={4}>
    Invoice Analytics
  </Title>

  <div
    style={{
      width: "100%",
      height: 300,
    }}
  >

    <ResponsiveContainer
        width="100%"
        height={300}
      >

      <PieChart>

        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >

          {chartData.map(
            (entry, index) => (

              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[index %
                  COLORS.length]
                }
              />

            )
          )}

        </Pie>

        <Tooltip />

      </PieChart>

    </ResponsiveContainer>

  </div>

</Card>

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

          <Row
              gutter={[16, 16]}
              style={{
                marginTop: 10,
              }}
            >

              <Col xs={24} md={12}>

                <Input
                  type="number"
                  placeholder="CGST Amount (Optional)"
                  value={cgst}
                  onChange={(e) =>
                    setCgst(e.target.value)
                  }
                />

              </Col>

              <Col xs={24} md={12}>

                <Input
                  type="number"
                  placeholder="SGST Amount (Optional)"
                  value={sgst}
                  onChange={(e) =>
                    setSgst(e.target.value)
                  }
                />

              </Col>

            </Row>

          <div
  style={{
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>

  

  <span
    style={{
      fontWeight: 500,
    }}
  >
    Apply GST
  </span>

</div>

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

              <Select.Option value="cancelled">
                Cancelled
              </Select.Option>

            </Select>

          </Col>

        </Row>

         <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              x: 1400,
            }}
            size="small"
          />

        </div>

      </Card>

      <Modal
  title="Edit Invoice"
  open={isEditModalOpen}
  onCancel={() =>
    setIsEditModalOpen(false)
  }
  onOk={handleUpdateInvoice}
>

  <Space
    direction="vertical"
    style={{ width: "100%" }}
  >

    <Input
      placeholder="Customer Name"
      value={editCustomerName}
      onChange={(e) =>
        setEditCustomerName(
          e.target.value
        )
      }
    />

    <Input
      placeholder="Phone"
      value={editPhone}
      onChange={(e) =>
        setEditPhone(
          e.target.value
        )
      }
    />

    <Input.TextArea
      placeholder="Address"
      rows={3}
      value={editAddress}
      onChange={(e) =>
        setEditAddress(
          e.target.value
        )
      }
    />

    <Select
      value={editStatus}
      onChange={(value) =>
        setEditStatus(value)
      }
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

  </Space>

</Modal>

    </MainLayout>
  );
}