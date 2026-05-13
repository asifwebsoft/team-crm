import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PaymentSuccess() {

  const router = useRouter();

  useEffect(() => {

    setTimeout(() => {

      router.push("/company/create");

    }, 2000);

  }, []);

  return (
    <div>
      <h1>Payment Successful</h1>
    </div>
  );
}