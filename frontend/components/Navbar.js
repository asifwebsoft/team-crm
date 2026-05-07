import { Layout, Button } from "antd";

const { Header } = Layout;

export default function Navbar() {

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Header style={{ background: "#fff", display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
      <h3>CRM Dashboard</h3>

      <Button danger onClick={handleLogout}>
        Logout
      </Button>
    </Header>
  );
}