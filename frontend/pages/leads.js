import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, Row, Col, Input, Button, Select, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import API from "../services/api";
import MainLayout from "../components/Layout";
import { useRouter } from "next/router";

const { Option } = Select;

const DatePicker = dynamic(() => import("antd").then(m => m.DatePicker), {
  ssr: false,
});

const formatDate = (date) => {
  if (!date) return "No follow-up";
  return new Date(date).toLocaleDateString("en-GB");
};

export default function Leads() {

  const router = useRouter();
  const { open } = router.query;
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState([]);
  const [staff, setStaff] = useState([]);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // 🔥 NEW FORM STATE
  const [form, setForm] = useState({
    title: "",
    customer_name: "",
    phone: "",
    notes: "",
    followup_date: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    notes: "",
    followup_date: "",
  });

  // 🔥 LOAD USER INFO
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role"));
      setUserId(Number(localStorage.getItem("user_id")));
    }
  }, []);

  // 🔥 LOAD LEADS
  useEffect(() => {
    API.get("/leads/my-leads/")
      .then((res) => setLeads(res.data.reverse()))
      .catch(console.log);
  }, []);

  // 🔥 LOAD STAFF
  useEffect(() => {
    if (role === "admin" || role === "manager") {
      API.get("/accounts/staff-list/")
        .then((res) => setStaff(res.data))
        .catch(() => {});
    }
  }, [role]);

  // 🔥 SCROLL
  useEffect(() => {
    if (open && leads.length > 0) {
      const el = document.getElementById(`lead-${open}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, leads]);

  // 🔥 ADD LEAD
    // 🔥 ADD LEAD
const handleAdd = () => {

  if (!form.title || !form.customer_name || !form.phone) {
    message.error("Please fill required fields");
    return;
  }

  API.post("/leads/create/", form)
    .then((res) => {

      const newLead = {
        ...form,
        id: res.data.id,
        status: "new",
        assigned_to: userId,
      };

      // 🔥 ADD NEW LEAD
      setLeads((prev) => [newLead, ...prev]);

      // 🔥 SUCCESS
      message.success("Lead created successfully");

      // 🔥 RESET FORM
      setForm({
        title: "",
        customer_name: "",
        phone: "",
        notes: "",
        followup_date: "",
      });

      // 🔥 CLOSE FORM
      setShowForm(false);

    })
    .catch(() => {
      message.error("Failed to create lead");
    });
};
 
  const startEdit = (lead) => {
    setEditingId(lead.id);
    setEditData({
      notes: lead.notes || "",
      followup_date: lead.followup_date || "",
    });
  };

  const saveEdit = (id) => {
    API.patch(`/leads/update/${id}/`, editData)
      .then(() => {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, ...editData } : l
          )
        );
        setEditingId(null);
      })
      .catch(console.log);
  };

  const changeStatus = (id, status) => {
    API.patch(`/leads/update/${id}/`, { status })
      .then(() => {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        );
      });
  };

  const assignLead = (leadId, staffId) => {
    API.patch(`/leads/assign/${leadId}/`, {
      assigned_to: staffId,
    }).then(() => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, assigned_to: staffId } : l
        )
      );
    });
  };

  const statusColor = (status) => {
    if (status === "closed") return "green";
    if (status === "interested") return "orange";
    return "blue";
  };

  return (
    <MainLayout>
      <div style={{ padding: 20 }}>
        <h2>Leads</h2>

        {/* 🔥 ADD LEAD FORM */}
        {/* 🔥 ADD LEAD BUTTON */}
<Button
  type="primary"
  icon={<PlusOutlined />}
  style={{
    marginBottom: 20,
    borderRadius: 8,
  }}
  onClick={() => setShowForm(!showForm)}
>
  ADD LEAD
</Button>

{/* 🔥 FORM */}
{showForm && (
  <Card style={{ marginBottom: 20 }}>
    <h3>Add New Lead</h3>

    <Input
      placeholder="Title"
      value={form.title}
      style={{ marginBottom: 10 }}
      onChange={(e) =>
        setForm({ ...form, title: e.target.value })
      }
    />

    <Input
      placeholder="Customer Name"
      value={form.customer_name}
      style={{ marginBottom: 10 }}
      onChange={(e) =>
        setForm({
          ...form,
          customer_name: e.target.value,
        })
      }
    />

    <Input
      placeholder="Phone"
      value={form.phone}
      style={{ marginBottom: 10 }}
      onChange={(e) =>
        setForm({ ...form, phone: e.target.value })
      }
    />

    <Input.TextArea
      placeholder="Notes"
      value={form.notes}
      style={{ marginBottom: 10 }}
      onChange={(e) =>
        setForm({ ...form, notes: e.target.value })
      }
    />

    {/* 🔥 FOLLOWUP DATE */}
    <DatePicker
      style={{ width: "100%", marginBottom: 10 }}
      onChange={(d, ds) =>
        setForm({ ...form, followup_date: ds })
      }
    />

    <Button
      type="primary"
      block
      onClick={handleAdd}
    >
      Add Lead
    </Button>
  </Card>
)}

        {/* 🔥 LEADS */}
        <Row gutter={[16, 16]}>
          {leads.map((lead) => (
            <Col xs={24} sm={12} lg={8} key={lead.id}>
              <Card id={`lead-${lead.id}`} hoverable>

                <h3>{lead.title}</h3>

                <p><b>Name:</b> {lead.customer_name}</p>
                <p><b>Phone:</b> {lead.phone}</p>

                {/* NOTES */}
                {editingId === lead.id ? (
                  <Input.TextArea
                    value={editData.notes}
                    onChange={(e) =>
                      setEditData({ ...editData, notes: e.target.value })
                    }
                  />
                ) : (
                  <p><b>Notes:</b> {lead.notes}</p>
                )}

                {/* FOLLOWUP */}
                {editingId === lead.id ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    onChange={(d, ds) =>
                      setEditData({ ...editData, followup_date: ds })
                    }
                  />
                ) : (
                  <p><b>Follow-up:</b> {formatDate(lead.followup_date)}</p>
                )}

                <Tag color={statusColor(lead.status)}>
                  {lead.status}
                </Tag>

                <Select
                  value={lead.status}
                  style={{ width: "100%", marginTop: 10 }}
                  onChange={(v) => changeStatus(lead.id, v)}
                >
                  <Option value="new">New</Option>
                  <Option value="interested">Interested</Option>
                  <Option value="closed">Closed</Option>
                </Select>

                {(role === "admin" || role === "manager") && (
                  <Select
                    style={{ width: "100%", marginTop: 10 }}
                    value={lead.assigned_to}
                    onChange={(v) => assignLead(lead.id, v)}
                  >
                    {staff.map((s) => (
                      <Option key={s.id} value={s.id}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                )}

                <Button
                  style={{ marginTop: 10, width: "100%", background: "#25D366", color: "#fff" }}
                  onClick={() => {
                    const msg = `Hi ${lead.customer_name}`;
                    window.open(`https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`);
                  }}
                >
                  WhatsApp
                </Button>

                {lead.assigned_to === userId && (
                  editingId === lead.id ? (
                    <>
                      <Button type="primary" block style={{ marginTop: 10 }} onClick={() => saveEdit(lead.id)}>
                        Save
                      </Button>
                      <Button block style={{ marginTop: 5 }} onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button block style={{ marginTop: 10 }} onClick={() => startEdit(lead)}>
                      Edit
                    </Button>
                  )
                )}

              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </MainLayout>
  );
  }