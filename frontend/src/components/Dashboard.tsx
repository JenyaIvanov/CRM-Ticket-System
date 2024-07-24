import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JWT from "expo-jwt";
import apiConfig from "../api/apiConfig";

interface DecodedToken {
  exp: number;
  username: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [openTickets, setOpenTickets] = useState(0);
  const [inProgressTickets, setInProgressTickets] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
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
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem("jwt");
        localStorage.removeItem("username");
        navigate("/login");
      } else {
        // Token is valid
        setUsername(decoded.username);
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      localStorage.removeItem("username");
      navigate("/login");
    }
  }, [navigate]);

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

      setOpenTickets(openTicketsResponse.data.results[0].count);
      setInProgressTickets(inProgressTicketsResponse.data.results[0].count);
      setTotalTickets(totalTicketsResponse.data.results[0].count);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  return (
    <div>
      <h1>Welcome {username} to the system!</h1>
      <p>Open Tickets: {openTickets}</p>
      <p>Tickets In Progress: {inProgressTickets}</p>
      <p>Total Tickets: {totalTickets}</p>
    </div>
  );
};

export default Dashboard;
