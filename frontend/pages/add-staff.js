import { useState } from "react";
import { Input, Button, Card } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function AddStaff() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleSubmit = () => {
    API.post("/accounts/staff-signup/", form)
      .then(() => alert("Staff Added"))
      .catch((err) => alert(JSON.stringify(err.response?.data)));
  };

  return (
    <MainLayout>
      <Card title="Add Staff" style={{ maxWidth: 400 }}>
        <Input placeholder="Name" onChange={(e)=>setForm({...form, full_name:e.target.value})} />
        <Input placeholder="Email" style={{marginTop:10}} onChange={(e)=>setForm({...form, email:e.target.value})} />
        <Input placeholder="Mobile" style={{marginTop:10}} onChange={(e)=>setForm({...form, mobile:e.target.value})} />
        <Input.Password placeholder="Password" style={{marginTop:10}} onChange={(e)=>setForm({...form, password:e.target.value})} />

        <Button type="primary" block style={{marginTop:10}} onClick={handleSubmit}>
          Add Staff
        </Button>
      </Card>
    </MainLayout>
  );
}