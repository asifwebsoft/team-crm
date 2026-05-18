import { Layout, Menu, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LineChartOutlined,
  TeamOutlined,
  UserAddOutlined,
  HistoryOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  HistoryOutlined
} from "@ant-design/icons";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const { Sider } = Layout;

export default function Sidebar() {

  const router = useRouter();

  const [role, setRole] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    if (typeof window !== "undefined") {

      setRole(localStorage.getItem("role"));

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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // 🔥 COMMON MENU
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
    },
     {
      key: "/invoices",
      icon: <LineChartOutlined />,
      label: "Invoices",
  },
    {
    key: "/lead-history",
    icon: <HistoryOutlined/>,
    label: "Lead History",
  },
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

  // 🔥 MENU COMPONENT
  const sidebarMenu = (
    <>
      {/* 🔥 BRAND */}
      <div
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          padding: "15px 0",
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
          marginBottom: "1px",
          
        }}
        items={items}
        onClick={({ key }) => {

          if (key === "logout") {

            handleLogout();

          } else {

            router.push(key);

            // 🔥 AUTO CLOSE MOBILE DRAWER
            if (isMobile) {
              setMobileOpen(false);
            }
          }
        }}
      />
    </>
  );

  return (
    <>

      {/* 🔥 MOBILE MENU BUTTON */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 18,
            left: 15,
            zIndex: 1000,
            background: "#0f172a",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuOutlined
            style={{
              color: "#fff",
              fontSize: 20,
            }}
          />
        </div>
      )}

      {/* 🔥 DESKTOP SIDEBAR */}
      {!isMobile && (
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
          {sidebarMenu}
        </Sider>
      )}

      {/* 🔥 MOBILE DRAWER */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          placement="left"
          closable={false}
          bodyStyle={{
            padding: 0,
            background: "#0f172a",
          }}
          width={230}
        >
          {sidebarMenu}
        </Drawer>
      )}

    </>
  );
}