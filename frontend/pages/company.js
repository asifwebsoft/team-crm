import { useState } from "react";
import API from "../services/api";

export default function Company() {

  const [form, setForm] = useState({
    name: "",
    address: "",
    contact_number: "",
    email: "",
    gstin: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {

    let newErrors = {};

    // NAME
    if (form.name.trim().length < 3) {
      newErrors.name = "Minimum 3 characters";
    }

    // ADDRESS
    if (form.address.trim().length < 5) {
      newErrors.address = "Enter proper address";
    }

    // MOBILE
    if (!/^[6-9]\d{9}$/.test(form.contact_number)) {
      newErrors.contact_number = "Invalid mobile number";
    }

    // EMAIL
    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = "Invalid email";
    }

    // GSTIN
    if (
      form.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstin
      )
    ) {
      newErrors.gstin = "Invalid GSTIN";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const create = async () => {

    if (!validate()) return;

    try {

      await API.post("/company/create/", form);

      window.location.href = "/dashboard";

    } catch (err) {

        console.log(err.response.data);

        setErrors(err.response.data || {});
      }
  };

  const inputStyle = (field) => ({
    padding: "12px",
    width: "350px",
    border: errors[field]
      ? "1px solid red"
      : "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <div
        style={{
          width: "420px",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >

        <h2>Create Company</h2>

        {/* COMPANY NAME */}
        <div>
          <input
            placeholder="Company Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            style={inputStyle("name")}
          />
          {errors.name && (
            <div style={{ color: "red", fontSize: 13 }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* ADDRESS */}
        <div>
          <textarea
            placeholder="Company Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            style={{
              ...inputStyle("address"),
              height: "80px",
            }}
          />
          {errors.address && (
            <div style={{ color: "red", fontSize: 13 }}>
              {errors.address}
            </div>
          )}
        </div>

        {/* CONTACT */}
        <div>
          <input
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={(e) =>
              setForm({
                ...form,
                contact_number: e.target.value,
              })
            }
            style={inputStyle("contact_number")}
          />
          {errors.contact_number && (
            <div style={{ color: "red", fontSize: 13 }}>
              {errors.contact_number}
            </div>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <input
            placeholder="Company Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            style={inputStyle("email")}
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: 13 }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* GSTIN */}
        <div>
          <input
            placeholder="GSTIN Number"
            value={form.gstin}
            onChange={(e) =>
              setForm({
                ...form,
                gstin: e.target.value.toUpperCase(),
              })
            }
            style={inputStyle("gstin")}
          />
          {errors.gstin && (
            <div style={{ color: "red", fontSize: 13 }}>
              {errors.gstin}
            </div>
          )}
        </div>

        <button
          onClick={create}
          style={{
            padding: "12px",
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