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

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

    const [searchText,
    setSearchText] =
    useState("");

    const [dateFilter,
    setDateFilter] =
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
        item.created_at.includes(
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
      title: "Lead",
      dataIndex: "lead_name",
    },

    {
      title: "Phone",
      dataIndex: "phone",
    },

    {
      title: "Notes",
      dataIndex: "notes",
    },

    {
      title: "Next Follow-up",
      dataIndex:
        "next_followup_date",

      render: (date) => (

        date
          ?

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
    },

    {
      title: "Updated At",
      dataIndex: "created_at",
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
      placeholder="Search lead, notes or employee"
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

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
        />

      </Card>

    </MainLayout>
  );
}