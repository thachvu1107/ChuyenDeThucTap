import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CategoryForm from "./CategoryForm";
import { Api } from "../../../api/Api";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${Api}/product/categories`);
      setCategories(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Không thể lấy danh sách danh mục!",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    const isConfirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    }).then((result) => result.isConfirmed);

    if (!isConfirm) return;

    try {
      await axios.delete(`${Api}/product/categories/${id}`);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      Swal.fire({ icon: "success", text: "Xoá danh mục thành công!" });
    } catch (error) {
      Swal.fire({ icon: "error", text: "Xoá thất bại!" });
    }
  };

  const handleEditClick = (category) => {
    setCategoryToEdit(category);
  };

  const handleCategoryFormSubmit = () => {
    fetchCategories();
    setCategoryToEdit(null);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div
          className="card-header text-white"
          style={{ backgroundColor: "#DB4916" }}
        >
          <h5 className="mb-0">📂 Quản lý danh mục</h5>
        </div>

        <div className="card-body">
          <CategoryForm
            categoryToEdit={categoryToEdit}
            onSubmit={handleCategoryFormSubmit}
          />

          <hr />

          <h6 className="mt-4">Danh sách danh mục</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center mt-3">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditClick(category)}
                      >
                        <i className="fa fa-edit me-1"></i> Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <i className="fa fa-trash me-1"></i> Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3">Chưa có danh mục nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
