import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { saveAs } from "file-saver"; // Add this for saving the file

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
  priority: string;
  date_created: string;
  created_by: string;
  assigned_to: string;
  description: string;
}

interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  comment: string;
  date_created: string;
  username: string;
  profile_picture: string;
}

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [userRole, setUserRole] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

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
        setPriority(ticketData.priority);

        const [createdByResponse, commentsResponse] = await Promise.all([
          apiConfig.get(`/users/${ticketData.created_by}`),
          apiConfig.get(`/comments/${ticketId}`),
        ]);

        setCreatedBy(createdByResponse.data.username);
        setComments(commentsResponse.data);
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

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await apiConfig.put(`/tickets/update-priority/${ticketId}`, {
        priority: newPriority,
      });
      setTicket((prev) => (prev ? { ...prev, priority: newPriority } : null));
      setPriority(newPriority);
    } catch (error) {
      console.error("Error updating priority:", error);
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

  const handleCommentSubmit = async () => {
    try {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) return;

      const TOKEN_KEY = process.env.REACT_APP_JWT;
      const decoded: DecodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);

      await apiConfig.post(`/comments/${ticketId}`, {
        ticket_id: ticketId,
        user_id: decoded.userId,
        comment,
      });

      setComment(""); // Clear the input box
      const commentsResponse = await apiConfig.get(`/comments/${ticketId}`);
      setComments(commentsResponse.data); // Refresh comments
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const convertToCSV = (ticket: Ticket, createdBy: string) => {
    const csvRows = [];
    const headers = [
      "Title",
      "Status",
      "Priority",
      "Created By",
      "Date",
      "Time",
      "Description",
    ];
    csvRows.push(headers.join(","));

    const { title, status, priority, date_created, description } = ticket;

    const date = new Date(date_created);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const row = [
      title,
      status,
      priority,
      createdBy,
      formattedDate,
      formattedTime,
      description.replace(/,/g, ";"), // Replace commas to avoid breaking CSV format
    ].join(",");

    csvRows.push(row);

    return csvRows.join("\n");
  };

  const handleExportCSV = (ticket: Ticket, createdBy: string) => {
    const csvContent = convertToCSV(ticket, createdBy);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Ticket #${ticket.id} (${ticket.title}).csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <p>
                Status:{" "}
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </p>

              <p>
                Priority:{" "}
                <select
                  value={priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </p>
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
              <button onClick={() => handleExportCSV(ticket, createdBy)}>
                Export to CSV
              </button>
            </div>
          )}
          <div>
            <h2>Comments</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={handleCommentSubmit}>Send</button>
            <div>
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id}>
                    <div>
                      <img
                        src={"http://localhost:3000/" + comment.profile_picture}
                        alt="Profile"
                        width="20"
                      />
                      <p>
                        <strong>{comment.username}</strong>{" "}
                        {new Date(comment.date_created).toLocaleString()}
                      </p>
                    </div>
                    <p>{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TicketDetails;
