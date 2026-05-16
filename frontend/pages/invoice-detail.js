import { useRouter } from "next/router";

export default function TestPage() {

  const router = useRouter();

  return (
    <div
      style={{
        fontSize: 40,
        padding: 50,
        color: "red",
      }}
    >
      Invoice ID: {router.query.id}
    </div>
  );
}