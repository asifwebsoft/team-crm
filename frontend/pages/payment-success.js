import { useEffect } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";

export default function PaymentSuccess() {

  const router = useRouter();

  useEffect(() => {

    const activateSubscription = async () => {

      try {

        await API.post("/subscription/verify/");

        router.push("/create-company");

      } catch (err) {

        console.log(err);

      }
    };

    activateSubscription();

  }, []);

  return <h2>Payment Successful...</h2>;
}