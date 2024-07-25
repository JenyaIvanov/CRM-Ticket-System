import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";

interface Ticket {
  id: string;
  title: string;
  status: string;
  assigned_to: string;
  date_created: string;
}

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiConfig.get("/tickets");

        //console.log(response.data);

        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate("/create-ticket");
  };

  return (
    <div>
      <h1>All Tickets</h1>
      <button onClick={handleCreateTicket}>Create New Ticket</button>
      <div>
        {tickets.map((ticket) => (
          <button key={ticket.id} onClick={() => handleTicketClick(ticket.id)}>
            <h2>{ticket.title}</h2>
            <p>Status: {ticket.status}</p>
            <p>Assigned To: {ticket.assigned_to}</p>
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
