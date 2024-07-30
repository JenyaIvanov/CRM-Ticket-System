// RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // Default role, can be changed by user input

  const handleRegister = async () => {
    try {
      await apiConfig.post("/users", {
        username,
        email,
        password,
        role,
      });
      // Assuming successful registration redirects to /login
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      // Handle error display or notification
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default RegisterPage;
