import { useState } from "react";
import axios from "axios";
import { api } from "../lib/api";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    icNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const icDigitsOnly = form.icNumber.replace(/\D/g, "");
      if (icDigitsOnly.length !== 12) {
        setError("IC number must be exactly 12 digits");
        setLoading(false);
        return;
      }

      const phoneDigitsOnly = form.phone.replace(/\D/g, "");
      if (phoneDigitsOnly.length < 10) {
        setError("Phone number must be at least 10 digits");
        setLoading(false);
        return;
      }

      const formattedIC = `${icDigitsOnly.slice(0, 6)}-${icDigitsOnly.slice(6, 8)}-${icDigitsOnly.slice(8, 12)}`;
      const formattedPhone = form.phone.startsWith("+60")
        ? form.phone
        : `+60${form.phone.replace(/^0/, "")}`;

      await api.post("/registrations", {
        ...form,
        icNumber: formattedIC,
        phone: formattedPhone,
      });
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", icNumber: "" });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        background: "white",
        borderRadius: "8px",
      }}
    >
      <h1 style={{ marginBottom: "24px" }}>Register for Test Drive</h1>
      <p style={{ marginBottom: "24px", color: "#666" }}>
        CapBay Vroom — RM 200,000
      </p>

      {success && (
        <div
          style={{
            padding: "12px",
            background: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          Registration successful! We will contact you to schedule your test
          drive.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Phone Number
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="e.g. 0123456789"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            IC Number
          </label>
          <input
            name="icNumber"
            value={form.icNumber}
            onChange={handleChange}
            required
            placeholder="e.g. 940629190011"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
