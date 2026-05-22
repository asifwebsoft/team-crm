import { useRouter } from "next/router";

import {
  useState,
  useEffect
} from "react";

import {
  Card,
  Input,
  Button,
  Typography,
  message
} from "antd";

const { Title } = Typography;

export default function ResetPassword() {

  const router = useRouter();

  const [uid, setUid] =
    useState("");

  const [token, setToken] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  // ✅ GET UID & TOKEN

  useEffect(() => {

    if (router.isReady) {

      const uidValue =
        router.query.uid || "";

      let tokenValue = "";

      if (
        Array.isArray(
          router.query.token
        )
      ) {

        tokenValue =
          router.query.token.join("");

      } else {

        tokenValue =
          router.query.token || "";
      }

      setUid(
        String(uidValue)
      );

      setToken(
        String(tokenValue)
      );
    }

  }, [router.isReady]);

  // ✅ RESET PASSWORD

  const handleReset = async () => {

    if (!uid || !token) {

      return message.error(
        "Invalid reset link"
      );
    }

    try {

      if (!password) {

        return message.error(
          "Enter new password"
        );
      }

      if (
        password.length < 6
      ) {

        return message.error(
          "Password must be at least 6 characters"
        );
      }

      if (
        password !==
        confirmPassword
      ) {

        return message.error(
          "Passwords do not match"
        );
      }

      setLoading(true);

      // ✅ RESET PASSWORD API

      const response =
        await fetch(

          "https://team-crm-backend.onrender.com/api/accounts/reset-password/",

          {
            method: "POST",

            headers: {
              "Content-Type":
              "application/json",
            },

            body: JSON.stringify({
              uid,
              token,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        message.success(
          data.message
        );

        setTimeout(() => {

          router.push("/login");

        }, 1500);

      } else {

        message.error(
          data.error
          ||
          "Reset failed"
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
        style={{
          width: 400,
          borderRadius: 12,
        }}
      >

        <Title
          level={3}
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          Reset Password
        </Title>

        <Input.Password
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            marginBottom: 15,
          }}
        />

        <Input.Password
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          style={{
            marginBottom: 20,
          }}
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleReset}
        >
          Reset Password
        </Button>

      </Card>

    </div>
  );
}