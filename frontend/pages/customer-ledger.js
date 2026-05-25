import { useEffect, useState } from "react";

import {
  Card,
  Table,
  Typography,
  Input,
  Tag,
  Row,
  Col,
  Statistic,
} from "antd";

import MainLayout from "../components/Layout";

import API from "../services/api";

const { Title } = Typography;

export default function CustomerLedger() {

  const [data, setData] =
    useState([]);

  const [search, setSearch] =
    useState("");

  // ✅ FETCH

  const fetchLedger = async () => {

    try {

      const response =
        await API.get(
          "/invoices/customer-ledger/"
        );

      setData(response.data);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    fetchLedger();

  }, []);

  // ✅ FILTER

  const filteredData =
    data.filter((item) =>

      item.customer_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ✅ SUMMARY

  const totalCustomers =
    filteredData.length;

  const totalDue =
    filteredData.reduce(

      (sum, item) =>

        sum +
        Number(item.due_amount),

      0
    );

  // ✅ TABLE

  const columns = [

    {
      title: "Customer",

      dataIndex:
        "customer_name",
    },

    {
      title: "Phone",

      dataIndex:
        "phone",
    },

    {
      title: "Invoices",

      dataIndex:
        "invoice_count",
    },

    {
      title: "Total Amount",

      dataIndex:
        "total_amount",

      render: (value) => (
        <span>
          ₹{value}
        </span>
      ),
    },

    {
      title: "Paid",

      dataIndex:
        "paid_amount",

      render: (value) => (

        <Tag color="green">
          ₹{value}
        </Tag>

      ),
    },

    {
      title: "Due",

      dataIndex:
        "due_amount",

      render: (value) => {

        const isDue =
          Number(value) > 0;

        return (

          <Tag
            color={
              isDue
                ? "red"
                : "green"
            }
          >
            ₹{value}
          </Tag>

        );
      },
    },
  ];

  return (

    <MainLayout>

      <div
        style={{
          maxWidth: 1300,
          margin: "20px auto",
        }}
      >

        {/* TITLE */}

        <Title level={2}>
          Customer Ledger
        </Title>

        {/* SUMMARY */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Total Customers"
                value={totalCustomers}
              />

            </Card>

          </Col>

          <Col xs={24} md={12}>

            <Card>

              <Statistic
                title="Total Due Amount"
                value={totalDue}
                prefix="₹"
              />

            </Card>

          </Col>

        </Row>

        {/* SEARCH */}

        <Card
          style={{
            marginBottom: 20,
          }}
        >

          <Input
            placeholder="Search Customer"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </Card>

        {/* TABLE */}

        <Card>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="customer_name"
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