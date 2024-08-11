import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import JWT from "expo-jwt";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Article } from "../interfaces/Article";
import { FaPlusCircle } from "react-icons/fa";
import { MdOutlineArticle, MdOutlineCategory } from "react-icons/md";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [userRole, setUserRole] = useState("");
  const [users, setUsers] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [articlesFilter, setArticlesFilter] = useState<string>("date_created");
  const [orderFilter, setOrderFilter] = useState<string>("DESC");
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
      } else {
        setUserRole(decoded.role);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    // Function handles fetching all the articles or the given search query.
    const fetchArticles = async () => {
      try {
        let url = `/knowledgebase?`;
        if (searchQuery) {
          url += `search=${searchQuery}`;
        }
        url += `&field=${articlesFilter}&order=${orderFilter}`;

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
  }, [searchQuery, navigate, articlesFilter, orderFilter]);

  const handleArticleClick = (article_id: number) => {
    navigate(`/knowledgebase/${article_id}`);
  };

  const handleCreateArticle = () => {
    navigate("/knowledgebase/create-article/");
  };

  const handleEditCategories = () => {
    navigate("/knowledgebase/edit-categories/");
  };

  const handleFilterChange = (filter: string) => {
    setArticlesFilter(filter);

    if (orderFilter === "DESC") setOrderFilter("ASC");
    else setOrderFilter("DESC");
  };

  return (
    <div className="flex flex-col ms-5">
      {/* Articles */}
      <h1 className="text-slate-600 text-2xl font-poppins font-bold mb-3 mt-5">
        Knowledgebase
      </h1>

      <div className="mt-1 mb-4 w-11/12 font-thin text-slate-500">
        <p className=" mb-1">
          Explore our comprehensive collection of articles and guides to assist
          with troubleshooting and instructional needs. Whether you're seeking
          step-by-step instructions or expert tips, the Knowledgebase is here to
          support your efforts.
        </p>

        <p className="">
          Click on the column headers below to sort the list in either ascending
          or descending order.
        </p>
      </div>

      <div className="flex flex-row justify-between items-center w-11/12">
        <div className="text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-emerald-500 to-teal-400  rounded-md shadow w-fit">
          {/* Create A New Article */}
          <FaPlusCircle className="text-xl" />
          <button onClick={handleCreateArticle}>Create New Article</button>
        </div>

        {userRole === "admin" ? (
          <div className="text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-rose-500 to-cyan-400  rounded-md shadow w-fit">
            {/* Edit Categories */}
            <MdOutlineCategory className="text-xl" />
            <button onClick={handleEditCategories}>Edit Categories</button>
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Search */}
      <div className="w-11/12 sticky z-10 top-[-1rem]">
        {/* Search Box */}
        <input
          className="w-full h-fit bg-slate-200 p-2 focus:border-2 focus:outline-none focus:border-emerald-400 shadow text-slate-600 rounded-xl my-5 placeholder-slate-600"
          type="text"
          placeholder="Search the knowledgebase..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="sticky z-10 top-[3rem] grid grid-cols-4 p-3 font-poppins rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-11/12 items-center border shadow mb-2">
        <p
          className={
            articlesFilter === "title"
              ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
              : "flex flex-row items-center gap-1 hover:cursor-pointer"
          }
          onClick={() => handleFilterChange("title")}
        >
          Title
          {articlesFilter === "title" && orderFilter === "DESC" ? (
            <RiArrowDownSFill className="text-2xl" />
          ) : (
            ""
          )}
          {articlesFilter === "title" && orderFilter === "ASC" ? (
            <RiArrowUpSFill className="text-2xl" />
          ) : (
            ""
          )}
        </p>
        <p>Author</p>
        <p
          className={
            articlesFilter === "category"
              ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
              : "flex flex-row items-center gap-1 hover:cursor-pointer"
          }
          onClick={() => handleFilterChange("category")}
        >
          Category
          {articlesFilter === "category" && orderFilter === "DESC" ? (
            <RiArrowDownSFill className="text-2xl" />
          ) : (
            ""
          )}
          {articlesFilter === "category" && orderFilter === "ASC" ? (
            <RiArrowUpSFill className="text-2xl" />
          ) : (
            ""
          )}
        </p>
        <p
          className={
            articlesFilter === "date_created"
              ? "flex flex-row items-center gap-1 hover:cursor-pointer font-bold transition duration-300"
              : "flex flex-row items-center gap-1 hover:cursor-pointer"
          }
          onClick={() => handleFilterChange("date_created")}
        >
          Date Created
          {articlesFilter === "date_created" && orderFilter === "DESC" ? (
            <RiArrowDownSFill className="text-2xl" />
          ) : (
            ""
          )}
          {articlesFilter === "date_created" && orderFilter === "ASC" ? (
            <RiArrowUpSFill className="text-2xl" />
          ) : (
            ""
          )}
        </p>
      </div>

      {/* Main Articles View */}
      <div className="w-11/12">
        {articles.map((article) => (
          <div
            className="grid grid-cols-4 font-thin px-[0.4rem] py-[0.6rem] rounded-lg mb-[0.35rem] bg-white w-full items-center border shadow hover:cursor-pointer hover:bg-neutral-200 hover:scale-[103%] transition duration-300"
            key={article.article_id}
            onClick={() => handleArticleClick(article.article_id ?? 0)} // Provide a default value of 0 or handle undefined cases
          >
            <div className="flex flex-row gap-2 items-center">
              <MdOutlineArticle className="text-xl text-teal-500" />
              <p>{article.title}</p>
            </div>
            <p>{users[article.author_id]}</p>
            <p>{article.category}</p>
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
