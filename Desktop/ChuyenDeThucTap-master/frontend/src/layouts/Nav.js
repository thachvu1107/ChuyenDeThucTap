import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/css/Nav.css";
import { Api } from "../api/Api";

const Nav = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${Api}/product/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi khi lấy categories:", err));
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/quickpage/${categoryId}`);
  };

  return (
    <nav id="navigation" className="main-navigation">
      <div className="container">
        <div className="nav-left">
          <ul className="main-nav">
            <li className="dropdown">
              <span className="dropdown-toggle">Danh mục sản phẩm</span>
              <ul className="dropdown-menu">
                {categories.map((cat) => (
                  <li key={cat.id} onClick={() => handleCategoryClick(cat.id)}>
                    {cat.name}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Trang chủ
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/product"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Sản phẩm
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/news"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Tin tức
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Liên hệ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/feedback"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Phản hồi
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/all-products"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Tất cả sản phẩm
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/track-my-order"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Theo dõi đơn hàng
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
