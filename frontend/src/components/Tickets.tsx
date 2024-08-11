import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Ticket } from "../interfaces/Ticket";

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<string>("Open,In Progress"); // Default filter
  const [searchQuery, setSearchQuery] = useState<string>("");
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
        localStorage.removeItem("jwt");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    // Function handles fetching all the tickets based on the selected filter.
    const fetchTickets = async () => {
      try {
        let url = "/tickets";
        if (searchQuery) {
          url += `?search=${searchQuery}`;
        } else if (filter) {
          url += `?status=${filter}`;
        }

        const response = await apiConfig.get(url);
        setTickets(response.data);

        const userIds = Array.from(
          new Set(
            response.data.flatMap((ticket: Ticket) => [
              ticket.created_by,
              ticket.assigned_to,
            ])
          )
        );
        const userResponses = await Promise.all(
          userIds.map((userId) => apiConfig.get(`/users/${userId}`))
        );
        const userMap = userResponses.reduce((acc, userRes) => {
          acc[userRes.data.id] = userRes.data.username;
          return acc;
        }, {} as { [key: string]: string });
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching tickets or users:", error);
      }
    };

    fetchTickets();
  }, [filter, searchQuery, navigate]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate("/tickets/create-ticket");
  };

  return (
    <div>
      {/* Tickets */}
      <h1>All Tickets</h1>

      {/* Create A New Ticket */}
      <button onClick={handleCreateTicket}>Create New Ticket</button>

      {/* Filters & Search */}
      <div>
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filters */}
        <button onClick={() => setFilter("Open,In Progress")}>
          Open Tickets
        </button>
        <button onClick={() => setFilter("Resolved")}>Resolved Tickets</button>
        <button onClick={() => setFilter("Closed")}>Closed Tickets</button>
        <button onClick={() => setFilter("Open,In Progress,Resolved,Closed")}>
          All Tickets
        </button>
      </div>

      {/* Query Tickets From Database */}
      <div>
        {tickets.map((ticket) => (
          <button key={ticket.id} onClick={() => handleTicketClick(ticket.id)}>
            <h2>{ticket.title}</h2>
            <p>Status: {ticket.status}</p>
            <p>Priority: {ticket.priority}</p>
            <p>Created By: {users[ticket.created_by]}</p>
            <p>
              Date Created: {new Date(ticket.date_created).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tickets;
