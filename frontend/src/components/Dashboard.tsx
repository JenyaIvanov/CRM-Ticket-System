import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import apiConfig from "../api/apiConfig";

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [inProgressTickets, setInProgressTickets] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalUrgentTickets, setTotalUrgentTickets] = useState(0);
  const navigate = useNavigate();

  const handleViewTickets = () => {
    navigate("/tickets");
  };

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
        fetchUserInfo(userId);
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate, userId]);

  // Function to handle personal details and personal statistics.
  const fetchUserInfo = async (userId: number) => {
    if (userId === 0) return;
    try {
      const response = await apiConfig.get(`/users/${userId}`);
      const user = response.data;
      setUsername(user.username);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Function to handle fetiching Ticket and System statistics from the backend.
  const fetchStatistics = async () => {
    try {
      const openTicketsResponse = await apiConfig.get(
        "/statistics/tickets/open/count"
      );
      const inProgressTicketsResponse = await apiConfig.get(
        "/statistics/tickets/in-progress/count"
      );
      const totalTicketsResponse = await apiConfig.get(
        "/statistics/tickets/total/count"
      );
      const totalUrgentTicketsResponse = await apiConfig.get(
        "/statistics/tickets/total-urgent/count"
      );

      setOpenTickets(openTicketsResponse.data.results[0].count);
      setInProgressTickets(inProgressTicketsResponse.data.results[0].count);
      setTotalTickets(totalTicketsResponse.data.results[0].count);
      setTotalUrgentTickets(totalUrgentTicketsResponse.data.results[0].count);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  return (
    <div>
      <h1>Welcome {username} to the system!</h1>
      <p>Total Open Tickets: {openTickets + inProgressTickets}</p>
      <p>New Tickets: {openTickets}</p>
      <p>Tickets In Progress: {inProgressTickets}</p>
      <p>Total Tickets: {totalTickets}</p>
      <p>Urgent Tickets: {totalUrgentTickets}</p>
      <button onClick={handleViewTickets}>View All Tickets</button>
    </div>
  );
};

export default Dashboard;
