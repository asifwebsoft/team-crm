import { useEffect, useState } from "react";

import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Card,
  Row,
  Col,
  Tag,
  message,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

const { Option } = Select;

export default function Staff() {

  const [data, setData] = useState([]);

  const [managers, setManagers] =
    useState([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editData, setEditData] =
    useState(null);

  const [isMobile, setIsMobile] =
    useState(false);

  // 🔥 RESPONSIVE CHECK
  useEffect(() => {

    if (typeof window !== "undefined") {

      const checkScreen = () => {
        setIsMobile(
          window.innerWidth < 768
        );
      };

      checkScreen();

      window.addEventListener(
        "resize",
        checkScreen
      );

      return () => {
        window.removeEventListener(
          "resize",
          checkScreen
        );
      };
    }

  }, []);

  // 🔥 LOAD STAFF
  useEffect(() => {

    API.get("/accounts/staff-list/")

      .then((res) => {

        setData(res.data);

      })

      .catch((err) =>
        console.log(err)
      );

  }, []);

  // 🔥 LOAD MANAGERS
  useEffect(() => {

    API.get("/accounts/staff-list/")

      .then((res) => {

        const mgr =
          res.data.filter(
            (u) =>
              u.role ===
              "manager"
          );

        setManagers(mgr);

      })

      .catch(() => {});

  }, []);

  // 🔥 DELETE
  const handleDelete = (id) => {

    if (
      !confirm(
        "Are you sure you want to delete this staff?"
      )
    )
      return;

    API.delete(
      `/accounts/staff/delete/${id}/`
    )

      .then(() => {

        setData((prev) =>
          prev.filter(
            (s) => s.id !== id
          )
        );

        message.success(
          "Staff deleted"
        );

      })

      .catch((err) =>
        console.log(err)
      );

  };

  // 🔥 EDIT
  const handleEdit = (staff) => {

    setEditData({
      ...staff,
    });

    setIsModalOpen(true);

  };

  // 🔥 SAVE
  const handleSave = () => {

    API.patch(
      `/accounts/staff/update/${editData.id}/`,
      {
        full_name:
          editData.name,

        email:
          editData.email,

        mobile:
          editData.mobile,

        role:
          editData.role,

        manager_id:
          editData.manager_id,
      }
    )

      .then(() => {

        setData((prev) =>
          prev.map((s) =>
            s.id ===
            editData.id
              ? editData
              : s
          )
        );

        setIsModalOpen(false);

        message.success(
          "Staff updated"
        );

      })

      .catch((err) =>
        console.log(err)
      );

  };

  // 🔥 TABLE COLUMNS
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },

    {
      title: "Name",
      dataIndex: "name",
    },

    {
      title: "Email",
      dataIndex: "email",
    },

    {
      title: "Mobile",
      dataIndex: "mobile",
    },

    {
      title: "Role",

      dataIndex: "role",

      render: (role) => (

        <Tag
          color={
            role === "manager"
              ? "purple"
              : "blue"
          }
        >
          {role}
        </Tag>

      ),
    },

    {
      title: "Action",

      render: (_, record) => (

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >

          <Button
            type="primary"
            size="small"
            onClick={() =>
              handleEdit(record)
            }
          >
            Edit
          </Button>

          <Button
            danger
            size="small"
            onClick={() =>
              handleDelete(
                record.id
              )
            }
          >
            Delete
          </Button>

        </div>

      ),
    },
  ];

  return (

    <MainLayout>

      <div
        style={{
          padding:
            isMobile
              ? 5
              : 10,

          overflowX:
            "hidden",
        }}
      >

        {/* 🔥 PAGE TITLE */}
        <h2
          style={{
            fontSize:
              isMobile
                ? 24
                : 32,

            fontWeight:
              "bold",

            marginBottom: 20,
          }}
        >
          Staff List
        </h2>

        {/* 🔥 MOBILE CARDS */}
        {isMobile ? (

          <Row gutter={[16, 16]}>

            {data.map((staff) => (

              <Col
                xs={24}
                key={staff.id}
              >

                <Card
                  hoverable
                  style={{
                    borderRadius: 16,

                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.06)",

                    border:
                      "none",
                  }}
                >

                  <div
                    style={{
                      marginBottom: 10,
                    }}
                  >

                    <h3
                      style={{
                        margin: 0,
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {staff.name}
                    </h3>

                  </div>

                  <p
                    style={{
                      marginBottom: 8,
                      wordBreak:
                        "break-word",
                    }}
                  >
                    <b>Email:</b>{" "}
                    {staff.email}
                  </p>

                  <p
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    <b>Mobile:</b>{" "}
                    {staff.mobile}
                  </p>

                  <div
                    style={{
                      marginBottom: 14,
                    }}
                  >

                    <Tag
                      color={
                        staff.role ===
                        "manager"
                          ? "purple"
                          : "blue"
                      }
                    >
                      {staff.role}
                    </Tag>

                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                    }}
                  >

                    <Button
                      type="primary"
                      block
                      onClick={() =>
                        handleEdit(
                          staff
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      danger
                      block
                      onClick={() =>
                        handleDelete(
                          staff.id
                        )
                      }
                    >
                      Delete
                    </Button>

                  </div>

                </Card>

              </Col>

            ))}

          </Row>

        ) : (

          /* 🔥 DESKTOP TABLE */
          <Card
            style={{
              borderRadius: 16,
            }}
          >

            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"

              scroll={{
                x: true,
              }}
            />

          </Card>

        )}

        {/* 🔥 MODAL */}
        <Modal
          title="Edit Staff"

          open={isModalOpen}

          onCancel={() =>
            setIsModalOpen(false)
          }

          onOk={handleSave}

          width={
            isMobile
              ? "95%"
              : 520
          }
        >

          <Input
            placeholder="Name"

            value={editData?.name}

            onChange={(e) =>
              setEditData({
                ...editData,
                name:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 12,
              height: 42,
            }}
          />

          <Input
            placeholder="Email"

            value={editData?.email}

            onChange={(e) =>
              setEditData({
                ...editData,
                email:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 12,
              height: 42,
            }}
          />

          <Input
            placeholder="Mobile"

            value={editData?.mobile}

            onChange={(e) =>
              setEditData({
                ...editData,
                mobile:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 12,
              height: 42,
            }}
          />

          {/* 🔥 MANAGER */}
          <Select
            placeholder="Select Manager"

            value={
              editData?.manager_id ||
              undefined
            }

            onChange={(value) =>
              setEditData({
                ...editData,
                manager_id:
                  value,
              })
            }

            style={{
              marginBottom: 12,
              width: "100%",
            }}
          >

            {managers.map((m) => (

              <Option
                key={m.id}
                value={m.id}
              >
                {m.name}
              </Option>

            ))}

          </Select>

          {/* 🔥 ROLE */}
          <Select
            value={editData?.role}

            onChange={(value) =>
              setEditData({
                ...editData,
                role: value,
              })
            }

            style={{
              width: "100%",
            }}
          >

            <Option value="staff">
              Staff
            </Option>

            <Option value="manager">
              Manager
            </Option>

          </Select>

        </Modal>

      </div>

    </MainLayout>

  );
}


