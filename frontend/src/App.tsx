// App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import Tickets from "./components/Tickets";
import TicketDetails from "./components/TicketDetails";
import CreateTicket from "./components/CreateTicket";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import UserManagement from "./components/UserManagement";
import KnowledgeBase from "./components/KnowledgeBase";
import CreateArticle from "./components/CreateArticle";
import ArticleDetails from "./components/ArticleDetails";
import EditCategories from "./components/EditCategories";

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="">
      {!hideNavbar && <Navbar />}
      <div
        style={{
          marginLeft: hideNavbar ? "0px" : "205px",
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:ticketId" element={<TicketDetails />} />
          <Route path="/tickets/create-ticket/" element={<CreateTicket />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/knowledgebase/" element={<KnowledgeBase />} />
          <Route path="/user-management/" element={<UserManagement />} />
          <Route
            path="/knowledgebase/create-article/"
            element={<CreateArticle />}
          />
          <Route
            path="/knowledgebase/edit-categories/"
            element={<EditCategories />}
          />
          <Route
            path="/knowledgebase/:articleId"
            element={<ArticleDetails />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
