import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";

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

  const handleBackToArticles = () => {
    navigate("/knowledgebase");
  };

  const renderAttachments = () => {
    return attachments.map((attachment: string, index: number) => (
      <a
        key={index}
        href={`http://localhost:3000/${attachment}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        File {index}
      </a>
    ));
  };

  return (
    <div>
      {/* Above Article Display (This Section Always Shown) */}
      <div>
        <button onClick={handleBackToArticles}>Back to Articles</button>
      </div>

      {/* Article */}
      {article ? (
        <div>
          {/* Article Edit Mode View */}
          {editMode &&
          (userRole === "admin" || userID === article.author_id) ? (
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p>Category</p>
              <select
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
              <button onClick={handleEdit}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              {/* Main  Article View */}
              <h1>{article.title}</h1>

              {/* Article: Details Section */}
              <p>
                Date Created: {new Date(article.date_created).toLocaleString()}
              </p>
              <p>Author: {createdBy}</p>

              <p>Category: {category}</p>

              {/* Article: Body (Description) Section */}
              <p>{article.text}</p>

              {/* Article: Attachments Section */}
              <div>{renderAttachments()}</div>

              <div>
                {/* Article: Functions Section */}

                {/* Article: Edit */}
                {userRole === "admin" || userID === article.author_id ? (
                  <button onClick={() => setEditMode(true)}>
                    Edit Article
                  </button>
                ) : (
                  ""
                )}

                {/* Article: Admin Functions */}
                {userRole === "admin" && (
                  <div>
                    <button onClick={handleDelete}>Delete Article</button>
                  </div>
                )}
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
