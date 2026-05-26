import { useEffect, useState } from "react";

import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Tag,
} from "antd";

import MainLayout from "../components/Layout";

import API from "../services/api";

const { Title } = Typography;

export default function EmployeeSalesPage() {

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const currentYear =
    new Date().getFullYear();

  const currentMonth =
    new Date().getMonth() + 1;

  const [month, setMonth] =
    useState(currentMonth);

  const [year, setYear] =
    useState(currentYear);

  // ✅ FETCH

  const fetchData =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(

            `/invoices/employee-sales/?month=${month}&year=${year}`
          );

        setData(
          response.data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchData();

  }, [month, year]);

  // ✅ TOTALS

  const totalSales =
    data.reduce(

      (sum, item) =>

        sum +
        Number(item.total_sales),

      0
    );

  const totalInvoices =
    data.reduce(

      (sum, item) =>

        sum +
        Number(item.invoice_count),

      0
    );

  // ✅ TABLE

  const columns = [

    {
      title: "Employee",

      dataIndex:
        "employee_name",

      render: (name) => (

        <strong>
          {name}
        </strong>

      ),
    },

    {
      title: "Invoices",

      dataIndex:
        "invoice_count",

      render: (count) => (

        <Tag color="blue">
          {count}
        </Tag>

      ),
    },

    {
      title: "Total Sales",

      dataIndex:
        "total_sales",

      render: (sales) => (

        <Tag color="green">
          ₹{sales}
        </Tag>

      ),
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

        {/* HEADER */}

        <Title level={2}>
          Employee Sales Analytics
        </Title>

        {/* FILTERS */}

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
          }}
        >

          <Col xs={12} md={6}>

            <Select

              value={month}

              onChange={setMonth}

              style={{
                width: "100%",
              }}
            >

              {[...Array(12)].map(
                (_, index) => (

                  <Select.Option

                    key={index + 1}

                    value={index + 1}
                  >

                    Month {index + 1}

                  </Select.Option>
                )
              )}

            </Select>

          </Col>

          <Col xs={12} md={6}>

            <Select

              value={year}

              onChange={setYear}

              style={{
                width: "100%",
              }}
            >

              <Select.Option
                value={2025}
              >
                2025
              </Select.Option>

              <Select.Option
                value={2026}
              >
                2026
              </Select.Option>

            </Select>

          </Col>

        </Row>

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

                title="Total Invoices"

                value={totalInvoices}
              />

            </Card>

          </Col>

          <Col xs={24} md={12}>

            <Card>

              <Statistic

                title="Total Sales"

                value={totalSales}

                prefix="₹"
              />

            </Card>

          </Col>

        </Row>

        {/* TABLE */}

        <Card>

          <Table

            columns={columns}

            dataSource={data}

            rowKey="employee_name"

            loading={loading}

            bordered
          />

        </Card>

      </div>

    </MainLayout>
  );
}