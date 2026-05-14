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

    API.get("/accounts/login-activity/")

      .then((res) => {

        console.log("LOGIN ACTIVITY:", res.data);

        setData(res.data || []);

      })

      .catch((err) => console.log(err));

  }, []);

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

      render: (value) => (

        value ? (
          value
        ) : (
          <Tag color="green">
            Active
          </Tag>
        )

      ),
    },

    {
      title: "Working Duration",
      dataIndex: "duration",

      render: (value) => (

        <Tag color="blue">
          {value || "0 sec"}
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