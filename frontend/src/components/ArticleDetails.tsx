import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";
import {
  MdCancel,
  MdCreate,
  MdDeleteForever,
  MdFormatAlignLeft,
  MdFormatBold,
  MdFormatColorFill,
  MdFormatColorText,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatSize,
  MdFormatUnderlined,
  MdOutlineKeyboardReturn,
} from "react-icons/md";
import { GrAttachment } from "react-icons/gr";
import { FaRegSave } from "react-icons/fa";
import { BiDislike, BiLike } from "react-icons/bi";

const ArticleDetails: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string>("");
  const [userID, setUserID] = useState<number>(0);
  const [article, setArticle] = useState<any | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<number>(0);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [createdBy, setCreatedBy] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

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
        // Token is valid
        setUserRole(decoded.role);
        setUserID(decoded.userId);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }

    // Function handles fetching all the categories.
    const fetchCategories = async () => {
      if (!article) return;
      try {
        let url = "/knowledgebase/categories";

        const response = await apiConfig.get(url);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Function handles fetching Article details and their Author name.
    const fetchArticleDetails = async () => {
      try {
        const response = await apiConfig.get(`/knowledgebase/${articleId}`);
        setArticle(response.data);
        setTitle(response.data.title);
        setText(response.data.text);
        setAttachments(response.data.attachments || []);
        setCategory(response.data.category);
        setCategoryId(response.data.category_id);
        setEditCategoryId(categoryId);
        fetchCategories();
        fetchAuthorDetails();
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };

    const fetchAuthorDetails = async () => {
      if (article === null) return;
      const createdByResponse = await Promise.all([
        apiConfig.get(`/users/${article.author_id}`),
      ]);
      setCreatedBy(createdByResponse[0].data.username);
      setProfilePicture(createdByResponse[0].data.profile_picture);
    };

    fetchArticleDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, articleId, article?.author_id]);

  // Function to handle edit.
  const handleEdit = async () => {
    if (userRole !== "admin" && userID !== article.author_id) return;
    try {
      await apiConfig.put(`/knowledgebase/${articleId}`, {
        title,
        text,
        attachments,
        editCategoryId,
      });
      setArticle((prev: any) =>
        prev ? { ...prev, title, text, attachments, category } : null
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  // Function to handle deleting an article.
  const handleDelete = async () => {
    if (userRole !== "admin") return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Article #${article?.article_id} (${article?.title})?`
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await apiConfig.delete(`/knowledgebase/${articleId}`);
      navigate("/knowledgebase");
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const renderAttachments = () => {
    return attachments.map((attachment: string, index: number) => (
      <div className="px-[0.5rem] py-[0.3rem] rounded-lg shadow text-lg font-poppins bg-gradient-to-br from-teal-400 to-emerald-500  text-white font-thin hover:scale-[104%] transition duration-150">
        <a
          className="flex flex-row items-center gap-2"
          key={index}
          href={`http://localhost:3000/${attachment}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GrAttachment />
          Attachment
        </a>
      </div>
    ));
  };

  return (
    <div className="flex flex-col ms-5">
      <div className="mt-4 mb-6 text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-emerald-500 to-teal-400 rounded-md shadow w-fit hover:shadow-lg hover:scale-[104%] transition duration-100">
        {/* Create A New Article */}
        <MdOutlineKeyboardReturn className="text-xl" />
        <button onClick={() => navigate("/knowledgebase")}>
          Return To Knowledgebase
        </button>
      </div>

      {/* Article */}
      {article ? (
        <div>
          {/* Article Edit Mode View */}
          {editMode &&
          (userRole === "admin" || userID === article.author_id) ? (
            <div className="w-11/12 h-fit">
              <h1 className="my-1 text-3xl font-poppins text-slate-600">
                Edit Article
              </h1>
              <p className="mt-1 mb-4 font-thin text-slate-500">
                Edit and update articles. Modify the title and content to ensure
                the information remains accurate and up-to-date for other users.
              </p>
              <div className="my-3 flex flex-row gap-3 items-center">
                <p className="font-poppins font-bold text-slate-600">
                  Category
                </p>
                <select
                  className="border p-1 border-emerald-400 shadow rounded-md w-fit focus:outline-emerald-400"
                  id="category-select"
                  value={editCategoryId}
                  onChange={(e) => {
                    setEditCategoryId(
                      Number(e.target.options[e.target.selectedIndex].value)
                    );
                    setCategory(e.target.options[e.target.selectedIndex].text);
                  }}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                <p className="font-bold font-poppins text-slate-600">Title</p>
                <input
                  className="border p-2 border-emerald-400 shadow rounded-lg w-full focus:outline-emerald-400"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full">
                <div className="bg-gradient-to-br flex items-center flex-row from-teal-500 to-emerald-600 rounded-t-lg text-white p-2">
                  <MdFormatBold className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatItalic className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatUnderlined className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatSize className="text-xl mx-1 hover:cursor-pointer" />

                  <p className="mx-2 opacity-90 font-thin mt-[-0.25rem] hover:cursor-default">
                    |
                  </p>
                  <MdFormatColorFill className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatColorText className="text-xl mx-1 hover:cursor-pointer" />

                  <p className="mx-2 opacity-90 font-thin mt-[-0.25rem] hover:cursor-default">
                    |
                  </p>
                  <MdFormatAlignLeft className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatListBulleted className="text-xl mx-1 hover:cursor-pointer" />
                  <MdFormatListNumbered className="text-xl mx-1 hover:cursor-pointer" />

                  <p className="mx-2 opacity-90 font-thin mt-[-0.25rem] hover:cursor-default">
                    |
                  </p>
                  <MdFormatQuote className="text-xl mx-1 hover:cursor-pointer" />
                </div>
                <textarea
                  className="border p-2 min-h-[55vh] border-emerald-400 shadow rounded-b-lg w-full h-full focus:outline-emerald-400"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="flex flex-row gap-2 mt-3">
                <button
                  className="py-[0.3rem] px-[1rem] text-lg flex flex-row gap-2 rounded-lg border shadow hover:scale-[104%] transition duration-150 bg-gradient-to-br from-cyan-400 to-emerald-500 text-white font-thin items-center"
                  onClick={handleEdit}
                >
                  <FaRegSave />
                  Save
                </button>
                <button
                  className="py-[0.3rem] px-[0.8rem] text-lg flex flex-row gap-2 rounded-lg border shadow hover:scale-[104%] transition duration-150 bg-gradient-to-br from-cyan-400 to-slate-500 text-white font-thin items-center"
                  onClick={() => setEditMode(false)}
                >
                  <MdCancel />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-11/12 h-full">
              {/* Main  Article View */}
              <h1 className="text-4xl font-poppins w-full">{article.title}</h1>
              <p className="mb-2 font-thin text-sm">Category: {category}</p>

              {/* Article: Details Section */}

              <div className="flex flex-row items-center mb-5">
                <div>
                  <img
                    className=" object-contain rounded-full shadow-sm"
                    src={"http://localhost:3000/" + profilePicture}
                    alt="Profile"
                    width="55"
                  />
                </div>
                <div className="flex flex-row justify-between items-center w-full">
                  <div className="flex flex-col ms-2">
                    <p className="font-poppins">{createdBy}</p>
                    <p className="font-thin text-sm">
                      {new Date(article.date_created).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-row gap-2">
                    {/* Article: Functions Section */}

                    {/* Article: Edit */}
                    {userRole === "admin" || userID === article.author_id ? (
                      <button
                        className="flex flex-row text-white text-lg items-center gap-1 px-[0.5rem] py-[0.3rem]  font-thin bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl shadow hover:scale-[104%] transition duration-150"
                        onClick={() => setEditMode(true)}
                      >
                        <MdCreate className="text-lg" />
                        Edit Article
                      </button>
                    ) : (
                      ""
                    )}

                    {/* Article: Admin Functions */}
                    {userRole === "admin" && (
                      <div>
                        <button
                          className="flex flex-row text-lg text-white items-center gap-1 px-[0.5rem] py-[0.3rem]  font-thin bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl shadow hover:scale-[104%] transition duration-150"
                          onClick={handleDelete}
                        >
                          <MdDeleteForever className="text-lg" />
                          Delete Article
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Article: Body (Description) Section */}
              <div className="w-full p-4 min-h-[40vh] h-full border rounded-lg bg-slate-50">
                <p className="whitespace-pre-line">{article.text}</p>
              </div>

              {/* Article: Attachments Section */}
              <div className="flex flex-row gap-3 w-11/12 mt-2 mb-5">
                {renderAttachments()}
              </div>

              {/* Article: Feedback (NOT IMPLEMENTED)*/}
              <div className="flex flex-col mb-5">
                <div>
                  <p className="text-lg font-thin mb-1">Was this helpful?</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="flex flex-row items-center gap-1 text-lg px-[0.4rem] py-[0.3rem] border shadow rounded-md hover:cursor-pointer hover:scale-105 transition duration-150">
                    <BiLike />
                    Yes
                  </div>

                  <div className="flex flex-row items-center gap-1 text-lg px-[0.4rem] py-[0.3rem] border shadow rounded-md hover:cursor-pointer hover:scale-105 transition duration-150">
                    <BiDislike />
                    No
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading article details...</p>
      )}
    </div>
  );
};

export default ArticleDetails;
