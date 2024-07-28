import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

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
      </ul>
    </div>
  );
};

export default Navbar;
