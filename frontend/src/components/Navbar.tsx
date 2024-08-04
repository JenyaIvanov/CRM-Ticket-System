import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import JWT from "expo-jwt";

import { RxDashboard } from "react-icons/rx";
import { IoTicketOutline, IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { MdManageAccounts } from "react-icons/md";
import { LiaBookSolid } from "react-icons/lia";
import { GiAtomicSlashes } from "react-icons/gi";

const Navbar: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [username, setCurrentUsername] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    console.log(location);

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
        setCurrentUsername(decoded.username);
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
    <div className="fixed font-extralight font-poppins text-xl w-fit min-w-[10%] max-w-[11%] h-full p-2 bg-gradient-to-br from-neutral-50 to-slate-100 flex flex-col text-gray-500 ">
      <div className="m-2">
        <div className="">
          <div className="bg-gradient-to-br from-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm font-sans font-bold text-xl mb-3 items-center flex justify-center gap-2 ms-[-1.5rem]">
            <GiAtomicSlashes className="mt-[0.1rem] text-2xl text-cyan-500" />
            <p>ResolveX</p>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div>
              <Link
                to="/profile"
                className={location.pathname === "/profile" ? "active" : ""}
              >
                <IoSettingsOutline className="text-2xl hover:text-cyan-500 hover:scale-[115%]" />
              </Link>
            </div>

            <div className="">
              <img
                src={"http://localhost:3000/" + profilePicture}
                className="rounded-full h-[4rem] shadow-md"
                alt="Profile"
              />
            </div>

            <div className="">
              <button
                onClick={handleLogout}
                className="text-2xl hover:text-cyan-500 hover:scale-[115%]"
              >
                <TbLogout2 className="text-2xl mt-[0.35rem]" />
              </button>
            </div>
          </div>
          <div className="text-center text-sm mt-[0.5rem] font-sans font-thin ">
            <p className="scale-105">{username}</p>
          </div>
          <hr className="mt-3" />
        </div>

        <div
          className={
            location.pathname === "/dashboard"
              ? "flex flex-row gap-2 items-center mt-[18vh] bg-gradient-to-r text-white from-indigo-400 to-cyan-400 px-[0.6rem] py-[0.5rem] rounded-md shadow-md transition duration-500"
              : "flex flex-row gap-2 items-center mt-[18vh] hover:scale-[110%]"
          }
        >
          <RxDashboard />
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <hr className="my-7" />

        <div
          className={
            location.pathname.includes("/tickets")
              ? "flex flex-row gap-2 items-center text-white  px-[0.6rem] bg-gradient-to-br from-amber-500 to-orange-400 py-[0.5rem] rounded-md shadow-md transition duration-500"
              : "flex flex-row gap-2 items-center hover:scale-[110%]"
          }
        >
          <IoTicketOutline />
          <Link to="/tickets">Tickets</Link>
        </div>

        <hr className="my-7" />

        <div
          className={
            location.pathname.includes("/knowledgebase")
              ? "flex flex-row gap-2 items-center text-white bg-gradient-to-br from-emerald-500 to-teal-400 px-[0.6rem] py-[0.5rem] rounded-md shadow-md transition duration-500"
              : "flex flex-row gap-2 items-center hover:scale-[110%]"
          }
        >
          <LiaBookSolid />
          <Link to="/knowledgebase">Knowledge</Link>
        </div>

        <div className="">
          {currentUserRole === "admin" ? (
            <>
              <hr className="my-7" />
              <div
                className={
                  location.pathname === "/user-management"
                    ? "flex flex-row gap-2 items-center text-white bg-gradient-to-br from-rose-500 to-cyan-400 px-[0.6rem] py-[0.5rem] rounded-md shadow-md transition duration-500"
                    : "flex flex-row gap-2 items-center hover:scale-[110%]"
                }
              >
                <MdManageAccounts className="text-2xl" />
                <Link to="/user-management">Management</Link>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
