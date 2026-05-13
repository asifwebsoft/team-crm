import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PaymentSuccess() {

  const router = useRouter();

  useEffect(() => {

    setTimeout(() => {

      router.push("/create-company");

    }, 2000);

  }, []);

  return <h2>Payment Successful...</h2>;
}