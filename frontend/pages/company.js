import { useState } from "react";
import API from "../services/api";

export default function Company() {
  const [name,setName]=useState("");

  const create=async()=>{
    await API.post("/company/create/",{name});
    window.location.href="/dashboard";
  };

  return (
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  }}
>
  <div
    style={{
      display: "flex",
      gap: "12px",
      padding: "30px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}
  >
    <input
      placeholder="Enter company name"
      onChange={(e) => setName(e.target.value)}
      style={{
        padding: "12px",
        width: "250px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "16px",
        outline: "none",
      }}
    />

    <button
      onClick={create}
      style={{
        padding: "12px 20px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      Create Company
    </button>
  </div>
</div>
  );
}