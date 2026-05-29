import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  role: "customer" | "agent";
  onRoleChange: (role: "customer" | "agent") => void;
}

function Navbar({ role, onRoleChange }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        background: "#1a1a2e",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "60px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <span
          onClick={() => navigate("/")}
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          CapBay Auto
        </span>

        {role === "agent" && (
          <span
            onClick={() => navigate("/registrations")}
            style={{
              color:
                location.pathname === "/registrations" ? "#4fc3f7" : "#aaa",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Registrations
          </span>
        )}

        {role === "customer" && (
          <span
            onClick={() => navigate("/")}
            style={{
              color: location.pathname === "/" ? "#4fc3f7" : "#aaa",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Register for Test Drive
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => {
            onRoleChange("customer");
            navigate("/");
          }}
          style={{
            padding: "6px 14px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: role === "customer" ? "#4fc3f7" : "#333",
            color: role === "customer" ? "#000" : "#aaa",
            fontSize: "13px",
          }}
        >
          Customer
        </button>
        <button
          onClick={() => {
            onRoleChange("agent");
            navigate("/registrations");
          }}
          style={{
            padding: "6px 14px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            background: role === "agent" ? "#4fc3f7" : "#333",
            color: role === "agent" ? "#000" : "#aaa",
            fontSize: "13px",
          }}
        >
          Sales Agent
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
