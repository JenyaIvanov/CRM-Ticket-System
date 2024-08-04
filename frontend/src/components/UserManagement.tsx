import React, { useEffect, useState } from "react";
import apiConfig from "../api/apiConfig";
import Modal from "react-modal";
import JWT from "expo-jwt";
import { useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import { TicketWithCommentsCount } from "../interfaces/Ticket";
import { UserWithTicketCount, UserWithTickets } from "../interfaces/User";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FaRegUser, FaComments } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { SiAuth0 } from "react-icons/si";
import { TiTicket } from "react-icons/ti";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithTicketCount[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserWithTickets | null>(
    null
  );
  const [selectedUserTickets, setSelectedUserTickets] = useState<
    TicketWithCommentsCount[]
  >([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [usersFilter, setUsersFilter] = useState<string>("username");
  const [orderFilter, setOrderFilter] = useState<string>("ASC");
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
        // Token has expired
        localStorage.removeItem("jwt");
        navigate("/login");
      } else if (decoded.role !== "admin") {
        navigate("/tickets");
      } else {
        // Token is valid
        setCurrentUserRole(decoded.role);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    const fetchUsers = async () => {
      try {
        const response = await apiConfig.get(
          `/users?field=${usersFilter}&order=${orderFilter}`
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [navigate, orderFilter, usersFilter]);

  const openModal = async (userId: number) => {
    try {
      const response = await apiConfig.get(`/users/${userId}`);
      setSelectedUser(response.data);
      setSelectedUserTickets(response.data.tickets);
      setNewRole(response.data.role);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRole(event.target.value);
  };

  const handleResetProfilePicture = async () => {
    const confirmAction = window.confirm(
      `Are you sure you want to reset ${selectedUser?.username} profile picture to default?`
    );
    if (!confirmAction) {
      return;
    }

    if (selectedUser && currentUserRole) {
      try {
        await apiConfig.put(`/user-management/users/${selectedUser.id}`, {
          profile_picture: "user-data/images/default-profile.png",
        });
        setSelectedUser({
          ...selectedUser,
          profile_picture: "user-data/images/default-profile.png",
        });
      } catch (error) {
        console.error("Error resetting profile picture:", error);
      }
    }
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleFilterChange = (filter: string) => {
    setUsersFilter(filter);

    if (orderFilter === "DESC") setOrderFilter("ASC");
    else setOrderFilter("DESC");
  };

  const handleUpdateProfile = async () => {
    const confirmAction = window.confirm(
      `Are you sure you want to update ${selectedUser?.username} profile?`
    );
    if (!confirmAction) {
      return;
    }

    if (selectedUser && currentUserRole) {
      try {
        await apiConfig.put(`/user-management/users/${selectedUser.id}`, {
          role: newRole,
        });
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, role: newRole } : user
          )
        );
        closeModal();
      } catch (error) {
        console.error("Error updating user profile:", error);
      }
    }
  };

  return (
    <div className="flex">
      <div className="bg-gradient-to-br from-slate-100 to-neutral-100 w-[90%] shadow-lg border p-12 rounded-xl mt-2 ms-1">
        {/* User Management View */}
        <h1 className="text-2xl  font-poppins text-slate-700 drop-shadow-sm">
          User Management
        </h1>
        <p className="text-slate-500">Select any user to edit their details.</p>
        <p className="mb-5 text-slate-500">
          Click on the column headers below to sort the list in either ascending
          or descending order.
        </p>

        {/* Users List */}
        <div className="font-thin text-slate-600 text-lg grid grid-cols-5 border rounded-xl p-4 bg-slate-200 shadow mb-1">
          <p>Profile Image</p>
          <p
            className={
              usersFilter === "role"
                ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
                : "flex flex-row items-center gap-1 hover:cursor-pointer"
            }
            onClick={() => handleFilterChange("role")}
          >
            Role
            {usersFilter === "role" && orderFilter === "DESC" ? (
              <RiArrowDownSFill className="text-2xl" />
            ) : (
              ""
            )}
            {usersFilter === "role" && orderFilter === "ASC" ? (
              <RiArrowUpSFill className="text-2xl" />
            ) : (
              ""
            )}
          </p>
          <p
            className={
              usersFilter === "username"
                ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
                : "flex flex-row items-center gap-1 hover:cursor-pointer"
            }
            onClick={() => handleFilterChange("username")}
          >
            Username
            {usersFilter === "username" && orderFilter === "DESC" ? (
              <RiArrowDownSFill className="text-2xl" />
            ) : (
              ""
            )}
            {usersFilter === "username" && orderFilter === "ASC" ? (
              <RiArrowUpSFill className="text-2xl" />
            ) : (
              ""
            )}
          </p>
          <p
            className={
              usersFilter === "email"
                ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
                : "flex flex-row items-center gap-1 hover:cursor-pointer"
            }
            onClick={() => handleFilterChange("email")}
          >
            Email
            {usersFilter === "email" && orderFilter === "DESC" ? (
              <RiArrowDownSFill className="text-2xl" />
            ) : (
              ""
            )}
            {usersFilter === "email" && orderFilter === "ASC" ? (
              <RiArrowUpSFill className="text-2xl" />
            ) : (
              ""
            )}
          </p>
          <p
            className={
              usersFilter === "tickets_count"
                ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
                : "flex flex-row items-center gap-1 hover:cursor-pointer"
            }
            onClick={() => handleFilterChange("tickets_count")}
          >
            Tickets
            {usersFilter === "tickets_count" && orderFilter === "DESC" ? (
              <RiArrowDownSFill className="text-2xl" />
            ) : (
              ""
            )}
            {usersFilter === "tickets_count" && orderFilter === "ASC" ? (
              <RiArrowUpSFill className="text-2xl" />
            ) : (
              ""
            )}
          </p>
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-5 items-center font-poppins border rounded-xl p-2 bg-neutral-50 hover:scale-105 hover:bg-slate-400 transition duration-300 mb-1 shadow-sm"
            onClick={() => openModal(user.id)}
          >
            {/* User */}

            <img
              src={"http://localhost:3000/" + user.profile_picture}
              alt="Profile"
              className=" object-contain rounded-full"
              width="50"
              height="50"
            />

            <div
              className={
                user.role === "admin"
                  ? "text-white bg-gradient-to-br from-rose-500 to-cyan-400 w-fit px-[0.6rem] py-[0.4rem] rounded-md shadow-sm"
                  : "text-white bg-gradient-to-br from-teal-500 to-emerald-400 w-fit px-[1rem] py-[0.4rem] rounded-md shadow-sm"
              }
            >
              {user.role}
            </div>

            <div>{user.username}</div>

            <div>{user.email}</div>

            <div>{user.tickets_count}</div>

            {/* <button
              className="bg-gradient-to-b from-gray-800 to-gray-600 text-white px-[0.8rem] py-[0.2rem] rounded-xl"
              onClick={() => openModal(user.id)}
            >
              {" "}
              Details
            </button> */}
          </div>
        ))}

        {/* User Edit Modal */}
        {selectedUser && (
          <Modal
            isOpen={modalIsOpen}
            ariaHideApp={false}
            onRequestClose={closeModal}
          >
            <div className="flex justify-center flex-col items-center">
              <h2 className="font-poppins text-2xl mb-1">User Details</h2>

              {/* User: Profile Pictrue */}
              <p className="font-thin text-sm">Profile Picture</p>
              <img
                src={"http://localhost:3000/" + selectedUser.profile_picture}
                alt="Profile"
                width="100"
                height="100"
                className="rounded-full shadow m-2"
              />
              <button
                className="px-3 py-2 rounded-lg bg-slate-500 text-white hover:scale-105 transition duration-300"
                onClick={handleResetProfilePicture}
              >
                Reset Picture To Default
              </button>

              <div className="grid-rows-3 m-2 p-2">
                {/* User: Profile Details */}
                <div className="flex flex-row items-center gap-2">
                  <FaRegUser className="text-xl" />
                  <p className="border p-2 rounded-xl mb-1 w-auto">
                    Username: {selectedUser.username}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <MdOutlineMail className="text-xl" />
                  <p className="border p-2 rounded-xl mb-1">
                    Email: {selectedUser.email}
                  </p>
                </div>

                <div className="flex flex-row items-center gap-2 mb-1">
                  <SiAuth0 className="text-xl" />
                  {/* User: Change Role */}
                  <p className="border p-2 rounded-xl">
                    Role:
                    <select value={newRole} onChange={handleRoleChange}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </p>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <TiTicket className="text-xl" />
                  <p className="border p-2 rounded-xl mb-1">
                    Tickets Crteated: {selectedUser.tickets_count}
                  </p>
                </div>
              </div>

              <div className="flex flex-row gap-2">
                {/* User: Submit Changes Role */}
                <button
                  className="text-white font-poppins px-[1rem] py-[0.4rem] shadow border hover:scale-105 rounded-lg bg-gradient-to-r from-emerald-500 to-lime-600 transition duration-300"
                  onClick={handleUpdateProfile}
                >
                  Update
                </button>
                <button
                  className="text-white font-poppins px-[1rem] py-[0.4rem] shadow border hover:scale-105 rounded-lg bg-gradient-to-r from-rose-400 to-red-500 transition duration-300"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>

            {/* User: Tickets View */}
            <p className="font-thin text-xl mt-4 mb-2">
              Tickets created by {selectedUser.username}:
            </p>
            <div className="flex flex-row gap-2">
              {selectedUserTickets && (
                <>
                  {selectedUserTickets.map((ticket) => (
                    <div
                      className="px-6 py-3 flex flex-col transition duration-500 hover:scale-105 hover:cursor-pointer rounded-xl w-[17rem] bg-gradient-to-br text-white border shadow from-gray-700 to-cyan-600"
                      onClick={() => handleTicketClick(ticket.id)}
                      key={ticket.id}
                    >
                      <div className="flex flex-row items-center gap-2 mb-1 justify-between">
                        <p className=" font-poppins text-lg font-bold">
                          {ticket.title}
                        </p>
                        <div className="w-fit">
                          {ticket.priority === "Urgent" ? (
                            <p className="px-[0.65rem] py-[0.3rem] rounded-xl text-sm text-white bg-gradient-to-r from-red-500 to-orange-500">
                              Urgent
                            </p>
                          ) : (
                            ""
                          )}
                          {ticket.priority === "High" ? (
                            <p className="px-[0.65rem] py-[0.25rem] rounded-xl text-sm text-white bg-gradient-to-r from-indigo-500 to-blue-500">
                              High
                            </p>
                          ) : (
                            ""
                          )}
                          {ticket.priority === "Medium" ? (
                            <p className="px-[0.65rem] py-[0.25rem] rounded-xl text-sm text-white bg-gradient-to-r from-fuchsia-600 to-purple-600">
                              Medium
                            </p>
                          ) : (
                            ""
                          )}
                          {ticket.priority === "Low" ? (
                            <p className="px-[0.65rem] py-[0.25rem] rounded-xl text-sm text-white bg-gradient-to-r from-emerald-500 to-lime-600">
                              Low
                            </p>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <p className="font-thin text-sm my-1">
                        Date Created:{" "}
                        {new Date(ticket.date_created).toLocaleDateString()}
                      </p>
                      <p className="font-poppins">Status: {ticket.status}</p>
                      <div className="flex justify-end items-center gap-1">
                        <FaComments />
                        <p className="font-thin">{ticket.comments_count}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
