import { useEffect, useState } from "react";

import {
  Input,
  Button,
 Card,
  message,
} from "antd";

import API from "../services/api";

import MainLayout from "../components/Layout";

export default function AddStaff() {

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  // 🔥 ERRORS
  const [errors, setErrors] =
    useState({});

  const [passwordError,
    setPasswordError] =
    useState(false);

  const [showRules,
    setShowRules] =
    useState(false);

  // 🔥 RESPONSIVE CHECK
  useEffect(() => {

    if (typeof window !== "undefined") {

      const checkScreen = () => {
        setIsMobile(
          window.innerWidth < 768
        );
      };

      checkScreen();

      window.addEventListener(
        "resize",
        checkScreen
      );

      return () => {
        window.removeEventListener(
          "resize",
          checkScreen
        );
      };
    }

  }, []);

  // 🔥 SUBMIT
  const handleSubmit = () => {

    // RESET ERRORS
    setErrors({});

    // 🔥 BASIC VALIDATION
    if (
      !form.full_name ||
      !form.email ||
      !form.mobile ||
      !form.password
    ) {

      message.error(
        "Please fill all fields"
      );

      return;
    }

    setLoading(true);

    API.post(
      "/accounts/staff-signup/",
      form
    )

      .then(() => {

        message.success(
          "Staff Added Successfully"
        );

        // 🔥 RESET FORM
        setForm({
          full_name: "",
          email: "",
          mobile: "",
          password: "",
        });

        setErrors({});

        setPasswordError(false);

      })

      .catch((err) => {

        console.log(err.response?.data);

        const backendErrors =
          err.response?.data || {};

        // 🔥 SAVE ERRORS
        setErrors(
          JSON.parse(
            JSON.stringify(
              backendErrors
            )
          )
        );

        // 🔥 PASSWORD UI
        if (backendErrors.password) {

          setPasswordError(true);

          setShowRules(true);

        }

        // 🔥 TOAST
        const firstError =
          Object.values(
            backendErrors
          )[0];

        if (
          Array.isArray(firstError)
        ) {

          message.error(
            firstError[0]
          );

        } else {

          message.error(
            "Failed to add staff"
          );
        }

      })

      .finally(() => {

        setLoading(false);

      });

  };

  return (

    <MainLayout>

      <div
        style={{
          display: "flex",
          justifyContent:
            "center",

          padding:
            isMobile
              ? "10px"
              : "20px",

          overflowX:
            "hidden",
        }}
      >

        <Card
          title={
            <span
              style={{
                fontSize:
                  isMobile
                    ? 20
                    : 24,

                fontWeight:
                  "bold",
              }}
            >
              Add Staff
            </span>
          }

          style={{
            width: "100%",

            maxWidth: 500,

            borderRadius: 18,

            boxShadow:
              "0 4px 16px rgba(0,0,0,0.08)",

            border: "none",
          }}
        >

          {/* 🔥 NAME */}
          <Input
            placeholder="Full Name"

            value={form.full_name}

            onChange={(e) =>
              setForm({
                ...form,
                full_name:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 5,
              height: 45,
              borderRadius: 8,

              border:
                errors.full_name
                  ? "1px solid red"
                  : "",
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

          {/* 🔥 EMAIL */}
          <Input
            placeholder="Email"

            value={form.email}

            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 5,
              height: 45,
              borderRadius: 8,

              border:
                errors.email
                  ? "1px solid red"
                  : "",
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

          {/* 🔥 MOBILE */}
          <Input
            placeholder="Mobile"

            value={form.mobile}

            onChange={(e) =>
              setForm({
                ...form,
                mobile:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 5,
              height: 45,
              borderRadius: 8,

              border:
                errors.mobile
                  ? "1px solid red"
                  : "",
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

          {/* 🔥 PASSWORD */}
          <Input.Password
            placeholder="Password"

            value={form.password}

            onChange={(e) => {

              setForm({
                ...form,
                password:
                  e.target.value,
              });

              setPasswordError(false);

            }}

            style={{
              marginBottom: 5,
              height: 45,
              borderRadius: 8,

              border:
                passwordError
                  ? "1px solid red"
                  : "",
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

          {/* 🔥 PASSWORD RULES */}
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

          {/* 🔥 BUTTON */}
          <Button
            type="primary"
            block

            loading={loading}

            style={{
              height: 46,

              borderRadius: 10,

              fontWeight: 600,

              fontSize: 16,
            }}

            onClick={handleSubmit}
          >
            Add Staff
          </Button>

        </Card>

      </div>

    </MainLayout>
  );
}