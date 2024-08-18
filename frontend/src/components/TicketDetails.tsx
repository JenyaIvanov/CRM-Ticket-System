import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Ticket } from "../interfaces/Ticket";
import { Article } from "../interfaces/Article";
import { Comment } from "../interfaces/Comment";
import JWT from "expo-jwt";
import { PiFileCsv, PiPrinter } from "react-icons/pi";
import {
  MdCreate,
  MdDeleteForever,
  MdOutlineKeyboardReturn,
} from "react-icons/md";
import { GrSend, GrStatusGood } from "react-icons/gr";
import { TbArticle } from "react-icons/tb";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaPhone } from "react-icons/fa6";

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
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  // Variables
  const MAX_LENGTH = 25;

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
        setUserProfilePicture(decoded.profile_picture);
        setUsername(decoded.username);
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
        setAuthorProfilePicture(createdByResponse.data.profile_picture);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Error fetching ticket details or users:", error);
      }
    };

    // Function to handle fetching Ticket Details.
    const fetchArticles = async () => {
      try {
        const response = await apiConfig.get(
          `/knowledgebase/?search=${ticket?.title}&field=title&order=DESC`
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
    <div className="flex flex-col ms-5 w-11/12 h-full">
      {/* Ticket */}
      {ticket ? (
        <div className="mt-3">
          {/* Ticket Edit Mode View */}
          {editMode && userRole === "admin" ? (
            <div className="w-full">
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
            <div className="w-full h-full">
              {/* Main  Ticket View */}
              <h1 className="text-3xl font-poppins w-full mb-2">
                {ticket.title}
              </h1>

              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row gap-4 items-center">
                  {/* Ticket: Status Section */}
                  <p>
                    Status:{" "}
                    <select
                      className="border shadow-sm p-1 border-gray-300 rounded-md w-fit focus:outline-orange-400"
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
                  <p className="flex flex-row items-center gap-2">
                    Priority
                    <div className="flex flex-row items-center border shadow-sm p-1 border-gray-300 rounded-md w-fit focus:outline-orange-400">
                      {priority === "Urgent" ? (
                        <div className="p-3 bg-amber-300 rounded-full scale-50 animate-pulse duration-1000 transition"></div>
                      ) : (
                        ""
                      )}

                      {priority === "High" ? (
                        <div className="p-3 bg-rose-300 rounded-full scale-50 animate-pulse duration-1000 transition"></div>
                      ) : (
                        ""
                      )}

                      {priority === "Medium" ? (
                        <div className="p-3 bg-cyan-300 rounded-full scale-50 "></div>
                      ) : (
                        ""
                      )}

                      {priority === "Low" ? (
                        <div className="p-3 bg-emerald-300 rounded-full scale-50"></div>
                      ) : (
                        ""
                      )}

                      <select
                        value={priority}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </p>
                </div>
                {/* Ticket: Functions Section */}
                <div className="flex flex-row gap-3">
                  {/* Ticket: Admin Functions Section */}
                  {userRole === "admin" && (
                    <>
                      <button
                        className="text-white text-lg border items-center gap-1 flex flex-row shadow-sm px-[0.6rem] py-[0.3rem] bg-gradient-to-br from-teal-400 to-cyan-600 hover:scale-105 transition duration-150 rounded-lg"
                        onClick={() => setEditMode(true)}
                      >
                        <MdCreate />
                        Edit Ticket
                      </button>
                      <button
                        className="text-white text-lg border items-center gap-1 flex flex-row shadow-sm px-[0.6rem] py-[0.3rem] bg-gradient-to-br from-rose-400 to-rose-600 hover:scale-105 transition duration-150 rounded-lg"
                        onClick={handleDelete}
                      >
                        <MdDeleteForever />
                        Delete Ticket
                      </button>
                    </>
                  )}
                  {/* Ticket: Users Functions Section */}
                  <button
                    className="text-white text-lg border items-center gap-1 flex flex-row shadow-sm px-[0.6rem] py-[0.3rem] bg-gradient-to-br from-teal-500 to-emerald-600 hover:scale-105 transition duration-150 rounded-lg"
                    onClick={() => handleResolveTicket()}
                  >
                    <GrStatusGood />
                    Resolve Ticket
                  </button>
                </div>
              </div>

              {/* Ticket: Body (Description) Section */}
              <div className="w-full min-h-[40vh] my-3 h-full border rounded-lg bg-slate-50">
                <div className="px-[0.3rem] py-[0.5rem] flex flex-row gap-2 items-center bg-slate-200 w-full rounded-t-lg">
                  <img
                    className="ms-1 object-contain rounded-full shadow-sm"
                    src={"http://localhost:3000/" + authorProfilePicture}
                    alt="Profile"
                    width="55"
                  />
                  <div className="flex flex-col">
                    {/* Ticket: Details Section */}

                    <p className="font-thin text-xl">{createdBy}</p>
                    <p className="font-thin text-sm">
                      Date Created:{" "}
                      {new Date(ticket.date_created).toLocaleString()}
                    </p>
                    <div className="font-thin items-center flex flex-row gap-4">
                      <p className="flex flex-row items-center gap-1">
                        Source:
                        <FaPhone className="text-xs ms-1" />
                        Phone Call
                      </p>

                      <div>
                        {/* Contant Picture Here */}
                        <p>
                          Contact:
                          <Link className="ms-1 hover:text-amber-600" to="#">
                            HyperX
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 whitespace-pre-line">
                  <p>{ticket.description}</p>
                </div>
              </div>

              {/* Ticket: Users Export Functions Section */}
              <div className="flex flex-row items-center gap-4 justify-end">
                <button
                  className="text-white text-lg border items-center gap-1 flex flex-row shadow-sm px-[0.7rem] py-[0.2em] bg-gradient-to-br from-indigo-400 to-sky-400 hover:scale-105 transition duration-150 rounded-lg"
                  onClick={() => handleExportCSV(ticket, createdBy)}
                >
                  <PiFileCsv className="text-2xl" />
                  Export to CSV
                </button>
                <button
                  className="text-white text-lg border items-center gap-1 flex flex-row shadow-sm px-[0.7rem] py-[0.2em] bg-gradient-to-br from-indigo-400 to-sky-400 hover:scale-105 transition duration-150 rounded-lg"
                  onClick={() => handlePrintTicket(ticket, createdBy)}
                >
                  <PiPrinter className="text-2xl" />
                  Print Ticket
                </button>
              </div>

              {/* Main Articles View */}
              <div className="flex flex-col w-full">
                {articles && articles.length > 0 ? (
                  <div>
                    <p className="font-thin text-lg text-slate-700">
                      Related knowledgebase articles:
                    </p>
                    <div className="flex flex-row gap-2 items-center">
                      {articles.slice(0, 4).map((article) => (
                        <div
                          className="flex flex-col w-fit border text-white text-lg font-thin px-[0.8rem] py-[0.8rem] bg-gradient-to-br from-slate-400 to-cyan-600 rounded-lg shadow-sm hover:scale-105 transition duration-200 hover:cursor-pointer"
                          key={article.article_id}
                          onClick={() =>
                            handleArticleClick(article.article_id ?? 0)
                          } // Provide a default value of 0 or handle undefined cases
                        >
                          <p className="flex flex-row gap-1 items-center font-thin text-sm">
                            <TbArticle className="" />
                            Article
                          </p>
                          <p className="font-poppins">
                            {article.title.substring(0, MAX_LENGTH)}{" "}
                            {article.title.length > MAX_LENGTH ? "..." : ""}
                          </p>
                          <p className="text-sm text-neutral-300">
                            {article.text.substring(0, MAX_LENGTH) + "..."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <Link
                  className="text-lg font-thin text-slate-500 mt-1 flex flex-row items-center gap-1 hover:text-amber-600"
                  to="/knowledgebase"
                >
                  <HiMiniMagnifyingGlass />
                  Explore Knowledgebase{">>"}
                </Link>
              </div>

              <hr className="mt-3 shadow-sm opacity-50" />

              {/* Main Comment View */}
              <div className="mt-2 flex flex-col">
                <h2 className="text-xl font-thin text-slate-600">Comments</h2>

                {/* Comments: Write Comment Section*/}
                <div className="flex flex-row gap-8">
                  <div className="flex flex-col w-2/6">
                    {/* Comments*/}
                    {Array.isArray(comments) && comments.length > 0 ? (
                      comments.map((comment) => (
                        <div className="mb-3" key={comment.id}>
                          <div className="flex flex-row gap-1">
                            {/* Commentor: Profile Picture*/}
                            <img
                              className="object-contain rounded-full"
                              src={
                                "http://localhost:3000/" +
                                comment.profile_picture
                              }
                              alt="Profile"
                              width="40"
                            />

                            <div>
                              <p className="font-thin text-lg">
                                {comment.username}
                              </p>
                              <p className="font-thin text-sm">
                                {new Date(
                                  comment.date_created
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Comment: Content*/}
                          <div className="mt-2 p-2 rounded-lg shadow-sm border whitespace-pre-line h-[10vh]">
                            <p>{comment.comment}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )}
                  </div>

                  <div className="w-2/6">
                    <div className="flex flex-row gap-1 mb-1">
                      <img
                        className="object-contain rounded-full"
                        src={"http://localhost:3000/" + userProfilePicture}
                        alt="Profile"
                        width="20"
                      />
                      <p className="font-thin text-sm text-slate-600">
                        {username}, add to this ticket
                      </p>
                    </div>
                    <textarea
                      className="w-full bg-neutral-200 p-2 rounded-lg shadow-sm "
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write something..."
                    />
                    <button
                      className="text-white text-lg border items-center gap-2 flex flex-row shadow-sm px-[0.7rem] py-[0.2em] bg-gradient-to-br from-indigo-400 to-sky-400 hover:scale-105 transition duration-150 rounded-lg"
                      onClick={handleCommentSubmit}
                    >
                      <GrSend className="text-lg" />
                      Send
                    </button>
                  </div>
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
