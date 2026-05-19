import { useState } from "react";
import { Input, Button, Card, message } from "antd";
import { useRouter } from "next/router";
import API from "../services/api";

export default function Login() {

  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // 🔥 ERROR STATES
  const [errors, setErrors] = useState({});

  const handleLogin = () => {

    // 🔥 RESET ERRORS
    setErrors({});

    // 🔥 EMPTY VALIDATION
    if (!form.email || !form.password) {

      const newErrors = {};

      if (!form.email) {
        newErrors.email = "Email is required";
      }

      if (!form.password) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);

      message.error("Please fill all fields");

      return;
    }

    API.post("/accounts/login/", form)

      .then((res) => {

        // SAVE TOKENS
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        // SAVE USER INFO
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("company", res.data.company);

        console.log(res.data);

        // ROLE BASED REDIRECT
        if (res.data.role === "manager") {
          router.push("/manager-dashboard");
        } else {
          router.push("/dashboard");
        }

      })

      .catch((err) => {

        console.log(err.response?.data);

        let backendError = "Invalid email or password";

        if (err.response?.data?.error) {
          backendError = err.response.data.error;
        }

        // 🔥 SHOW ERROR BELOW INPUTS
        setErrors({
          email: backendError,
          password: backendError,
        });

        message.error(backendError);

      });

  };

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 100,
      }}
    >

      <Card
        title="Login"
        style={{
          width: 320,
          borderRadius: 10,
        }}
      >

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
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {errors.email && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.email}
          </div>
        )}

        {/* PASSWORD */}
        <Input.Password
          placeholder="Password"
          value={form.password}
          style={{
            marginBottom: 5,
            border: errors.password
              ? "1px solid red"
              : "",
          }}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {errors.password && (
          <div
            style={{
              color: "red",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {errors.password}
          </div>
        )}

        <Button
          type="primary"
          block
          onClick={handleLogin}
        >
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