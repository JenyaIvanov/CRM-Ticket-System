import React, { useEffect, useState } from "react";
import apiConfig from "../api/apiConfig";
import Modal from "react-modal";
import JWT from "expo-jwt";
import { useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import { UserWithTicketCount } from "../interfaces/User";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithTicketCount[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserWithTicketCount | null>(
    null
  );
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

  const handleFilterChange = (filter: string) => {
    setUsersFilter(filter);

    if (orderFilter === "DESC") setOrderFilter("ASC");
    else setOrderFilter("DESC");
  };

  const handleUpdateProfile = async () => {
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
            <h2>User Details</h2>

            {/* User: Profile Pictrue */}
            <p>Profile Picture</p>
            <img
              src={"http://localhost:3000/" + selectedUser.profile_picture}
              alt="Profile"
              width="100"
              height="100"
            />
            <button onClick={handleResetProfilePicture}>
              Reset Picture To Default
            </button>

            {/* User: Profile Details */}
            <p>Username: {selectedUser.username}</p>
            <p>Email: {selectedUser.email}</p>

            {/* User: Change Role */}
            <p>
              Role:
              <select value={newRole} onChange={handleRoleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </p>

            {/* User: Submit Changes Role */}
            <button onClick={handleUpdateProfile}>Update Profile</button>
            <button onClick={closeModal}>Close</button>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
