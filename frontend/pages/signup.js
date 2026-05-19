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

  const [errors, setErrors] = useState({});

  const [passwordError, setPasswordError] = useState(false);

  const [showRules, setShowRules] = useState(false);

  const handleSignup = () => {

    // 🔥 RESET ERRORS
    setErrors({});
    setPasswordError(false);

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

        const backendErrors = err.response?.data;

        // 🔥 SAVE ALL ERRORS
        setErrors(backendErrors || {});

        // 🔥 PASSWORD RED BORDER
        if (backendErrors?.password) {
          setPasswordError(true);
          setShowRules(true);
        }

        // 🔥 SHOW FIRST ERROR MESSAGE
        const firstError =
          backendErrors?.full_name?.[0] ||
          backendErrors?.email?.[0] ||
          backendErrors?.mobile?.[0] ||
          backendErrors?.password?.[0] ||
          "Signup failed";

        message.error(firstError);

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

        {/* FULL NAME */}
        <Input
          placeholder="Full Name"
          value={form.full_name}
          style={{
            marginBottom: 5,
            border: errors.full_name
              ? "1px solid red"
              : "",
          }}
          onChange={(e) => {

            setForm({
              ...form,
              full_name: e.target.value,
            });

            setErrors({
              ...errors,
              full_name: "",
            });

          }}
        />

        {errors.full_name && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.full_name[0]}
          </div>
        )}

        {/* EMAIL */}
        <Input
          placeholder="Email"
          value={form.email}
          style={{
            marginBottom: 5,
            border: errors.email
              ? "1px solid red"
              : "",
          }}
          onChange={(e) => {

            setForm({
              ...form,
              email: e.target.value,
            });

            setErrors({
              ...errors,
              email: "",
            });

          }}
        />

        {errors.email && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.email[0]}
          </div>
        )}

        {/* MOBILE */}
        <Input
          placeholder="Mobile"
          value={form.mobile}
          style={{
            marginBottom: 5,
            border: errors.mobile
              ? "1px solid red"
              : "",
          }}
          onChange={(e) => {

            setForm({
              ...form,
              mobile: e.target.value,
            });

            setErrors({
              ...errors,
              mobile: "",
            });

          }}
        />

        {errors.mobile && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.mobile[0]}
          </div>
        )}

        {/* PASSWORD */}
        <Input.Password
          placeholder="Password"
          value={form.password}
          style={{
            marginBottom: 5,
            border:
              passwordError || errors.password
                ? "1px solid red"
                : "",
          }}
          onChange={(e) => {

            setForm({
              ...form,
              password: e.target.value,
            });

            setPasswordError(false);

            setErrors({
              ...errors,
              password: "",
            });

          }}
        />

        {errors.password && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.password[0]}
          </div>
        )}

        {/* PASSWORD RULES */}
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