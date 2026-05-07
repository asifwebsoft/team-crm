import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LineChartOutlined,
  TeamOutlined,
  UserAddOutlined,
  HistoryOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const { Sider } = Layout;

export default function Sidebar() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // 🔥 BASE MENU (ALL USERS)
  let items = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/leads",
      icon: <UserOutlined />,
      label: "Leads",
    },
    {
      key: "/conversion",
      icon: <LineChartOutlined />,
      label: "Conversion",
    },
    {
      key: "/followups",
      icon: <CalendarOutlined />,
      label: "Follow Ups",
    }
  ];

  // 👑 ADMIN MENU
  if (role === "admin") {
    items.push(
      {
        key: "/team-performance",
        icon: <LineChartOutlined />,
        label: "Team Performance",
      },
      {
        key: "/login-activity",
        icon: <HistoryOutlined />,
        label: "Login Activity",
      },
      {
        key: "/staff",
        icon: <TeamOutlined />,
        label: "Staff",
      },
      {
        key: "/add-staff",
        icon: <UserAddOutlined />,
        label: "Add Staff",
      }
    );
  }

  // 🧑‍💼 MANAGER MENU
  if (role === "manager") {
    items.push({
      key: "/team",
      icon: <UsergroupAddOutlined />,
      label: "My Team",
    });

    
  }

  // 🔥 LOGOUT
  items.push({
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Logout",
    danger: true,
  });

  return (
    <Sider
      width={230}
      style={{
        background: "#0f172a",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* 🔥 LOGO / BRAND */}
      <div
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          padding: "20px 0",
          borderBottom: "1px solid #1e293b",
        }}
      >
        CRM Pro
      </div>

      {/* 🔥 MENU */}
      <Menu
        mode="inline"
        selectedKeys={[router.pathname]}
        style={{
          background: "#0f172a",
          color: "#fff",
          borderRight: "none",
          marginTop: 10,
        }}
        items={items}
        onClick={({ key }) => {
          if (key === "logout") {
            handleLogout();
          } else {
            router.push(key);
          }
        }}
      />
    </Sider>
  );
}