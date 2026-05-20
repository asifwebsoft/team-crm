import { useEffect, useState } from "react";

import {
  Card,
  Typography,
  Table,
  Tag,
  Input,
  Row,
  Col,
  Select
} from "antd";

import MainLayout from "../components/Layout";

import API from "../services/api";

const { Title } = Typography;

export default function LeadHistory() {

  const [data, setData] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  // ✅ LOAD HISTORY

  useEffect(() => {

    fetchHistory();

  }, []);

  const fetchHistory = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/leads/history/"
      );

      setData(response.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  // ✅ FILTERED DATA

  const filteredData = data.filter(
    (item) => {

      const matchesSearch =

        item.lead_name
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )

        ||

        item.notes
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )

        ||

        item.created_by
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )

        ||

        item.phone
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          );

      // ✅ DATE FILTER

      let matchesDate = true;

      if (dateFilter === "today") {

        const today =
          new Date()
            .toLocaleDateString(
              "en-GB"
            );

        matchesDate =
          item.created_at?.includes(
            today.split("/").join("-")
          );
      }

      return (
        matchesSearch &&
        matchesDate
      );
    }
  );

  // ✅ TABLE COLUMNS

  const columns = [

    {
      title: "Customer Name",

      dataIndex: "lead_name",

      width: 220,

      render: (text) => (

        <div
          style={{
            minWidth: 180,
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "20px",
          }}
        >
          {text || "-"}
        </div>
      ),
    },

    {
      title: "Phone",

      dataIndex: "phone",

      width: 150,

      render: (text) => (

        <span>
          {text || "-"}
        </span>
      ),
    },

    {
      title: "Notes",

      dataIndex: "notes",

      width: 320,

      render: (text) => (

        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "20px",
          }}
        >
          {text || "-"}
        </div>
      ),
    },

    {
      title: "Next Follow-up",

      dataIndex: "next_followup_date",

      width: 180,

      render: (date) => (

        date ?

          <Tag color="blue">
            {date}
          </Tag>

          :

          "-"
      )
    },

    {
      title: "Updated By",

      dataIndex: "created_by",

      width: 180,

      render: (text) => (
        <span>
          {text || "-"}
        </span>
      ),
    },

    {
      title: "Updated At",

      dataIndex: "created_at",

      width: 220,

      render: (text) => (
        <span>
          {text || "-"}
        </span>
      ),
    },

  ];

  return (

    <MainLayout>

      <Card
        style={{
          margin: 20,
          borderRadius: 14,
        }}
      >

        <Title level={3}>
          Lead History
        </Title>

        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 20,
            marginTop: 20,
          }}
        >

          <Col xs={24} md={12}>

            <Input
              placeholder="Search lead, notes, phone or employee"
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              allowClear
            />

          </Col>

          <Col xs={24} md={12}>

            <Select
              style={{
                width: "100%",
              }}

              placeholder="Filter by date"

              value={
                dateFilter || undefined
              }

              onChange={(value) =>
                setDateFilter(value)
              }

              allowClear
            >

              <Select.Option value="today">
                Today
              </Select.Option>

            </Select>

          </Col>

        </Row>

        {/* ✅ RESPONSIVE TABLE */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >

          <Table
            columns={columns}

            dataSource={filteredData}

            loading={loading}

            rowKey="id"

            pagination={{
              pageSize: 10,
            }}

            scroll={{
              x: 1300,
            }}

            size="small"
          />

        </div>

      </Card>

    </MainLayout>
  );
}