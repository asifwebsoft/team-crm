import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Tag,
  message,
  Modal
} from "antd";

import { PlusOutlined } from "@ant-design/icons";

import API from "../services/api";
import MainLayout from "../components/Layout";
import { useRouter } from "next/router";

const { Option } = Select;

const DatePicker = dynamic(
  () => import("antd").then((m) => m.DatePicker),
  {
    ssr: false,
  }
);

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

  const [isMobile, setIsMobile] = useState(false);

  // 🔥 FOLLOWUP MODAL

const [
  isFollowupModalOpen,
  setIsFollowupModalOpen
] = useState(false);

const [
  selectedLead,
  setSelectedLead
] = useState(null);

const [
  followupNotes,
  setFollowupNotes
] = useState("");

const [
  nextFollowupDate,
  setNextFollowupDate
] = useState(null);

  // 🔥 FORM
  const [form, setForm] = useState({
    title: "",
    customer_name: "",
    phone: "",
    notes: "",
    followup_date: "",
  });

  // 🔥 EDIT
  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    notes: "",
    followup_date: "",
  });

  // 🔥 LOAD USER
  useEffect(() => {

    if (typeof window !== "undefined") {

      setRole(localStorage.getItem("role"));

      setUserId(
        Number(localStorage.getItem("user_id"))
      );

      // 🔥 MOBILE CHECK
      const checkScreen = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkScreen();

      window.addEventListener("resize", checkScreen);

      return () => {
        window.removeEventListener("resize", checkScreen);
      };
    }

  }, []);

  // 🔥 LOAD LEADS
  useEffect(() => {

    API.get("/leads/my-leads/")
      .then((res) => {
        setLeads(res.data.reverse());
      })
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

  // 🔥 SCROLL TO NOTIFICATION LEAD
  useEffect(() => {

    if (open && leads.length > 0) {

      const el = document.getElementById(
        `lead-${open}`
      );

      if (el) {

        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

  }, [open, leads]);

  // 🔥 ADD LEAD
  const handleAdd = () => {

    if (
      !form.title ||
      !form.customer_name ||
      !form.phone
    ) {
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

        setLeads((prev) => [
          newLead,
          ...prev,
        ]);

        message.success(
          "Lead created successfully"
        );

        // RESET
        setForm({
          title: "",
          customer_name: "",
          phone: "",
          notes: "",
          followup_date: "",
        });

        setShowForm(false);

      })

      .catch(() => {

        message.error(
          "Failed to create lead"
        );

      });
  };

  // 🔥 EDIT
  const startEdit = (lead) => {

    setEditingId(lead.id);

    setEditData({
      notes: lead.notes || "",
      followup_date:
        lead.followup_date || "",
    });
  };

  // 🔥 SAVE EDIT
  const saveEdit = (id) => {

    API.patch(
      `/leads/update/${id}/`,
      editData
    )

      .then(() => {

        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, ...editData }
              : l
          )
        );

        setEditingId(null);

        message.success(
          "Lead updated"
        );

      })

      .catch(() => {

        message.error(
          "Update failed"
        );

      });
  };

  // 🔥 STATUS
  const changeStatus = (id, status) => {

    API.patch(
      `/leads/update/${id}/`,
      { status }
    )

      .then(() => {

        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, status }
              : l
          )
        );

      });

  };

  // 🔥 ASSIGN
  const assignLead = (
    leadId,
    staffId
  ) => {

    API.patch(
      `/leads/assign/${leadId}/`,
      {
        assigned_to: staffId,
      }
    )

      .then(() => {

        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  assigned_to: staffId,
                }
              : l
          )
        );

      });

  };

  // 🔥 OPEN FOLLOWUP MODAL

const openFollowupModal = (
  lead
) => {

  setSelectedLead(lead);

  setFollowupNotes("");

  setNextFollowupDate(null);

  setIsFollowupModalOpen(true);
};

// 🔥 SAVE FOLLOWUP

