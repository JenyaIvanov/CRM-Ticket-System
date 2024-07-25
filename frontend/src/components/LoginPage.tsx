import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await apiConfig.post("/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        const { username, user_id, token } = response.data;

        localStorage.setItem("user_id", user_id);
        localStorage.setItem("username", username);
        localStorage.setItem("jwt", token); // Store the JWT token in localStorage
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("Invalid username or password");
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
};

export default LoginPage;
