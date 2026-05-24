import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Select,
  Input,
  Button,
  Space,
  Table,
  message,
  Row,
  Col,
  Statistic,
  Tag,
} from "antd";

import {
  ShoppingCartOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

export default function PurchaseEntryPage() {

  const [loading, setLoading] =
    useState(false);

  const [inventory, setInventory] =
    useState([]);

  const [purchaseList,
    setPurchaseList] =
    useState([]);

  const [product,
    setProduct] =
    useState("");

  const [quantity,
    setQuantity] =
    useState("");

  const [supplierName,
    setSupplierName] =
    useState("");

  const [note,
    setNote] =
    useState("");

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

  // ✅ FETCH PURCHASES

  const fetchPurchases = async () => {

    try {

      const response = await API.get(
        "/inventory/purchase-entry/"
      );

      setPurchaseList(response.data);

    } catch (err) {

      console.log(err);

      message.error(
        "Failed to load purchases"
      );
    }
  };

  useEffect(() => {

    fetchInventory();

    fetchPurchases();

  }, []);

  // ✅ ADD PURCHASE

  const addPurchase = async () => {

    if (!product) {

      message.error(
        "Please select product"
      );

      return;
    }

    if (!quantity || quantity <= 0) {

      message.error(
        "Quantity must be greater than 0"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(
        "/inventory/purchase-entry/",
        {

          product,

          quantity,

          supplier_name:
            supplierName,

          note,
        }
      );

      message.success(
        "Purchase entry added"
      );

      setProduct("");

      setQuantity("");

      setSupplierName("");

      setNote("");

      fetchInventory();

      fetchPurchases();

    } catch (err) {

      console.log(err);

      message.error(
        err?.response?.data?.error
        ||
        "Failed to add purchase"
      );

    } finally {

      setLoading(false);
    }
  };

  // ✅ SUMMARY

  const totalPurchases =
    purchaseList.length;

  const totalPurchaseQty =
    purchaseList.reduce(
      (sum, item) => {

        return (
          sum +
          Number(item.quantity)
        );

      },
      0
    );

  // ✅ TABLE

  const columns = [

    {
      title: "Product",
      dataIndex: "product_name",
    },

    {
      title: "Quantity",
      dataIndex: "quantity",

      render: (qty) => (

        <Tag color="blue">
          +{qty}
        </Tag>

      ),
    },

    {
      title: "Supplier",
      dataIndex: "supplier_name",

      render: (supplier) =>

        supplier || "-",
    },

    {
      title: "Note",
      dataIndex: "note",

      render: (note) =>
        note || "-",
    },

    {
      title: "Date",
      dataIndex: "created_at",
    },
  ];

  return (

    <MainLayout>

      <div
        style={{
          maxWidth: 1200,
          margin: "20px auto",
        }}
      >

        {/* ✅ TOP CARDS */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Total Purchases"
                value={totalPurchases}
                prefix={
                  <ShoppingCartOutlined />
                }
              />

            </Card>

          </Col>

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Total Purchased Qty"
                value={totalPurchaseQty}
                prefix="+"
              />

            </Card>

          </Col>

        </Row>

        {/* ✅ PURCHASE FORM */}

        <Card
          style={{
            marginBottom: 20,
            borderRadius: 10,
          }}
        >

          <Title level={3}>
            Purchase Entry
          </Title>

          <Space
            direction="vertical"
            style={{
              width: "100%",
            }}
          >

            {/* PRODUCT */}

            <Select
              placeholder="Select Product"
              value={
                product || undefined
              }
              onChange={setProduct}
            >

              {inventory.map((item) => (

                <Select.Option
                  key={item.id}
                  value={item.id}
                >
                  {item.product_name}
                </Select.Option>

              ))}

            </Select>

            {/* QTY */}

            <Input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
            />

            {/* SUPPLIER */}

            <Input
              placeholder="Supplier Name (Optional)"
              value={supplierName}
              onChange={(e) =>
                setSupplierName(
                  e.target.value
                )
              }
            />

            {/* NOTE */}

            <Input.TextArea
              rows={3}
              placeholder="Note (Optional)"
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
            />

            {/* BUTTON */}

            <Button
              type="primary"
              icon={<InboxOutlined />}
              loading={loading}
              onClick={addPurchase}
            >
              Add Purchase Entry
            </Button>

          </Space>

        </Card>

        {/* ✅ PURCHASE TABLE */}

        <Card
          style={{
            borderRadius: 10,
          }}
        >

          <Title level={4}>
            Purchase History
          </Title>

          <Table
            columns={columns}
            dataSource={purchaseList}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              x: 900,
            }}
          />

        </Card>

      </div>

    </MainLayout>
  );
}