import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { STATUS_LABELS, STATUS_COLORS } from "../lib/constants";

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  icNumber: string;
  status: string;
  downPayment: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function RegistrationsPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/registrations", {
          params: { page, limit: 20, search },
        });
        setRegistrations(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [page, search]);

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>Registrations</h1>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          New Registration
        </button>
      </div>

      <input
        placeholder="Search by name, email or IC number..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  whiteSpace: "nowrap",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Down Payment
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Registered
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/registrations/${r.id}`)}
                style={{ cursor: "pointer", borderBottom: "1px solid #ddd" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <td style={{ padding: "12px" }}>{r.id}</td>
                <td style={{ padding: "12px" }}>{r.name}</td>
                <td style={{ padding: "12px" }}>{r.email}</td>
                <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      background: STATUS_COLORS[r.status],
                      color: "white",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  RM {Number(r.downPayment).toLocaleString()}
                </td>
                <td style={{ padding: "12px" }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
          }}
        >
          <p>
            Showing {registrations.length} of {pagination.total} registrations
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ padding: "8px" }}>
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationsPage;
