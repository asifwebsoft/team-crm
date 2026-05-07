import { useEffect, useState } from "react";
import { Table, Card } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function Team() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/accounts/staff-list/")
      .then((res) => setData(res.data))
      .catch(console.log);
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Mobile", dataIndex: "mobile" },
  ];

  return (
    <MainLayout>
      <Card title="My Team">
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </MainLayout>
  );
}