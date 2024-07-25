import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
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
  const [status, setStatus] = useState("");
  const [userRole, setUserRole] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

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
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
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
        const ticketData = response.data;
        setTicket(ticketData);
        setTitle(ticketData.title);
        setDescription(ticketData.description);
        setStatus(ticketData.status);

        const [createdByResponse, assignedToResponse] = await Promise.all([
          apiConfig.get(`/users/${ticketData.created_by}`),
          apiConfig.get(`/users/${ticketData.assigned_to}`),
        ]);

        setCreatedBy(createdByResponse.data.username);
        setAssignedTo(assignedToResponse.data.username);
      } catch (error) {
        console.error("Error fetching ticket details or users:", error);
      }
    };

    fetchTicketDetails();
  }, [navigate, ticketId]);

  const handleEdit = async () => {
    try {
      await apiConfig.put(`/tickets/${ticketId}`, {
        title,
        description,
        status,
      });
      setTicket((prev) =>
        prev ? { ...prev, title, description, status } : null
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiConfig.put(`/tickets/update-status/${ticketId}`, {
        status: newStatus,
      });
      setTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
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

  const handleResolveTicket = async () => {
    try {
      await apiConfig.put(`/tickets/update-status/${ticketId}`, {
        status: "Resolved",
      });
      setTicket((prev) => (prev ? { ...prev, status: "Resolved" } : null));
      setStatus("Resolved");
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleBackToTickets}>Back to Tickets</button>
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
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <button onClick={handleEdit}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <h1>{ticket.title}</h1>
              <p>Status: {ticket.status}</p>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <p>
                Date Created: {new Date(ticket.date_created).toLocaleString()}
              </p>
              <p>Created By: {createdBy}</p>
              <p>{ticket.description}</p>
              {userRole === "admin" && (
                <div>
                  <button onClick={() => setEditMode(true)}>Edit</button>
                  <button onClick={handleDelete}>Delete</button>
                </div>
              )}
              {ticket.status === "Resolved" ? (
                ""
              ) : (
                <button onClick={handleResolveTicket}>Resolve Ticket</button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetails;
