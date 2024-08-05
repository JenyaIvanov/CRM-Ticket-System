import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import JWT from "expo-jwt";

const CreateTicket: React.FC = () => {
  const [user_id, setUserId] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
        setUserId(decoded.userId);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

  // Function to handle submit button on Ticket creation.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // New Ticket Details
    const newTicket = {
      title,
      description,
      status: "Open",
      priority: "Low",
      created_by: user_id,
      assigned_to: user_id,
    };

    try {
      await apiConfig.post("/tickets", newTicket);
      navigate("/tickets"); // Navigate back to the tickets list after successful creation
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/tickets")}>Return To Tickets</button>
      <h1>Create New Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Ticket</button>
      </form>
    </div>
  );
};

export default CreateTicket;
