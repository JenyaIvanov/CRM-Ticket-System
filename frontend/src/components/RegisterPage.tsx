// RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async () => {
    try {
      await apiConfig.post("/users", {
        username,
        email,
        password,
        role: "user",
      });
      // Assuming successful registration redirects to /login
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      // Handle error display or notification
    }
  };

  return (
    <div className="font-poppins bg-gradient-to-r from-indigo-500 to-cyan-400 p-2 rounded-md mt-2 py-8 text-center">
      <p className="text-[4rem] font-bold mb-6 text-white">CRM Ticket System</p>
      <form
        className="flex font-thin flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <div>
          <p className=" text-white">Username</p>
          <input
            className="m-1 border rounded-xl border-cyan-700 p-[0.3rem]"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <p className="text-white">Password</p>
          <input
            className="m-1 border rounded-xl border-cyan-700 p-[0.3rem]"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <p className="text-white">Email</p>
          <input
            className="m-1 border rounded-xl border-cyan-700 p-[0.3rem]"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          {" "}
          <button
            className=" bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl hover:scale-110 shadow-md py-[0.3rem] m-2 px-[1rem] text-white"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
      <p className="text-white mt-2">
        Already have an account?{" "}
        <a className="font-bold hover:text-yellow-300" href="/login">
          Login
        </a>
      </p>
    </div>
  );
};

export default RegisterPage;
