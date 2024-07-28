import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";

interface DecodedToken {
  exp: number;
  username: string;
  userId: number;
  email: string;
  [key: string]: any;
}

const Profile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const TOKEN_KEY = process.env.REACT_APP_JWT;
    const jwtToken = localStorage.getItem("jwt");

    if (!jwtToken) {
      navigate("/login");
      return;
    }

    try {
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);
      fetchUserInfo(decoded.userId);
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserInfo = async (userId: number) => {
    try {
      const response = await apiConfig.get(`/users/${userId}`);
      const user = response.data;
      setUsername(user.username);
      setEmail(user.email);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    const updates: any = {};
    if (username !== undefined && username.trim())
      updates.username = username.trim();
    if (email !== undefined && email.trim()) updates.email = email.trim();
    if (password !== undefined && password.trim())
      updates.password = password.trim();

    if (!updates.username && !updates.email && !updates.password) {
      setError("At least one field must be filled out");
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwt");
      const TOKEN_KEY = process.env.REACT_APP_JWT;
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);

      await apiConfig.put(`/users/${decoded.userId}`, updates);
      setSuccess("Profile updated successfully");
      setError("");
      fetchUserInfo(decoded.userId); // Re-fetch user info after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div>
          <label>Repeat Password:</label>
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Profile;
