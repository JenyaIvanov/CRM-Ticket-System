import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import JWT from "expo-jwt";

const Navbar: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
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
        setCurrentUserRole(decoded.role);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "200px",
        position: "fixed",
        height: "100%",
        backgroundColor: "#f0f0f0",
      }}
    >
      <ul>
        <li>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/tickets"
            className={location.pathname.includes("/tickets") ? "active" : ""}
          >
            Tickets
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
          >
            Profile
          </Link>
        </li>

        {currentUserRole === "admin" ? (
          <li>
            <Link
              to="/user-management"
              className={
                location.pathname === "/user-management" ? "active" : ""
              }
            >
              User Management
            </Link>
          </li>
        ) : (
          ""
        )}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;
