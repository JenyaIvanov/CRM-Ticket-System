import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JWT from "expo-jwt";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const TOKEN_KEY = process.env.REACT_APP_JWT;
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken || jwtToken === undefined) {
      navigate("/login");
    }

    try {
      const decodedToken = JWT.decode(jwtToken!, TOKEN_KEY!);
    } catch (err) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("username");
      navigate("/login");
    }
  }, [navigate]);

  const username = localStorage.getItem("username");

  return (
    <div>
      <h1>Welcome {username} to the system!</h1>
    </div>
  );
};

export default WelcomePage;
