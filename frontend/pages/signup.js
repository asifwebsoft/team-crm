import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { useRouter } from "next/router";
import API from "../services/api";

export default function Signup() {

  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState(false);
  const [showRules, setShowRules] = useState(false)

  const handleSignup = () => {

    if (
      !form.full_name ||
      !form.email ||
      !form.mobile ||
      !form.password
    ) {
      message.error("Please fill all fields");
      return;
    }

    API.post("/accounts/admin-signup/", form)
      .then(() => {

        message.success("Company Admin Created");

        // 🔥 LOGIN PAGE
        router.push("/login");

      })
     .catch((err) => {

  console.log(err);

  // 🔥 password validation error
  if (err.response?.data?.password) {

    setPasswordError(true);
    setShowRules(true);

    message.error(
      err.response.data.password[0]
    );

  } else {

    message.error("Signup failed");
  }
});
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Card
        title="Create Company Account"
        style={{
          width: 400,
          borderRadius: 12,
        }}
      >

        <Input
          placeholder="Full Name"
          style={{ marginBottom: 12 }}
          value={form.full_name}
          onChange={(e) =>
            setForm({
              ...form,
              full_name: e.target.value,
            })
          }
        />

        <Input
          placeholder="Email"
          style={{ marginBottom: 12 }}
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <Input
          placeholder="Mobile"
          style={{ marginBottom: 12 }}
          value={form.mobile}
          onChange={(e) =>
            setForm({
              ...form,
              mobile: e.target.value,
            })
          }
        />

       <Input.Password
  placeholder="Password"
  value={form.password}
  style={{
    marginBottom: 12,
    border: passwordError
      ? "1px solid red"
      : "",
  }}
  onChange={(e) => {

    setForm({
      ...form,
      password: e.target.value,
    });

    // 🔥 remove red border while typing
    setPasswordError(false);

  }}
/>

{showRules && (
  <div
    style={{
      fontSize: 12,
      color: "#f30b0b",
      marginBottom: 15,
    }}
  >
    Password must contain:
    <br />
    • Minimum 8 characters
    <br />
    • 1 Capital letter
    <br />
    • 1 Number
    <br />
    • 1 Special character
  </div>
)}
        <Button
          type="primary"
          block
          size="large"
          onClick={handleSignup}
        >
          Create Company Account
        </Button>

        <div
          style={{
            marginTop: 15,
            textAlign: "center",
          }}
        >
          Already have account?{" "}
          <span
            onClick={() => router.push("/login")}
            style={{
              color: "#1677ff",
              cursor: "pointer",
            }}
          >
            Login
          </span>
        </div>

      </Card>
    </div>
  );
}