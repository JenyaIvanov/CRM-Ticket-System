import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { FaRegUser } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await apiConfig.post("/users/login", {
        username,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("jwt", token); // Store the JWT token in localStorage
        navigate("/dashboard");
      } else {
        setError("Invalid Username or Password");
      }
    } catch (error) {
      setError("Invalid Username or Password");
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="font-poppins bg-gradient-to-r from-indigo-500 to-cyan-400 p-2 rounded-md mt-2 py-8 text-center">
      <p className="text-[4rem] font-bold mb-6 text-white">CRM Ticket System</p>
      <div className="flex flex-col">
        <form className="flex font-thin flex-col gap-1" onSubmit={handleLogin}>
          <div className="items-center">
            <p className=" text-white">Username</p>
            <input
              className="m-1 border rounded-xl border-cyan-700 p-[0.3rem]"
              type="text"
              value={username}
              name="username"
              autoComplete="on"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <p className="text-white">Password</p>
            <input
              className="m-1 border rounded-xl border-cyan-700 p-[0.3rem]"
              type="password"
              value={password}
              name="password"
              autoComplete="on"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            {/* Display error */}
            {error && <p className="text-red-300">{error}</p>}{" "}
          </div>

          <div className="">
            <button
              className=" bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl hover:scale-110 shadow-md py-[0.3rem] m-2 px-[1.5rem] text-white"
              type="submit"
            >
              Login
            </button>
            <button
              className=" bg-gradient-to-r from-orange-400 to-rose-400 rounded-xl hover:scale-110 shadow-md py-[0.3rem] m-2 px-[1rem] text-white"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
