import { useEffect, useState } from "react";
import { Table, Button, Modal, Input } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";
import { Select } from "antd";

const { Option } = Select;


export default function Staff() {
  const [data, setData] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // 🔥 LOAD STAFF
  useEffect(() => {
    API.get("/accounts/staff-list/")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
  API.get("/accounts/staff-list/")
    .then((res) => {
      // सिर्फ managers निकालो
      const mgr = res.data.filter((u) => u.role === "manager");
      setManagers(mgr);
    })
    .catch(() => {});
}, []);

  // 🔥 DELETE STAFF
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;

    API.delete(`/accounts/staff/delete/${id}/`)
      .then(() => {
        setData((prev) => prev.filter((s) => s.id !== id));
      })
      .catch((err) => console.log(err));
  };

  // 🔥 OPEN EDIT MODAL
  const handleEdit = (staff) => {
    setEditData({ ...staff });
    setIsModalOpen(true);
  };

  // 🔥 SAVE EDIT
  const handleSave = () => {
    API.patch(`/accounts/staff/update/${editData.id}/`, {
      full_name: editData.name,
      email: editData.email,
      mobile: editData.mobile,
      role: editData.role,
      manager_id: editData.manager_id,
    })
      .then(() => {
        setData((prev) =>
          prev.map((s) =>
            s.id === editData.id ? editData : s
          )
        );
        setIsModalOpen(false);
      })
      .catch((err) => console.log(err));
  };

  // 🔥 TABLE COLUMNS
  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Mobile", dataIndex: "mobile" },
    { title: "Role", dataIndex: "role" },

    {
      title: "Action",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          <Button
            danger
            size="small"
            style={{ marginLeft: 8 }}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <MainLayout>
      <h2>Staff List</h2>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
      />

      {/* 🔥 EDIT MODAL */}
      <Modal
        title="Edit Staff"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
      >
        <Input
          placeholder="Name"
          value={editData?.name}
          onChange={(e) =>
            setEditData({ ...editData, name: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />

        <Input
          placeholder="Email"
          value={editData?.email}
          onChange={(e) =>
            setEditData({ ...editData, email: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />

        <Input
          placeholder="Mobile"
          value={editData?.mobile}
          onChange={(e) =>
            setEditData({ ...editData, mobile: e.target.value })
          }
        />
        <Select
          placeholder="Select Manager"
          value={editData?.manager_id || undefined}
          onChange={(value) =>
            setEditData({ ...editData, manager_id: value })
          }
          style={{ marginTop: 10, width: "100%" }}
        >
          {managers.map((m) => (
            <Option key={m.id} value={m.id}>
              {m.name}
            </Option>
          ))}
        </Select>
        <Select
            value={editData?.role}
            onChange={(value) =>
              setEditData({ ...editData, role: value })
            }
            style={{ marginTop: 10, width: "100%" }}
          >
            <Option value="staff">Staff</Option>
            <Option value="manager">Manager</Option>
        </Select>
      </Modal>
    </MainLayout>
  );
}