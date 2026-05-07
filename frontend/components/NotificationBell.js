import { useEffect, useState } from "react";
import { Badge, Dropdown, List, Tag } from "antd";
import { BellOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      API.get("/leads/notifications/")
        .then((res) => {
          setNotifications(res.data.data || []);
        })
        .catch((err) => console.log(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const menuItems = (
    <div
      style={{
        width: 320,
        maxHeight: 400,
        overflowY: "auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
        padding: 10,
      }}
    >
      <h4 style={{ marginBottom: 10 }}>Notifications</h4>

      <List
        dataSource={notifications}
        locale={{ emptyText: "No new notifications" }}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "10px 8px",
              borderRadius: 8,
              marginBottom: 5,
              background:
                item.type === "today" ? "#e6f7ff" : "#fff1f0", // 🔥 highlight
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: "600" }}>
                {item.name || "No Name"}
              </div>

              <div style={{ fontSize: 12, color: "#555" }}>
                {item.title || "Lead"}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                }}
              >
                <Tag color={item.type === "today" ? "blue" : "red"}>
                  {item.type}
                </Tag>

                <span style={{ fontSize: 11, color: "#888" }}>
                  {item.date}
                </span>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown
      overlay={menuItems}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{
        position: "fixed",
        top: 65,
        right: 20,
      }}
    >
      <Badge count={notifications.length} offset={[0, 5]}>
        <BellOutlined
          style={{
            fontSize: 20,
            cursor: "pointer",
            color: "#fff",
          }}
        />
      </Badge>
    </Dropdown>
  );
}