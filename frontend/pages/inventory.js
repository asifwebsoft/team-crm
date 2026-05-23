import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Table,
  message,
  Select,
  Row,
  Col,
  Statistic,
  Tag,
} from "antd";

import {
  AppstoreOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import MainLayout from "../components/Layout";
import API from "../services/api";

const { Title } = Typography;

export default function InventoryPage() {

  const [loading, setLoading] =
    useState(false);

  const [inventory, setInventory] =
    useState([]);

  const [productName,
    setProductName] =
    useState("");

  const [unit,
    setUnit] =
    useState("Piece");

  const [stockQuantity,
    setStockQuantity] =
    useState("");

  const [price,
    setPrice] =
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

  useEffect(() => {

    fetchInventory();

  }, []);

  // ✅ ADD INVENTORY

  const addInventory = async () => {

    if (!productName.trim()) {

      message.error(
        "Product name required"
      );

      return;
    }

    if (!stockQuantity) {

      message.error(
        "Stock quantity required"
      );

      return;
    }

    if (!price) {

      message.error(
        "Price required"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(
        "/inventory/",
        {
          product_name:
            productName,

          unit,

          stock_quantity:
            stockQuantity,

          price,
        }
      );

      message.success(
        "Inventory Added"
      );

      setProductName("");

      setUnit("Piece");

      setStockQuantity("");

      setPrice("");

      fetchInventory();

    } catch (err) {

      console.log(err);

      message.error(
        err?.response?.data?.error
        ||
        "Failed to add inventory"
      );

    } finally {

      setLoading(false);
    }
  };

  // ✅ SUMMARY

  const totalProducts =
    inventory.length;

  const totalStockValue =
    inventory.reduce(
      (sum, item) => {

        return (
          sum +
          (
            Number(
              item.stock_quantity
            )
            *
            Number(item.price)
          )
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
      title: "Unit",
      dataIndex: "unit",

      render: (unit) => (
        <Tag color="blue">
          {unit}
        </Tag>
      ),
    },

    {
      title: "Stock",
      dataIndex: "stock_quantity",
    },

    {
      title: "Price",
      dataIndex: "price",

      render: (price) =>
        `₹${price}`,
    },

    {
      title: "Stock Value",

      render: (_, record) => {

        const total =
          Number(
            record.stock_quantity
          )
          *
          Number(record.price);

        return `₹${total}`;
      },
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

        {/* ✅ TOP SUMMARY */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Total Products"
                value={totalProducts}
                prefix={
                  <AppstoreOutlined />
                }
              />

            </Card>

          </Col>

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Inventory Value"
                value={totalStockValue}
                prefix="₹"
              />

            </Card>

          </Col>

        </Row>

        {/* ✅ ADD INVENTORY */}

        <Card
          style={{
            marginBottom: 20,
            borderRadius: 10,
          }}
        >

          <Title level={3}>
            Inventory Management
          </Title>

          <Space
            direction="vertical"
            style={{
              width: "100%",
            }}
          >

            <Input
              placeholder="Product Name"
              value={productName}
              onChange={(e) =>
                setProductName(
                  e.target.value
                )
              }
            />

            <Select
              value={unit}
              onChange={setUnit}
            >

              <Select.Option value="Piece">
                Piece
              </Select.Option>

              <Select.Option value="Packet">
                Packet
              </Select.Option>

              <Select.Option value="Kg">
                Kg
              </Select.Option>

              <Select.Option value="Gram">
                Gram
              </Select.Option>

              <Select.Option value="Litre">
                Litre
              </Select.Option>

            </Select>

            <Input
              type="number"
              placeholder="Stock Quantity"
              value={stockQuantity}
              onChange={(e) =>
                setStockQuantity(
                  e.target.value
                )
              }
            />

            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

            <Button
              type="primary"
              icon={<InboxOutlined />}
              loading={loading}
              onClick={addInventory}
            >
              Add Inventory
            </Button>

          </Space>

        </Card>

        {/* ✅ INVENTORY TABLE */}

        <Card
          style={{
            borderRadius: 10,
          }}
        >

          <Title level={4}>
            Inventory List
          </Title>

          <Table
            columns={columns}
            dataSource={inventory}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              x: 800,
            }}
          />

        </Card>

      </div>

    </MainLayout>
  );
}