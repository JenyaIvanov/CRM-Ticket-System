import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import { TicketWithCommentsCount } from "../interfaces/Ticket";
import { FaPlusCircle } from "react-icons/fa";
import {
  MdOutlineComment,
  MdOutlineModeComment,
  MdSearch,
} from "react-icons/md";
import { TiTicket } from "react-icons/ti";

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithCommentsCount[]>([]);
  const [users, setUsers] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<string>("Open,In Progress"); // Default filter
  const [orderFilter, setOrderFilter] = useState<string>("DESC");
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
            response.data.flatMap((ticket: TicketWithCommentsCount) => [
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
    <div className="flex flex-col ms-5">
      {/* Articles */}
      <h1 className="text-slate-600 text-2xl font-poppins font-bold mb-3 mt-5">
        Tickets
      </h1>

      <div className="mt-1 mb-4 w-11/12 font-thin text-slate-500">
        <p className=" mb-1">
          View and manage all tickets in the system. This page displays a list
          of all submitted tickets, allowing you to track, filter, and review
          them based on their status, priority, and other details.
        </p>

        <p className="">
          Click on the column headers below to sort the list in either ascending
          or descending order.
        </p>
      </div>

      <div className="flex flex-row justify-between items-center w-11/12">
        <div className="text-white text-lg font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-orange-500 to-yellow-500 rounded-md shadow w-fit hover:shadow-lg hover:scale-[104%] transition duration-100">
          {/* Create A New Article */}
          <FaPlusCircle className="text-xl" />
          <button onClick={handleCreateTicket}>New Ticket</button>
        </div>
      </div>

      <div className="w-11/12 flex flex-col rounded-lg border shadow-sm p-3 mt-3">
        {/* Filters & Search */}
        <div className="flex flex-col">
          {/* Search Box */}
          <div className="items-center flex flex-row w-full gap-0 my-2 bg-neutral-100 shadow rounded-lg bg-opacity-30 p-2">
            <MdSearch className="text-xl" />
            <input
              className="w-full h-fit focus:border-0 p-1 focus:outline-none bg-opacity-0 text-slate-800 rounded-lg placeholder-slate-600"
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="w-full flex flex-row gap-4 items-center my-2">
            <button
              className={
                filter === "Open,In Progress"
                  ? "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 shadow-md border-2 font-bold border-emerald-400 rounded-lg"
                  : "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 transition duration-150 hover:scale-110 shadow-sm border rounded-lg"
              }
              onClick={() => setFilter("Open,In Progress")}
            >
              Open Tickets
            </button>
            <button
              className={
                filter === "Resolved"
                  ? "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 shadow-md border-2 font-bold border-cyan-400 rounded-lg"
                  : "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 transition duration-150 hover:scale-110 shadow-sm border rounded-lg"
              }
              onClick={() => setFilter("Resolved")}
            >
              Resolved Tickets
            </button>
            <button
              className={
                filter === "Closed"
                  ? "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 shadow-md border-2 font-bold border-slate-400 rounded-lg"
                  : "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 transition duration-150 hover:scale-110 shadow-sm border rounded-lg"
              }
              onClick={() => setFilter("Closed")}
            >
              Closed Tickets
            </button>
            <button
              className={
                filter === "Open,In Progress,Resolved,Closed"
                  ? "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 shadow-md border-2 font-bold border-rose-400 rounded-lg"
                  : "px-[0.6rem] font-poppins text-slate-600 py-[0.3rem] bg-gradient-to-br from-white to-neutral-100 transition duration-150 hover:scale-110 shadow-sm border rounded-lg"
              }
              onClick={() => setFilter("Open,In Progress,Resolved,Closed")}
            >
              All Tickets
            </button>
          </div>
        </div>

        <div className="sticky z-10 top-[3rem] grid grid-cols-7 px-[0.9rem] py-[0.6rem] font-poppins rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500 text-white w-full items-center border">
          <p>Title</p>
          <p>Description</p>
          <p>Status</p>
          <p>Created By</p>
          <p>Date Created</p>
          <p>Comments</p>
          <p className="ms-2">Priority</p>
        </div>

        {/* Query Tickets From Database */}
        <div className="w-full">
          {tickets.map((ticket) => (
            <div
              className="grid grid-cols-7 font-thin px-[0.5rem] py-[0.5rem] rounded-lg mb-[0.35rem] bg-white w-full items-center border shadow hover:cursor-pointer hover:bg-neutral-200 hover:scale-[103%] transition duration-300"
              key={ticket.id}
              onClick={() => handleTicketClick(ticket.id)}
            >
              <p className="flex flex-row items-center gap-2">
                <TiTicket />
                {ticket.title}
              </p>
              <p className="text-sm font-thin">
                {ticket.description.substring(0, 30) + "..."}
              </p>
              <p className="">{ticket.status}</p>
              <p className="">{users[ticket.created_by]}</p>
              <p className="ms-[1vh]">
                {new Date(ticket.date_created).toLocaleDateString()}
              </p>
              <p className="flex flex-row items-center gap-2 ms-[2.3vh]">
                <MdOutlineModeComment className="text-sm" />
                {ticket.comments_count}
              </p>
              <p className="flex flex-row items-center -ms-1">
                {ticket.priority === "Urgent" ? (
                  <div className="p-3 bg-amber-300 rounded-full scale-50 animate-pulse duration-1000 transition"></div>
                ) : (
                  ""
                )}

                {ticket.priority === "High" ? (
                  <div className="p-3 bg-rose-300 rounded-full scale-50 animate-pulse duration-1000 transition"></div>
                ) : (
                  ""
                )}

                {ticket.priority === "Medium" ? (
                  <div className="p-3 bg-cyan-300 rounded-full scale-50 "></div>
                ) : (
                  ""
                )}

                {ticket.priority === "Low" ? (
                  <div className="p-3 bg-emerald-300 rounded-full scale-50"></div>
                ) : (
                  ""
                )}

                {ticket.priority}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
