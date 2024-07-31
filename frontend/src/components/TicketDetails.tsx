import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Ticket } from "../interfaces/Ticket";
import { Article } from "../interfaces/Article";
import { Comment } from "../interfaces/Comment";
import JWT from "expo-jwt";

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [articles, setArticles] = useState<Article[] | null>(null);
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
      } else {
        // Token is valid

        setUserRole(decoded.role);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    // Function to handle fetching Ticket Details.
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

    // Function to handle fetching Ticket Details.
    const fetchArticles = async () => {
      try {
        const response = await apiConfig.get(
          `/knowledgebase/?search=${ticket?.title}`
        );
        const articles = response.data;
        setArticles(articles);
      } catch (error) {
        console.error("Error fetching ticket details or users:", error);
      }
    };

    fetchTicketDetails();
    fetchArticles();
  }, [navigate, ticket?.title, ticketId]);

  // Function to handle Ticket editing.
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

  // Function to handle Status changes.
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

  // Function to handle changing Priority.
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

  // Function handles Ticket delete.
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Ticket #${ticket?.id} (${ticket?.title})?`
    );
    if (!confirmDelete) {
      return;
    }

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

  // This function sets the ticket to Status "Resolved".
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

  // Function to handle submiting a new comment.
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

  const handleArticleClick = (article_id: number) => {
    navigate(`/knowledgebase/${article_id}`);
  };

  // Function to handle converting the Ticket to CSV.
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
      `"${description.replace(/"/g, '""')}"`,
    ].join(",");

    csvRows.push(row);

    return csvRows.join("\n");
  };

  // Handles ticket export to CSV.
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

  // Handles Ticket printing.
  const handlePrintTicket = (ticket: Ticket, createdBy: string) => {
    const printContent = `
      <div>
        <h1>${ticket.title}</h1>
        <p>Status: ${ticket.status}</p>
        <p>Priority: ${ticket.priority}</p>
        <p>Date Created: ${new Date(ticket.date_created).toLocaleString()}</p>
        <p>Created By: ${createdBy}</p>
        <p>Description: ${ticket.description}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket #${ticket.id} (${ticket.title})</title>
          </head>
          <body onload="window.print()">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div>
      {/* Above Ticket Display (This Section Always Shown) */}
      <div>
        <button onClick={handleBackToTickets}>Back to Tickets</button>
      </div>

      {/* Ticket */}
      {ticket ? (
        <div>
          {/* Ticket Edit Mode View */}
          {editMode && userRole === "admin" ? (
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
              {/* Main  Ticket View */}
              <h1>{ticket.title}</h1>

              {/* Ticket: Status Section */}
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

              {/* Ticket: Priority Section */}
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

              {/* Ticket: Details Section */}
              <p>
                Date Created: {new Date(ticket.date_created).toLocaleString()}
              </p>
              <p>Created By: {createdBy}</p>

              {/* Ticket: Body (Description) Section */}
              <p>{ticket.description}</p>

              {/* Ticket: Admin Functions Section */}
              {userRole === "admin" && (
                <div>
                  <button onClick={() => setEditMode(true)}>Edit Ticket</button>
                  <button onClick={handleDelete}>Delete Ticket</button>
                </div>
              )}

              {/* Ticket: Users Functions Section */}
              <button onClick={() => handleResolveTicket()}>
                Resolve Ticket
              </button>
              <button onClick={() => handleExportCSV(ticket, createdBy)}>
                Export to CSV
              </button>
              <button onClick={() => handlePrintTicket(ticket, createdBy)}>
                Print Ticket
              </button>

              {/* Main Articles View */}
              <div>
                {articles && articles.length > 0 ? (
                  <>
                    <p>Related knowledgebase articles:</p>
                    {articles.map((article) => (
                      <button
                        key={article.article_id}
                        onClick={() =>
                          handleArticleClick(article.article_id ?? 0)
                        } // Provide a default value of 0 or handle undefined cases
                      >
                        <p>{article.title}</p>
                      </button>
                    ))}
                  </>
                ) : (
                  ""
                )}
                <Link to="/knowledgebase">Explore Knowledgebase</Link>
              </div>

              {/* Main Comment View */}
              <div>
                <h2>Comments</h2>

                {/* Comments: Write Comment Section*/}
                <div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment"
                  />
                  <button onClick={handleCommentSubmit}>Send</button>
                </div>

                <div>
                  {/* Comments*/}
                  {Array.isArray(comments) && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id}>
                        <div>
                          {/* Commentor: Profile Picture*/}
                          <img
                            src={
                              "http://localhost:3000/" + comment.profile_picture
                            }
                            alt="Profile"
                            width="20"
                          />

                          {/* Commentor: Profile Details*/}
                          <p>
                            <strong>{comment.username}</strong>{" "}
                            {new Date(comment.date_created).toLocaleString()}
                          </p>
                        </div>

                        {/* Comment: Content*/}
                        <p>{comment.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading ticket details...</p>
      )}
    </div>
  );
};

export default TicketDetails;
