import { useState } from "react";

import {
  Card,
  Input,
  Button,
  message
} from "antd";

export default function ForgotPassword() {

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ✅ SEND RESET LINK

  const handleSubmit = async () => {

    try {

      if (!email) {

        return message.error(
          "Enter email"
        );
      }

      setLoading(true);

      const response =
        await fetch(

          "https://team-crm-backend.onrender.com/api/accounts/forgot-password/",

          {
            method: "POST",

            headers: {
              "Content-Type":
              "application/json",
            },

            body: JSON.stringify({
              email,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        message.success(
          data.message
        );

      } else {

        message.error(
          data.error
          ||
          "Something went wrong"
        );
      }

    } catch (err) {

      message.error(
        "Server error"
      );

    } finally {

      setLoading(false);
    }
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
        title="Forgot Password"
        style={{
          width: 350,
          borderRadius: 12,
        }}
      >

        <Input
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            marginBottom: 15,
          }}
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleSubmit}
        >
          Send Reset Link
        </Button>

      </Card>

    </div>
  );
}

