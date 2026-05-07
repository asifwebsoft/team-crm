import { useState } from "react";
import { Input, Button, Card } from "antd";
import { useRouter } from "next/router";
import API from "../services/api";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = () => {
    API.post("/accounts/login/", form)
      .then((res) => {

        // 🔥 SAVE TOKENS
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        // 🔥 USER INFO (IMPORTANT)
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("company", res.data.company);

        // 🔥 REDIRECT (ROLE BASED)
        if (res.data.role === "manager") {
          router.push("/manager-dashboard");
        } else {
          router.push("/dashboard");
        }

      })
      .catch(() => {
        alert("Invalid email or password");
      });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Card title="Login" style={{ width: 320, borderRadius: 10 }}>
        <Input
          placeholder="Email"
          style={{ marginBottom: 10 }}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <Input.Password
          placeholder="Password"
          style={{ marginBottom: 10 }}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <Button type="primary" block onClick={handleLogin}>
          Login
        </Button>

         <div
          style={{
            marginTop: 10,
            textAlign: "right",
          }}
        >
          <span
            onClick={() => router.push("/forgot-password")}
            style={{
              color: "#1677ff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Forgot Password?
          </span>
        </div>
        <div
        style={{
          marginTop: 15,
          textAlign: "center",
        }}
      >
        New Company?{" "}
        <span
          onClick={() => router.push("/signup")}
          style={{
            color: "#1677ff",
            cursor: "pointer",
          }}
        >
          Create Account
        </span>
      </div>
      </Card>
    </div>
  );
}