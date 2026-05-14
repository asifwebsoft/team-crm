import { useEffect, useState } from "react";
import { Badge, Dropdown, List, Tag } from "antd";
import { BellOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function NotificationBell({ isMobile }) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);

  }, []);

  const fetchNotifications = async () => {

    try {

      const res = await API.get("/leads/notifications/");

      console.log("Notifications:", res.data);

      if (res.data?.data) {
        setNotifications(res.data.data);
      }

    } catch (error) {

      console.log("Notification Error:", error);

    }

  };

  const notificationDropdown = (

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

      <h4 style={{ marginBottom: 10 }}>
        Notifications
      </h4>

      <List
        dataSource={notifications}
        locale={{ emptyText: "No notifications" }}
        renderItem={(item) => (

          <List.Item
            style={{
              padding: "10px",
              borderRadius: 8,
              marginBottom: 8,
              background:
                item.type === "today"
                  ? "#e6f7ff"
                  : "#fff1f0",
            }}
          >

            <div style={{ width: "100%" }}>

              <div style={{ fontWeight: "600" }}>
                {item.name}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginTop: 2,
                }}
              >
                {item.title || "Lead Followup"}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >

                <Tag
                  color={
                    item.type === "today"
                      ? "blue"
                      : "red"
                  }
                >
                  {item.type}
                </Tag>

                <span
                  style={{
                    fontSize: 11,
                    color: "#888",
                  }}
                >
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
      overlay={notificationDropdown}
      trigger={["click"]}
      placement="bottomRight"
    >

      <div
        style={{
          cursor: "pointer",
        }}
      >

        <Badge
          count={notifications.length}
          offset={[-2, 2]}
          size="small"
        >

          <BellOutlined
            style={{
              fontSize: isMobile ? 18 : 20,
              color: "#fff",
            }}
          />

        </Badge>

      </div>

    </Dropdown>

  );

}