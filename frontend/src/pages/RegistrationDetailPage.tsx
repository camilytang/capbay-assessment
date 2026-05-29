import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../lib/api";
import { STATUS_LABELS } from "../lib/constants";

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  icNumber: string;
  status: string;
  downPayment: string;
  isPromotionEligible: boolean;
  loanAmount: string;
  createdAt: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ["TEST_DRIVE_SCHEDULED", "CANCELLED"],
  TEST_DRIVE_SCHEDULED: ["TEST_DRIVE_COMPLETED", "CANCELLED"],
  TEST_DRIVE_COMPLETED: ["PURCHASED", "CANCELLED"],
  PURCHASED: [],
  CANCELLED: [],
};

function RegistrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchRegistration = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/registrations/${id}`);
        setRegistration(res.data);
        setDownPayment(res.data.downPayment);
      } catch {
        setError("Registration not found");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [id]);

  const handleUpdate = async (updates: {
    status?: string;
    downPayment?: string;
  }) => {
    setUpdating(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.patch(`/registrations/${id}`, updates);
      setRegistration(res.data);
      setSuccessMsg("Updated successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (!registration)
    return <p style={{ padding: "40px" }}>{error || "Not found"}</p>;

  const nextStatuses = VALID_TRANSITIONS[registration.status] || [];

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <button
        onClick={() => navigate("/registrations")}
        style={{
          marginBottom: "24px",
          padding: "8px 16px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Back to List
      </button>

      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <h1 style={{ marginBottom: "24px" }}>{registration.name}</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <p style={{ color: "#666", fontSize: "12px" }}>EMAIL</p>
            <p>{registration.email}</p>
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px" }}>PHONE</p>
            <p>{registration.phone}</p>
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px" }}>IC NUMBER</p>
            <p>{registration.icNumber}</p>
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px" }}>REGISTERED ON</p>
            <p>{new Date(registration.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: registration.isPromotionEligible
              ? "#d4edda"
              : "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Promotion Eligibility:{" "}
            {registration.isPromotionEligible
              ? "✅ Eligible (15% discount)"
              : "❌ Not Eligible"}
          </p>
          <p>Car Price: RM 200,000</p>
          <p>
            Down Payment: RM {Number(registration.downPayment).toLocaleString()}
          </p>
          <p>
            Loan Amount: RM {Number(registration.loanAmount).toLocaleString()}
          </p>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>
            CURRENT STATUS
          </p>
          <p style={{ fontWeight: "bold" }}>
            {STATUS_LABELS[registration.status]}
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              padding: "12px",
              background: "#d4edda",
              color: "#155724",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            {successMsg}
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

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Update Down Payment (RM)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              onClick={() => handleUpdate({ downPayment })}
              disabled={updating}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Update
            </button>
          </div>
        </div>

        {nextStatuses.length > 0 && (
          <div>
            <p style={{ marginBottom: "8px" }}>Move to next status:</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdate({ status: s })}
                  disabled={updating}
                  style={{
                    padding: "8px 16px",
                    background: s === "CANCELLED" ? "#dc3545" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationDetailPage;
