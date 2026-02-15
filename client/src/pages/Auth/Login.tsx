import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "left", marginBottom: "1.75rem" }}>
        <img
          src="/logo.svg"
          alt="Zync Logo"
          style={{
            width: "48px",
            height: "48px",
            marginBottom: "1.5rem",
            display: "block",
          }}
        />
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "0.375rem",
            color: "#1a1a1a",
            letterSpacing: "-0.025em",
          }}
        >
          Welcome back
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
          Enter your details to access your workspace.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#ef4444",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1.25rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          className="auth-input"
          label="EMAIL ADDRESS"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          style={{ height: "48px" }}
        />
        <Input
          className="auth-input"
          label="PASSWORD"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{ height: "48px" }}
          suffix={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onSuffixClick={() => setShowPassword(!showPassword)}
          labelRight={
            <Link
              to="/forgot-password"
              style={{
                color: "#6b7280",
                fontWeight: 500,
                textDecoration: "none",
                fontSize: "0.8125rem",
              }}
            >
              Forgot password?
            </Link>
          }
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          style={{
            marginTop: "0.25rem",
            height: "48px",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "0.9375rem",
            fontWeight: 500,
            borderRadius: "8px",
          }}
        >
          <span>Sign In</span>
          <ArrowRight size={18} />
        </Button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "1.75rem 0",
          color: "#9ca3af",
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
        <span style={{ padding: "0 1rem" }}>OR CONTINUE WITH</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          type="button"
          style={{
            flex: 1,
            height: "48px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "#374151",
            transition: "background-color 0.15s ease, border-color 0.15s ease",
          }}
        >
          {/* Google Icon SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            height: "48px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "#374151",
            transition: "background-color 0.15s ease, border-color 0.15s ease",
          }}
        >
          {/* Apple Icon SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.07-.52-2.07-.53-3.2 0-1.44.71-2.01.56-3.15-.48-5.24-4.85-4.35-13.19 1.69-13.43 1.61-.06 2.76.99 3.63.99.91 0 2.45-1.16 4.09-.99 1.34.13 2.59.58 3.51 1.76-3.23 1.95-2.66 6.31.59 7.64-.69 1.73-1.63 3.43-2.91 4.71-.46.46-.94.9-1.17 1.42zM12.03 7.25c-.23-2.3 1.6-4.14 3.73-4.25.31 2.52-2.18 4.41-3.73 4.25z" />
          </svg>
          Apple
        </button>
      </div>

      <div
        style={{
          marginTop: "1.75rem",
          textAlign: "center",
          fontSize: "0.9375rem",
          color: "#374151",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/signup"
          style={{
            color: "#1a1a1a",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Signup for free
        </Link>
      </div>
    </div>
  );
};

export default Login;
