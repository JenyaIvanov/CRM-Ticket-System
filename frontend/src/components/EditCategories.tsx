import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";
import {
  MdCreate,
  MdDeleteForever,
  MdOutlineKeyboardReturn,
} from "react-icons/md";

const EditCategories: React.FC = () => {
  const [categoryTitle, setCategoryTitle] = useState("");
  const [forceReload, setForceReload] = useState("");
  const [categories, setCategories] = useState<Categories[]>([]);
  const [selectedCategoryTitle, setSelectedCategoryTitle] =
    useState<string>("");
  const [category, setCategory] = useState("1");
  const navigate = useNavigate();

  useEffect(() => {
    const TOKEN_KEY = process.env.REACT_APP_JWT;
    const jwtToken = localStorage.getItem("jwt");

    if (!jwtToken) {
      navigate("/login");
      return;
    }

    // Function handles fetching all the categories.
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
        if (decoded.role !== "admin") navigate("/knowledgebase");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("jwt");
      navigate("/login");
    }
  }, [navigate, forceReload]);

  const handleCategoryDelete = async () => {
    if (selectedCategoryTitle === "")
      return window.alert(
        "No category selected. Please open the category list and choose a category to delete."
      );
    const confirmAction = window.confirm(
      `Are you sure you want to delete Category #${category} (${selectedCategoryTitle})?`
    );
    if (!confirmAction) {
      return;
    }

    try {
      await apiConfig.delete(`/knowledgebase/categories/${Number(category)}`);
      window.alert("Category deleted succesfully!");
      setForceReload("e");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (categoryTitle === "" || categoryTitle.length < 3) {
      window.alert(
        "Invalid Category Name. (Empty or less than 3 characters long)"
      );
    }

    try {
      const title = categoryTitle;
      await apiConfig.post(`/knowledgebase/categories`, { title });
      setCategoryTitle("");
      window.alert("Category Created Successfully!");
      setForceReload("a");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="flex flex-col ms-5">
      <div className="mt-4 text-white font-thin flex flex-row items-center gap-2 px-[0.7rem] py-[0.5rem] bg-gradient-to-br from-emerald-500 to-teal-400 rounded-md shadow w-fit hover:shadow-lg hover:scale-[104%] transition duration-100">
        {/* Create A New Article */}
        <MdOutlineKeyboardReturn className="text-xl" />
        <button onClick={() => navigate("/knowledgebase")}>
          Return To Knowledgebase
        </button>
      </div>

      {/* Categories Management */}
      <h1 className="text-slate-600 text-2xl font-poppins font-bold mb-3 mt-5">
        Edit Categories
      </h1>
      <div className="mt-1 mb-4 w-11/12 font-thin text-slate-500">
        <p className=" mb-1">
          This page allows administrators to create and delete categories for
          organizing articles in the Knowledgebase. Use this tool to manage the
          structure of your content, making it easier for users to find relevant
          information by grouping related articles under clear, defined
          categories.
        </p>
      </div>

      <div className="flex flex-col">
        <p className="text-xl font-thin">Delete Categories</p>
        <p className="font-thin text-sm mt-1">
          To delete a category, select it from the list and click the 'Delete'
          button.
        </p>
        <p className="font-bold font-poppins text-xs mb-4 text-rose-600">
          • Once you delete a category it cannot be restored.
        </p>
        <div className="flex flex-row gap-3">
          <select
            className="border p-1 border-emerald-400 shadow rounded-md w-fit focus:outline-emerald-400"
            id="category-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSelectedCategoryTitle(
                e.target.options[e.target.selectedIndex].text
              );
            }}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} id={cat.title} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          <button
            className="flex flex-row items-center gap-1 rounded-xl text-white font-thin w-fit px-[0.7rem] py-[0.3rem] bg-gradient-to-br from-emerald-400 to-rose-500 shadow-sm hover:shadow-lg hover:scale-[104%] transition duration-100"
            onClick={handleCategoryDelete}
          >
            <MdDeleteForever className="text-lg" />
            Delete
          </button>
        </div>
      </div>

      <hr className="my-6 w-11/12 shadow-sm" />

      <div className="flex flex-col">
        <p className="text-xl font-thin">Create Categories</p>
        <p className="font-thin text-sm mt-1">
          To create a category, enter the name in the input box and click
          'Create.
        </p>
        <p className="font-bold font-poppins text-xs mb-4 text-rose-600">
          • Category names must be 30 characters or fewer.
        </p>

        <p className="font-thin mb-1">Category Name</p>
        <div className="flex flex-row gap-3 items-center">
          <div>
            <textarea
              className="w-fit border border-emerald-500 shadow rounded-md p-2 h-11 items-center focus:outline-emerald-500"
              value={categoryTitle}
              onChange={(e) => setCategoryTitle(e.target.value)}
            />
          </div>
          <div>
            <button
              className="flex flex-row items-center mt-[-0.5rem] gap-1 rounded-xl text-white font-thin w-fit px-[0.7rem] py-[0.3rem] bg-gradient-to-br from-emerald-500 to-teal-400 shadow-sm hover:shadow-lg hover:scale-[104%] transition duration-100"
              onClick={handleCreateCategory}
            >
              <MdCreate className="text-lg" />
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategories;
