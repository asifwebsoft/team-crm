import { useEffect, useState } from "react";

import {
  Table,
  Tag,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function LoginActivity() {

  const [data, setData] = useState([]);

  useEffect(() => {

    fetchLoginActivity();

  }, []);

  const fetchLoginActivity = () => {

    API.get("/accounts/login-activity/")

      .then((res) => {

        console.log(
          "LOGIN ACTIVITY:",
          res.data
        );

        setData(res.data || []);

      })

      .catch((err) => {

        console.log(err);

      });

  };

  const columns = [

    {
      title: "Name",
      dataIndex: "name",
    },

    {
      title: "User ID",
      dataIndex: "user_id",
    },

    {
      title: "Login Time",
      dataIndex: "login",
    },

    {
      title: "Logout Time",
      dataIndex: "logout",

      render: (_, record) => (

        record.is_active ? (

          <Tag color="green">
            Active
          </Tag>

        ) : (

          record.logout || "-"
        )

      ),
    },

    {
      title: "Working Duration",
      dataIndex: "duration",

      render: (value) => (

        <Tag color="blue">

          {value || "0h 0m 0s"}

        </Tag>

      ),
    },

  ];

  return (

    <MainLayout>

      <div
        style={{
          padding: 10,
        }}
      >

        <h2
          style={{
            marginBottom: 20,
          }}
        >
          Login Activity
        </h2>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: 800 }}
        />

      </div>

    </MainLayout>

  );

}