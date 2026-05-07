import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import API from "../services/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleSubmit = () => {

    API.post("/accounts/forgot-password/", {
      email,
    })
      .then(() => {
        message.success("Reset link sent");
      })
      .catch(() => {
        message.error("Email not found");
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
      <Card title="Forgot Password" style={{ width: 350 }}>

        <Input
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{ marginBottom: 15 }}
        />

        <Button
          type="primary"
          block
          onClick={handleSubmit}
        >
          Send Reset Link
        </Button>

      </Card>
    </div>
  );
}