import { Outlet } from "react-router-dom";
import { Zap } from "lucide-react";

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0e0e0",
        padding: "1.5rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Branding above card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#1a1a1a",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            marginBottom: "0.5rem",
          }}
        >
          <Zap size={26} strokeWidth={2.5} />
        </div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Zync
        </h1>
      </div>

      {/* Main card */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          padding: "2.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Outlet />
      </div>

      {/* Footer links below card */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "#9ca3af",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
          PRIVACY POLICY
        </a>
        <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
          TERMS OF SERVICE
        </a>
        <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
          HELP CENTER
        </a>
      </div>
    </div>
  );
};

export default AuthLayout;
