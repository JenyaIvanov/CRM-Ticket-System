import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Article } from "../interfaces/Article";
import { FaPlusCircle } from "react-icons/fa";
import { MdOutlineArticle } from "react-icons/md";

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
    <div className="flex flex-col ms-5">
      {/* Articles */}
      <h1 className="text-slate-600 text-2xl font-poppins font-bold mb-3 mt-5">
        Knowledgebase
      </h1>

      <p className="font-thin mt-1 mb-4 w-11/12">
        Explore our comprehensive collection of articles and guides to assist
        with troubleshooting and instructional needs. Whether you're seeking
        step-by-step instructions or expert tips, the Knowledgebase is here to
        support your efforts.
      </p>

      <div className="text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-emerald-500 to-teal-400  rounded-md shadow w-fit">
        {/* Create A New Article */}
        <FaPlusCircle className="text-xl" />
        <button onClick={handleCreateArticle}>Create New Article</button>
      </div>

      {/* Search */}
      <div className="w-11/12">
        {/* Search Box */}
        <input
          className="w-full h-fit bg-slate-200 p-2 focus:border-2 focus:outline-none focus:border-teal-600 shadow text-slate-600 rounded-xl my-5 placeholder-slate-600"
          type="text"
          placeholder="Search the knowledgebase..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 p-2 font-poppins rounded-lg bg-emerald-500 text-white w-11/12 items-center border shadow mb-2">
        <p>Title</p>
        <p>Author</p>
        <p>Category</p>
        <p>Date Created</p>
      </div>

      {/* Main Articles View */}
      <div className="w-11/12">
        {articles.map((article) => (
          <div
            className="grid grid-cols-4 font-thin px-[0.4rem] py-[0.6rem] rounded-lg mb-[0.35rem] bg-white w-full items-center border shadow hover:cursor-pointer hover:bg-neutral-200 hover:scale-[103%] transition duration-300"
            key={article.article_id}
            onClick={() => handleArticleClick(article.article_id ?? 0)} // Provide a default value of 0 or handle undefined cases
          >
            <div className="flex flex-row gap-1 items-center">
              <MdOutlineArticle className="text-xl text-teal-500" />
              <p>{article.title}</p>
            </div>
            <p>{users[article.author_id]}</p>
            <p>Uncategorized</p>
            <p>
              {article.date_created
                ? new Date(article.date_created).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
