import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductItem from "./ProductItem";
import { Api } from "./../../../api/Api";
import '../../css/ProductPage.css';

const ProductPage = ({ title }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories[0].id;
      setCurrentCategory(defaultCategory);
      fetchProducts(defaultCategory);
    }
  }, [categories]);

  useEffect(() => {
    if (currentCategory !== null) {
      fetchProducts(currentCategory);
    }
  }, [currentCategory]);

  const fetchProducts = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Api}/product/categories/${categoryId}/new`
      );
      const productData = response.data.data || [];
      console.log("Dữ liệu từ API trả về:", productData);
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${Api}/product/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories", error);
      setCategories([]);
    }
  };

  const handleClick = (categoryId) => {
    setCurrentCategory(categoryId);
  };

  const chunkArray = (array, size) => {
    if (!array) return [];
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
  };

  const productRows = chunkArray(products, 12);

  return (
    <div>
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="col-md-12">
            <div className="section-title">
              <h3 className="title">Danh mục sản phẩm</h3>
              <div className="section-nav">
                <ul className="section-tab-nav tab-nav">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className={category.id === currentCategory ? "active" : ""}
                    >
                      <a
                        onClick={() => handleClick(category.id)}
                        data-toggle="tab"
                        href="#"
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {loading ? (
            <div>Đang tải...</div>
          ) : products.length > 0 ? (
            productRows.map((row, rowIndex) => (
              <div className="row product-row" key={rowIndex}>
                {row.map((product) => (
                  <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" key={product.id}>
                    <ProductItem product={product} />
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div>Không tìm thấy sản phẩm nào.</div>
          )}
          {products.length < 12 && (
            <p className="text-center mt-3">-,-</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;