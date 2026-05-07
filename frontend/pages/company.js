import { useState } from "react";
import API from "../services/api";

export default function Company() {
  const [name,setName]=useState("");

  const create=async()=>{
    await API.post("/company/create/",{name});
    window.location.href="/dashboard";
  };

  return (
    <div>
      <input onChange={(e)=>setName(e.target.value)}/>
      <button onClick={create}>Create Company</button>
    </div>
  );
}