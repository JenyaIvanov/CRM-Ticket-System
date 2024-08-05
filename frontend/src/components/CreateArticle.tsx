import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";

const CreateArticle: React.FC = () => {
  const [user_id, setUserId] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [category, setCategory] = useState("1");
  const [attachments, setAttachments] = useState<File[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const TOKEN_KEY = process.env.REACT_APP_JWT;
    const jwtToken = localStorage.getItem("jwt");

    if (!jwtToken) {
      navigate("/login");
      return;
    }

    // Function handles fetching all the articles or the given search query.
    const fetchCategories = async () => {
      try {
        let url = "/knowledgebase/categories";

        const response = await apiConfig.get(url);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    try {
      const decoded: DecodedToken = JWT.decode(jwtToken, TOKEN_KEY!);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
        setUserId(decoded.userId);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("author_id", user_id.toString());
    formData.append("title", title);
    formData.append("text", text);
    formData.append("category", category);

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      await apiConfig.post("/knowledgebase", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/knowledgebase");
    } catch (error) {
      console.error("Error creating article:", error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/knowledgebase")}>
        Return To Knowledgebase
      </button>
      <h1>Create New Article</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <p>Category: </p>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
        <div>
          <label>Text:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Attachments:</label>
          <input type="file" multiple onChange={handleFileChange} />
        </div>
        <button type="submit">Create Article</button>
      </form>
    </div>
  );
};

export default CreateArticle;
