import { useEffect, useState } from "react";
import { Table } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function LoginActivity() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/accounts/login-activity/")
      .then((res) => {
        console.log("DATA:", res.data); // 🔥 debug
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "User ID", dataIndex: "user_id" },
    { title: "Login Time", dataIndex: "login" },
    { title: "Logout Time", dataIndex: "logout" },
    { title: "Duration", dataIndex: "duration" },
  ];

  return (
    <MainLayout>
      <h2>Login Activity</h2>

      <Table dataSource={data} columns={columns} rowKey="id" />
    </MainLayout>
  );
}