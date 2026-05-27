import NotificationBell from "../components/NotificationBell";
import { useEffect, useState } from "react";
import { Layout, Dropdown } from "antd";

import { useRouter } from "next/router";

import {
  UserOutlined,
  LogoutOutlined
} from "@ant-design/icons";

const { Header } = Layout;

export default function Topbar() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    if (typeof window !== "undefined") {

      setName(localStorage.getItem("name") || "");
      setRole(localStorage.getItem("role") || "");
      setCompany(localStorage.getItem("company") || "");

      // 📱 RESPONSIVE CHECK
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

  // 🚪 LOGOUT
  const handleLogout = async () => {

  try {

    // BACKEND LOGOUT API
    await fetch(
      "http://127.0.0.1:8000/accounts/logout/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {

    console.log(err);

  }

  // CLEAR STORAGE
  localStorage.clear();

  // REDIRECT
  router.push("/login");

};

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

        {company ? `${company}` : "CRM"}

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
        <NotificationBell isMobile={isMobile} />

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