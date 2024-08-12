import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";
import {
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
import { FaPlusCircle } from "react-icons/fa";

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
    <div className="flex flex-col ms-5 w-11/12">
      <div className="mt-3 mb-4 text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-emerald-500 to-teal-400 rounded-md shadow w-fit hover:shadow-lg hover:scale-[104%] transition duration-100">
        {/* Create A New Article */}
        <MdOutlineKeyboardReturn className="text-xl" />
        <button onClick={() => navigate("/knowledgebase")}>
          Return To Knowledgebase
        </button>
      </div>
      <h1 className="my-1 text-3xl font-poppins text-slate-600">
        Create New Article
      </h1>
      <p className="mt-1 mb-4 font-thin text-slate-500">
        Create and publish articles for other users. Provide a title, write the
        content, and attach any necessary files to share detailed instructions
        or information.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row gap-3 items-center">
          <p className="font-poppins font-bold text-slate-600">Category</p>
          <select
            className="border p-1 border-emerald-400 shadow rounded-md w-fit focus:outline-emerald-400"
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

        <div className="flex flex-col gap-1 mb-3">
          <p className="font-bold font-poppins text-slate-600">Title</p>
          <input
            className="border p-2 border-emerald-400 shadow rounded-lg w-full focus:outline-emerald-400"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-row items-center gap-3 mb-3">
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
              className="border p-2 min-h-[50vh] border-emerald-400 shadow rounded-b-lg w-full h-full focus:outline-emerald-400"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 mb-3">
          <p className="font-bold font-poppins text-slate-600 my-2">
            Attachments
          </p>
          <input type="file" multiple onChange={handleFileChange} />
        </div>
        <button
          className="rounded-lg mb-2 shadow px-[0.4rem] py-[0.4rem] bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-thin hover:scale-[104%] transition duration-150 flex flex-row items-center gap-2 text-lg"
          type="submit"
        >
          <FaPlusCircle className="text-xl" />
          Publish Article
        </button>
      </form>
    </div>
  );
};

export default CreateArticle;
