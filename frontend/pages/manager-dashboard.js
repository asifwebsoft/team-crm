import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function ManagerDashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    API.get("/leads/manager-dashboard/")
      .then((res) => setData(res.data))
      .catch(console.log);
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Leads", dataIndex: "leads" },
    { title: "Closed", dataIndex: "closed" },
  ];

  const recentColumns = [
    { title: "Customer", dataIndex: "customer_name" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => <Tag color={s === "closed" ? "green" : "blue"}>{s}</Tag>,
    },
  ];

  return (
    <MainLayout>
      <h2>Manager Dashboard</h2>

      {/* TOP CARDS */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Total Leads">
            <h2>{data.total || 0}</h2>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Closed Leads">
            <h2>{data.closed || 0}</h2>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Today Followups">
            <h2>{data.today || 0}</h2>
          </Card>
        </Col>
      </Row>

      {/* TEAM PERFORMANCE */}
      <Card title="Team Performance" style={{ marginTop: 20 }}>
        <Table
          dataSource={data.team || []}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* RECENT LEADS */}
      <Card title="Recent Leads" style={{ marginTop: 20 }}>
        <Table
          dataSource={data.recent || []}
          columns={recentColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </MainLayout>
  );
}