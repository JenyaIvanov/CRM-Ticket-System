import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from "../api/apiConfig";
import { DecodedToken } from "../interfaces/DecodedToken";
import { Categories } from "../interfaces/Categories";
import JWT from "expo-jwt";

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
    <div>
      <button onClick={() => navigate("/knowledgebase")}>
        Return To Knowledgebase
      </button>
      <div>
        <p>Category</p>
        <select
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
        <button onClick={handleCategoryDelete}>Delete Category</button>
      </div>

      <div>
        <p>Create Category</p>
        <label>Name:</label>
        <textarea
          value={categoryTitle}
          onChange={(e) => setCategoryTitle(e.target.value)}
        />
        <button onClick={handleCreateCategory}>Create Category</button>
      </div>
    </div>
  );
};

export default EditCategories;
