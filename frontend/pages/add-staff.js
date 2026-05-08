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

      })

      .catch((err) => {

        console.log(err);

        message.error(
          err.response?.data?.error ||
            "Failed to add staff"
        );

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
              marginBottom: 14,
              height: 45,
              borderRadius: 8,
            }}
          />

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
              marginBottom: 14,
              height: 45,
              borderRadius: 8,
            }}
          />

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
              marginBottom: 14,
              height: 45,
              borderRadius: 8,
            }}
          />

          {/* 🔥 PASSWORD */}
          <Input.Password
            placeholder="Password"

            value={form.password}

            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }

            style={{
              marginBottom: 18,
              height: 45,
              borderRadius: 8,
            }}
          />

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