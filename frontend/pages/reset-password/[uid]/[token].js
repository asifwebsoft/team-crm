import { useRouter } from "next/router";

import {
  useState
} from "react";

import {
  Card,
  Input,
  Button,
  Typography,
  message
} from "antd";

import API from "../../../services/api";

const { Title } = Typography;

export default function ResetPassword() {

  const router = useRouter();

  const router = useRouter();

  const uid = router.query.uid || "";

  const token =
   router.query.token || "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

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

      const response =
        await API.post(
          "/accounts/reset-password/",
          {
            uid: String(uid),
            token: String(token),
            password,
        }
        );

      message.success(
        response.data.message
      );

      // ✅ REDIRECT LOGIN

      setTimeout(() => {

        router.push("/login");

      }, 1500);

    } catch (err) {

      console.log(
        err.response?.data
      );

      message.error(

        err.response?.data?.error

        ||

        "Reset failed"
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

        {/* NEW PASSWORD */}

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

        {/* CONFIRM PASSWORD */}

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

        {/* BUTTON */}

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