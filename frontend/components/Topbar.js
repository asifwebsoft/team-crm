import { useEffect, useState } from "react";
import {
  Layout,
  Badge,
  Dropdown,
  List,
  Tag
} from "antd";

import { useRouter } from "next/router";

import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined
} from "@ant-design/icons";

import API from "../services/api";

const { Header } = Layout;

export default function Topbar() {

  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    if (typeof window !== "undefined") {

      setName(localStorage.getItem("name"));
      setRole(localStorage.getItem("role"));
      setCompany(localStorage.getItem("company"));

      // 🔥 RESPONSIVE CHECK
      const checkScreen = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkScreen();

      window.addEventListener("resize", checkScreen);

      return () => {
        window.removeEventListener("resize", checkScreen);
      };
    }

    // 🔔 NOTIFICATIONS
    API.get("/leads/notifications/")
      .then((res) => {

        setNotifications(res.data.data || []);

      })
      .catch((err) => {

        // 🔥 subscription users safe
        if (err.response?.status === 403) {
          setNotifications([]);
          return;
        }

        console.log(err);

      });

  }, []);

  // 🚪 LOGOUT
  const handleLogout = () => {

    localStorage.clear();
    window.location.href = "/login";

  };

  // 🔔 NOTIFICATION DROPDOWN
  const notificationDropdown = (
    <div
      style={{
        width: isMobile ? 280 : 320,
        maxHeight: 400,
        overflowY: "auto",
        background: "#01050f",
        borderRadius: 10,
        padding: 10,
      }}
    >

      {notifications.length === 0 ? (

        <div
          style={{
            color: "#aaa",
            textAlign: "center",
          }}
        >
          No notifications
        </div>

      ) : (

        <List
          dataSource={notifications}
          renderItem={(item) => (

            <List.Item
              onClick={() => {
                router.push(`/leads?open=${item.id}`);
              }}
              style={{
                borderBottom: "1px solid #1f2937",
                padding: "10px 5px",
                cursor: "pointer",
              }}
            >

              <div>

                <b style={{ color: "#fff" }}>
                  {item.name}
                </b>

                <br />

                <small style={{ color: "#9ca3af" }}>
                  {item.type === "today"
                    ? "Today Followup"
                    : "Overdue"}
                </small>

                <br />

                <Tag
                  color={
                    item.type === "today"
                      ? "green"
                      : "red"
                  }
                  style={{ marginTop: 5 }}
                >
                  {item.date}
                </Tag>

              </div>

            </List.Item>

          )}
        />

      )}

    </div>
  );

  // 👤 PROFILE MENU
  const profileMenu = [
    {
      key: "1",
      label: (
        <div>
          <b>{name}</b>
          <br />
          <small style={{ color: "#888" }}>
            {role}
          </small>
        </div>
      ),
      icon: <UserOutlined />,
    },

    {
      key: "2",
      label: (
        <span onClick={handleLogout}>
          Logout
        </span>
      ),
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (

    <Header
      style={{
        marginLeft: isMobile ? 0 : 230,
        background: "#0f172a",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "0 15px 0 65px" : "0 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >

      {/* 🏢 COMPANY NAME */}
      <div
        style={{
          color: "#fff",
          fontSize: isMobile ? 15 : 20,
          fontWeight: "bold",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: isMobile ? 130 : "unset",
        }}
      >
        {company ? `${company} CRM` : "CRM"}
      </div>

      {/* 🔥 RIGHT SIDE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 12 : 20,
        }}
      >

        {/* 🔔 NOTIFICATION */}
          {/* 🔔 NOTIFICATION */}
<div
  style={{
    position: "relative",
  }}
>

  <Dropdown
    overlay={notificationDropdown}
    trigger={["click"]}
  >

    <Badge
      count={notifications.length}
      offset={[-3, 3]}
      size="small"
    >

      <BellOutlined
        style={{
          fontSize: isMobile ? 18 : 20,
          cursor: "pointer",
          color: "#fff",
        }}
      />

    </Badge>

  </Dropdown>

</div>

        {/* 👤 PROFILE */}
        <Dropdown
          menu={{ items: profileMenu }}
          trigger={["click"]}
        >

          <div
            style={{
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >

            <UserOutlined />

            {!isMobile && (
              <>
                <span>{name}</span>

                <small
                  style={{
                    color: "#9ca3af"
                  }}
                >
                  ({role})
                </small>
              </>
            )}

          </div>

        </Dropdown>

      </div>

    </Header>
  );
}