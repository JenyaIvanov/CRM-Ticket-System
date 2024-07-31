import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import { RxDashboard } from "react-icons/rx";
import { IoTicketOutline, IoSettingsOutline } from "react-icons/io5";

import { TbLogout2 } from "react-icons/tb";
import { MdManageAccounts } from "react-icons/md";
import { LiaBookSolid } from "react-icons/lia";
import JWT from "expo-jwt";

const Navbar: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
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
        setProfilePicture(decoded.profile_picture);
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
    <div className="fixed font-extralight font-poppins text-xl h-full p-2 bg-gradient-to-br from-cyan-500 to-90% to-purple-700 flex flex-col justify-between text-white ">
      <div className="m-4">
        <div className="flex flex-row gap-2 items-center mt-[25vh]">
          <RxDashboard />
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </Link>
        </div>

        <hr className="my-7 opacity-[45%]" />

        <div className="flex flex-row gap-2 items-center">
          <IoTicketOutline />
          <Link
            to="/tickets"
            className={location.pathname.includes("/tickets") ? "active" : ""}
          >
            Tickets
          </Link>
        </div>

        <hr className="my-7 opacity-[45%]" />

        <div className="flex flex-row gap-2 items-center">
          <LiaBookSolid />
          <Link
            to="/knowledgebase"
            className={location.pathname === "/knowledgebase" ? "active" : ""}
          >
            Knowledge
          </Link>
        </div>
      </div>
      <div className="m-4">
        <div className="">
          {currentUserRole === "admin" ? (
            <>
              <Link
                to="/user-management"
                className={
                  location.pathname === "/user-management"
                    ? "active flex flex-row gap-2 items-center"
                    : "flex flex-row gap-2 items-center"
                }
              >
                <MdManageAccounts className="text-2xl" />
                Management
              </Link>
            </>
          ) : (
            ""
          )}
        </div>

        <hr className="mt-8 mb-4 red opacity-[45%]" />

        <div className="flex flex-row justify-between items-center">
          <div>
            <Link
              to="/profile"
              className={location.pathname === "/profile" ? "active" : ""}
            >
              <IoSettingsOutline className="text-2xl hover:text-yellow-400" />
            </Link>
          </div>

          <div className="">
            <img
              src={"http://localhost:3000/" + profilePicture}
              className="rounded-full h-[4rem]"
              alt="Profile"
            />
          </div>

          <div className="">
            <button onClick={handleLogout} className="hover:text-yellow-400">
              <TbLogout2 className="text-2xl mt-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
