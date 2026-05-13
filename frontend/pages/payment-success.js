import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function PaymentSuccess() {

  const router = useRouter();

  useEffect(() => {

    const verifySubscription = async () => {

      try {

        const token = localStorage.getItem("access");

        await axios.post(
          "https://team-crm-backend.onrender.com/api/subscription/verify/",
          {
            plan: "pro"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        router.push("/company");

      } catch (err) {

        console.log("VERIFY ERROR:", err);

        router.push("/subscription");
      }
    };

    verifySubscription();

  }, []);

  return (
    <div>
      <h1>Payment Successful...</h1>
    </div>
  );
}