import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import apiConfig from "../api/apiConfig";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components for ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [inProgressTickets, setInProgressTickets] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalUrgentTickets, setTotalUrgentTickets] = useState(0);
  const [openedTicketsData, setOpenedTicketsData] = useState<
    { date: string; count: number }[]
  >([]);
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
        fetchUserInfo(decoded.userId); // Pass the decoded userId directly
        fetchStatistics();
        fetchOpenedTicketsData();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

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

  // Function to handle fetching Ticket and System statistics from the backend.
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

  // Function to fetch data for the graph
  const fetchOpenedTicketsData = async () => {
    try {
      const response = await apiConfig.get("/statistics/tickets/opened");
      setOpenedTicketsData(response.data.results);
    } catch (error) {
      console.error("Error fetching opened tickets data:", error);
    }
  };

  // Prepare data for the graph
  const chartData = {
    labels: openedTicketsData.map((data) => data.date.split("T")[0]).reverse(),
    datasets: [
      {
        label: "Opened Tickets",
        data: openedTicketsData.map((data) => data.count).reverse(),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return (
    <div className="flex flex-col">
      <div></div>
      <div className=" flex flex-col justify-center m-[5%] px-[12rem]  rounded-xl w-[70%] ms-[15%]">
        <p className="font-bold mt-12">Tickets Overview</p>
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2 bg-slate-100 w-fit px-6 py-4 rounded-lg shadow-md">
            <p className="text-4xl font-poppins font-bold text-slate-700 me-2">
              {openTickets + inProgressTickets}
            </p>
            <p className="text-sm font-light">Open Tickets</p>
          </div>

          <div className="flex flex-row gap-2 bg-green-100 w-fit px-6 py-4 rounded-lg shadow-md">
            <p className="text-4xl font-poppins font-bold text-slate-700 me-2">
              {openTickets}
            </p>
            <p className="text-sm font-light">New Tickets</p>
          </div>

          <div className="flex flex-row gap-2 bg-orange-100 w-fit px-6 py-4 rounded-lg shadow-md">
            <p className="text-4xl font-poppins font-bold text-slate-700 me-2">
              {inProgressTickets}
            </p>
            <p className="text-sm font-light">In Progress</p>
          </div>

          <div className="flex flex-row gap-2 bg-red-100 w-fit px-6 py-4 rounded-lg shadow-md">
            <p className="text-4xl font-poppins font-bold text-slate-700 me-2">
              {totalUrgentTickets}
            </p>
            <p className="text-sm font-light">Urgent Tickets</p>
          </div>

          <div className="flex flex-row gap-2 bg-slate-100 w-fit px-6 py-4 rounded-lg shadow-md">
            <p className="text-4xl font-poppins font-bold text-slate-700 me-2">
              {totalTickets}
            </p>
            <p className="text-sm font-light">Total Tickets</p>
          </div>
        </div>
        <div className="mt-6 p-6 border-2 rounded-xl border-cyan-400">
          <Line data={chartData} />
        </div>
        <div className="bg-blue-400 w-fit p-2 px-3 text-white font-thin rounded-xl mt-3">
          <button onClick={handleViewTickets}>View All Tickets</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
