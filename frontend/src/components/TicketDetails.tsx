import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import Cookies from "js-cookie";
import JWT from "expo-jwt";

interface DecodedToken {
  exp: number;
  username: string;
  userId: number;
  [key: string]: any;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  date_created: string;
  created_by: string;
  assigned_to: string;
  description: string;
}

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [userRole, setUserRole] = useState("");

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
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
        // Token is valid
        setUserRole(decoded.role);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    const fetchTicketDetails = async () => {
      try {
        const response = await apiConfig.get(`/tickets/${ticketId}`);
        setTicket(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      }
    };

    fetchTicketDetails();
  }, [navigate, ticketId]);

  const handleEdit = async () => {
    try {
      await apiConfig.put(`/tickets/${ticketId}`, { title, description });
      setTicket((prev) => (prev ? { ...prev, title, description } : null));
      setEditMode(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await apiConfig.delete(`/tickets/${ticketId}`);
      navigate("/tickets");
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const handleBackToTickets = () => {
    navigate("/tickets");
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {ticket ? (
        <div>
          {editMode ? (
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button onClick={handleEdit}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <h1>{ticket.title}</h1>
              <p>Status: {ticket.status}</p>
              <p>
                Date Created: {new Date(ticket.date_created).toLocaleString()}
              </p>
              <p>Created By: {ticket.created_by}</p>
              <p>Assigned To: {ticket.assigned_to}</p>
              <p>{ticket.description}</p>
              {userRole === "admin" && (
                <div>
                  <button onClick={() => setEditMode(true)}>Edit</button>
                  <button onClick={handleDelete}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={() => navigate("/tickets")}>Back to Tickets</button>
    </div>
  );
};

export default TicketDetails;