const handleSaveFollowup =
  async () => {

    try {

      if (!followupNotes.trim()) {

        message.error(
          "Notes required"
        );

        return;
      }

      await API.post(
        `/leads/followup/${selectedLead.id}/`,
        {
          notes: followupNotes,

          next_followup_date:
            nextFollowupDate
              ?
              nextFollowupDate.format(
                "YYYY-MM-DD"
              )
              :
              null,
        }
      );

      message.success(
        "Follow-up added"
      );

      setIsFollowupModalOpen(false);

    } catch (err) {

      message.error(
        err?.response?.data?.error
        ||
        "Failed"
      );
    }
  };

  // 🔥 STATUS COLOR
  const statusColor = (status) => {

    if (status === "closed")
      return "green";

    if (status === "interested")
      return "orange";

    return "blue";
  };

  return (

    <MainLayout>

      <div
        style={{
          padding: isMobile ? 5 : 20,
          overflowX: "hidden",
        }}
      >

        <h2
          style={{
            fontSize: isMobile ? 22 : 28,
            marginBottom: 20,
          }}
        >
          Leads
        </h2>

        {/* 🔥 ADD BUTTON */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            marginBottom: 20,
            borderRadius: 8,
            width: isMobile
              ? "100%"
              : "auto",
            height: 42,
            fontWeight: 600,
          }}
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          ADD LEAD
        </Button>

        {/* 🔥 FORM */}
        {showForm && (

          <Card
            style={{
              marginBottom: 20,
              borderRadius: 14,
            }}
          >

            <h3
              style={{
                marginBottom: 20,
              }}
            >
              Add New Lead
            </h3>

            <Input
              placeholder="Title"
              value={form.title}
              style={{
                marginBottom: 12,
                height: 42,
              }}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />

            <Input
              placeholder="Customer Name"
              value={form.customer_name}
              style={{
                marginBottom: 12,
                height: 42,
              }}
              onChange={(e) =>
                setForm({
                  ...form,
                  customer_name:
                    e.target.value,
                })
              }
            />

            <Input
              placeholder="Phone"
              value={form.phone}
              style={{
                marginBottom: 12,
                height: 42,
              }}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

            <Input.TextArea
              placeholder="Notes"
              value={form.notes}
              style={{
                marginBottom: 12,
              }}
              rows={4}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />

            {/* 🔥 FOLLOWUP */}
            <DatePicker
              style={{
                width: "100%",
                marginBottom: 15,
                height: 42,
              }}
              onChange={(d, ds) =>
                setForm({
                  ...form,
                  followup_date: ds,
                })
              }
            />

            <Button
              type="primary"
              block
              style={{
                height: 42,
                fontWeight: 600,
              }}
              onClick={handleAdd}
            >
              Add Lead
            </Button>

          </Card>
        )}

        {/* 🔥 LEADS */}
        <Row gutter={[16, 16]}>

          {leads.map((lead) => (

            <Col
              xs={24}
              sm={24}
              md={12}
              lg={8}
              key={lead.id}
            >

              <Card
                id={`lead-${lead.id}`}
                hoverable
                style={{
                  borderRadius: 14,
                }}
              >

                <h3
                  style={{
                    wordBreak: "break-word",
                  }}
                >
                  {lead.title}
                </h3>

                <p>
                  <b>Name:</b>{" "}
                  {lead.customer_name}
                </p>

                <p>
                  <b>Phone:</b>{" "}
                  {lead.phone}
                </p>

                {/* NOTES */}
                {editingId === lead.id ? (

                  <Input.TextArea
                    value={editData.notes}
                    rows={3}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        notes:
                          e.target.value,
                      })
                    }
                  />

                ) : (

                  <p
                    style={{
                      wordBreak:
                        "break-word",
                    }}
                  >
                    <b>Notes:</b>{" "}
                    {lead.notes}
                  </p>

                )}

                {/* FOLLOWUP */}
                {editingId === lead.id ? (

                  <DatePicker
                    style={{
                      width: "100%",
                    }}
                    onChange={(d, ds) =>
                      setEditData({
                        ...editData,
                        followup_date:
                          ds,
                      })
                    }
                  />

                ) : (

                  <p>
                    <b>Follow-up:</b>{" "}
                    {formatDate(
                      lead.followup_date
                    )}
                  </p>

                )}

                {/* STATUS */}
                <Tag
                  color={statusColor(
                    lead.status
                  )}
                >
                  {lead.status}
                </Tag>

                {/* STATUS CHANGE */}
                <Select
                  value={lead.status}
                  style={{
                    width: "100%",
                    marginTop: 12,
                  }}
                  onChange={(v) =>
                    changeStatus(
                      lead.id,
                      v
                    )
                  }
                >
                  <Option value="new">
                    New
                  </Option>

                  <Option value="interested">
                    Interested
                  </Option>

                  <Option value="closed">
                    Closed
                  </Option>

                </Select>

                {/* ASSIGN */}
                {(role === "admin" ||
                  role === "manager") && (

                  <Select
                    style={{
                      width: "100%",
                      marginTop: 12,
                    }}
                    value={lead.assigned_to}
                    onChange={(v) =>
                      assignLead(
                        lead.id,
                        v
                      )
                    }
                  >

                    {staff.map((s) => (

                      <Option
                        key={s.id}
                        value={s.id}
                      >
                        {s.name}
                      </Option>

                    ))}

                  </Select>

                )}

                {/* WHATSAPP */}
                <Button
                  style={{
                    marginTop: 12,
                    width: "100%",
                    background:
                      "#25D366",
                    color: "#fff",
                    height: 42,
                    fontWeight: 600,
                  }}
                  onClick={() => {

                    const msg =
                      `Hi ${lead.customer_name}`;

                    window.open(
                      `https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`
                    );

                  }}
                >
                  WhatsApp
                </Button>

                  

                {/* EDIT */}
                {lead.assigned_to ===
                  userId && (

                  editingId ===
                  lead.id ? (

                    <>

                      <Button
                        type="primary"
                        block
                        style={{
                          marginTop: 12,
                          height: 42,
                        }}
                        onClick={() =>
                          saveEdit(
                            lead.id
                          )
                        }
                      >
                        Save
                      </Button>

                      <Button
                        block
                        style={{
                          marginTop: 8,
                          height: 42,
                        }}
                        onClick={() =>
                          setEditingId(
                            null
                          )
                        }
                      >
                        Cancel
                      </Button>

                    </>

                  ) : (

                    <Button
                      block
                      style={{
                        marginTop: 12,
                        height: 42,
                      }}
                      onClick={() =>
                        startEdit(
                          lead
                        )
                      }
                    >
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
