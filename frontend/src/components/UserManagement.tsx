import React, { useEffect, useState } from "react";
import apiConfig from "../api/apiConfig";
import Modal from "react-modal";
import JWT from "expo-jwt";
import { useNavigate } from "react-router-dom";
import { DecodedToken } from "../interfaces/DecodedToken";
import { User } from "../interfaces/User";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
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
        const response = await apiConfig.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [navigate]);

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

  const handleDeleteUser = async (userId: number, username: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete User ${userId} (${username})?`
      )
    ) {
      try {
        await apiConfig.delete(`/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      {users.map((user) => (
        <div key={user.id} className="user-card">
          <img
            src={"http://localhost:3000/" + user.profile_picture}
            alt="Profile"
            width="50"
            height="50"
          />
          <span>
            {user.username} - {user.email} - {user.role}
          </span>
          <button onClick={() => openModal(user.id)}>View Details</button>
          <button onClick={() => handleDeleteUser(user.id, user.username)}>
            Delete User
          </button>
        </div>
      ))}

      {selectedUser && (
        <Modal
          isOpen={modalIsOpen}
          ariaHideApp={false}
          onRequestClose={closeModal}
        >
          <h2>User Details</h2>
          <img
            src={"http://localhost:3000/" + selectedUser.profile_picture}
            alt="Profile"
            width="100"
            height="100"
          />
          <p>Username: {selectedUser.username}</p>
          <p>Email: {selectedUser.email}</p>
          <p>
            Role:
            <select value={newRole} onChange={handleRoleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </p>
          <button onClick={handleResetProfilePicture}>Reset To Default</button>
          <button onClick={handleUpdateProfile}>Update Profile</button>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
