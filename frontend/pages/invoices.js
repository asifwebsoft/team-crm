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

  // ✅ FIXED ITEMS STATE

  const [items, setItems] = useState([
    {
      product: "",
      product_name: "",
      unit: "",
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

  // ✅ FIXED INVENTORY STATE

  const [inventory, setInventory] =
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

      alert(
        JSON.stringify(
          err?.response?.data
        )
      );
    }
  };

  // ✅ FETCH INVENTORY

  const fetchInventory = async () => {

    try {

      const response = await API.get(
        "/inventory/"
      );

      setInventory(response.data);

    } catch (err) {

      console.log(err);

      message.error(
        "Failed to load inventory"
      );
    }
  };

  // ✅ FIXED USE EFFECT

  useEffect(() => {

    fetchInvoices();

    fetchInventory();

  }, []);

  // ✅ ADD PRODUCT

  const addItem = () => {

    setItems([
      ...items,
      {
        product: "",
        product_name: "",
        unit: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  // ✅ HANDLE CHANGE

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

    if (!customerName.trim()) {

      message.error(
        "Customer name required"
      );

      return;
    }

    if (!phone.trim()) {

      message.error(
        "Phone number required"
      );

      return;
    }

    const phoneRegex = /^[0-9]+$/;

    if (!phoneRegex.test(phone)) {

      message.error(
        "Phone number must contain only numbers"
      );

      return;
    }

    if (phone.length < 10) {

      message.error(
        "Phone number must be at least 10 digits"
      );

      return;
    }

    if (phone.length > 12) {

      message.error(
        "Phone number cannot exceed 12 digits"
      );

      return;
    }

    if (!address.trim()) {

      message.error(
        "Address required"
      );

      return;
    }

    // ✅ FIXED VALIDATION

    const invalidItem = items.find(
      (item) =>

        !item.product

        ||

        item.quantity <= 0

        ||

        item.price <= 0
    );

    if (invalidItem) {

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
        }
      );

      if (response.status === 201) {

        message.success(
          "Invoice Created"
        );

        setCustomerName("");

        setPhone("");

        setAddress("");

        // ✅ RESET FIXED

        setItems([
          {
            product: "",
            product_name: "",
            unit: "",
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

  // ✅ FILTER

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

  // ✅ SUMMARY

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
  ];

  const COLORS = [
    "#52c41a",
    "#faad14",
  ];

  // ✅ TABLE

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
            ]}
          />
        );
      },
    },

    {
      title: "Action",

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
            placeholder="Address"
            value={address}
            rows={3}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />

          {/* ✅ PRODUCTS */}

          {items.map((item, index) => (

            <Space
              key={index}
              style={{
                display: "flex",
                marginBottom: 10,
              }}
            >

              {/* ✅ FIXED SELECT */}

              <Select
                placeholder="Select Product"
                style={{ width: 220 }}
                value={item.product || undefined}

                onChange={(value, option) => {

                  const updated = [...items];

                  updated[index].product =
                    value;

                  updated[index].product_name =
                    option.children;

                  updated[index].unit =
                    option.unit;

                  updated[index].price =
                    Number(option.price);

                  setItems(updated);
                }}
              >

                {inventory?.map((p) => (

                  <Select.Option
                    key={p.id}
                    value={p.id}
                    unit={p.unit}
                    price={p.price}
                  >
                    {p.product_name}
                  </Select.Option>

                ))}

              </Select>

              <div
                style={{
                  fontSize: 12,
                  color: "#888",
                }}
              >

                Available Stock:
                {

                  inventory.find(
                    (p) =>
                      p.id === item.product
                  )?.stock_quantity

                }

              </div>

              {/* ✅ UNIT */}

              <Input
                placeholder="Unit"
                value={item.unit}
                disabled
                style={{ width: 100 }}
              />

              {/* ✅ QTY */}

              <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  style={{ width: 100 }}

                  onChange={(e) => {

                    const qty = Number(
                      e.target.value
                    );

                    // ✅ PRODUCT FIND

                    const selectedProduct =
                      inventory.find(
                        (p) =>
                          p.id === item.product
                      );

                    // ✅ STOCK VALIDATION

                    if (
                      selectedProduct &&
                      qty >
                      Number(
                        selectedProduct.stock_quantity
                      )
                    ) {

                      message.warning(

                        `Only ${selectedProduct.stock_quantity} stock available`
                      );

                      return;
                    }

                    handleChange(
                      index,
                      "quantity",
                      qty
                    );
                  }}
                />

              {/* ✅ PRICE */}

              <Input
                type="number"
                placeholder="Price"
                value={item.price}
                style={{ width: 120 }}

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

          {/* ✅ GST */}

          <Row
            gutter={[16, 16]}
            style={{
              marginTop: 10,
            }}
          >

            <Col xs={24} md={12}>

              <Input
                type="number"
                placeholder="CGST"
                value={cgst}
                onChange={(e) =>
                  setCgst(e.target.value)
                }
              />

            </Col>

            <Col xs={24} md={12}>

              <Input
                type="number"
                placeholder="SGST"
                value={sgst}
                onChange={(e) =>
                  setSgst(e.target.value)
                }
              />

            </Col>

          </Row>

          <Button
            type="primary"
            loading={loading}
            onClick={createInvoice}
          >
            Generate Invoice
          </Button>

        </Space>

        <Divider />

        {/* ✅ LIST */}

        <Title level={4}>
          Invoice List
        </Title>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
        />

      </Card>

      {/* ✅ MODAL */}

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

        </Space>

      </Modal>

    </MainLayout>
  );
}