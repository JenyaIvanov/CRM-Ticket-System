import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import JWT from "expo-jwt";

const Profile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve JWT token from localStorage
    const TOKEN_KEY = process.env.REACT_APP_JWT;
    const jwtToken = localStorage.getItem("jwt");

    if (!jwtToken) {
      navigate("/login");
      return;
    }

    try {
      // Decode the Token to check if its valid.
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
        // Token is valid
        setUsername(decoded.username);
        setEmail(decoded.email);
        setProfilePicture(
          decoded.profile_picture
            ? `http://localhost:3000/${decoded.profile_picture}`
            : "http://localhost:3000/user-data/images/default-profile.png"
        );
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

  // Function to handle profile changes submit.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password match checker.
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("email", email.trim());

    // Password changed?
    if (password) {
      formData.append("password", password.trim());
    }

    // New profile picture?
    if (newProfilePicture) {
      formData.append("profilePicture", newProfilePicture);
    }

    // Nothing changed.
    if (!username && !email && !password && !newProfilePicture) {
      setError("At least one field must be filled out");
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwt");
      const TOKEN_KEY = process.env.REACT_APP_JWT;
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);

      const response = await apiConfig.put(
        `/users/${decoded.userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Profile updated successfully");
      setError("");

      // Update profile picture if it was changed
      if (newProfilePicture) {
        setProfilePicture(
          `http://localhost:3000/${response.data.profile_picture}`
        );
      }

      // Update local storage with the new token containing updated info
      localStorage.setItem("jwt", response.data.token);
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
            name="password"
            autoComplete="on"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Repeat Password:</label>
          <input
            type="password"
            name="repeatPassword"
            autoComplete="on"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <img src={profilePicture} alt="Profile" width="100" />
          <input
            type="file"
            onChange={(e) => setNewProfilePicture(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Profile;
