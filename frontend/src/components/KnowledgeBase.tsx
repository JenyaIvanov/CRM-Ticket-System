import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Article } from "../interfaces/Article";

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
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
        localStorage.removeItem("jwt");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    // Function handles fetching all the articles or the given search query.
    const fetchArticles = async () => {
      try {
        let url = "/knowledgebase";
        if (searchQuery) {
          url += `?search=${searchQuery}`;
        }

        const response = await apiConfig.get(url);
        setArticles(response.data);

        const userIds = Array.from(
          new Set(
            response.data.flatMap((article: Article) => [article.author_id])
          )
        );

        const userResponses = await Promise.all(
          userIds.map((userId) => apiConfig.get(`/users/${userId}`))
        );

        const userMap = userResponses.reduce((acc, userRes) => {
          acc[userRes.data.id] = userRes.data.username;
          return acc;
        }, {} as { [key: string]: string });
        setUsers(userMap);
      } catch (error) {
        console.error("Error fetching articles or users:", error);
      }
    };

    fetchArticles();
  }, [searchQuery, navigate]);

  const handleArticleClick = (article_id: number) => {
    navigate(`/knowledgebase/${article_id}`);
  };

  const handleCreateArticle = () => {
    navigate("/create-article");
  };

  return (
    <div>
      {/* Articles */}
      <h1>Knowledgebase</h1>

      {/* Create A New Article */}
      <button onClick={handleCreateArticle}>Create New Article</button>

      {/* Search */}
      <div>
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Articles View */}
      <div>
        {articles.map((article) => (
          <button
            key={article.article_id}
            onClick={() => handleArticleClick(article.article_id ?? 0)} // Provide a default value of 0 or handle undefined cases
          >
            <h2>{article.title}</h2>
            <p>Author: {users[article.author_id]}</p>
            <p>
              Date Created:{" "}
              {article.date_created
                ? new Date(article.date_created).toLocaleDateString()
                : "Not available"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
