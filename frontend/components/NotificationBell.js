import { useEffect, useState } from "react";
import { Badge, Dropdown, List, Tag } from "antd";
import { BellOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function NotificationBell({ isMobile = false }) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    const fetchNotifications = async () => {

      try {

        const res = await API.get("/leads/notifications/");

        setNotifications(res.data.data || []);

      } catch (err) {

        console.log("Notification Error:", err);

      }

    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);

  }, []);

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
              padding: "10px 8px",
              borderRadius: 8,
              marginBottom: 8,
              background:
                item.type === "today"
                  ? "#e6f7ff"
                  : "#fff1f0",
            }}
          >

            <div style={{ width: "100%" }}>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {item.name || "No Name"}
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
                  alignItems: "center",
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
                  {item.type.toUpperCase()}
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

    <div
      style={{
        position: "relative",
      }}
    >

      <Dropdown
        overlay={notificationDropdown}
        trigger={["click"]}
        placement="bottomRight"
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

  );

}