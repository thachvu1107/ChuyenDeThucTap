import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../../api/Api";

const CategoryForm = ({ categoryToEdit, onSubmit }) => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name);
    } else {
      setCategoryName("");
    }
    inputRef.current?.focus();
  }, [categoryToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      Swal.fire({ icon: "warning", text: "Tên danh mục không được để trống!" });
      return;
    }

    try {
      setLoading(true);
      if (categoryToEdit) {
        await axios.post(`${Api}/product/categories/${categoryToEdit.id}`, {
          name: categoryName,
        });
        Swal.fire({ icon: "success", text: "Cập nhật danh mục thành công" });
      } else {
        await axios.post(`${Api}/product/categories`, { name: categoryName });
        Swal.fire({ icon: "success", text: "Thêm danh mục thành công" });
      }
      onSubmit();
      setCategoryName("");
    } catch (error) {
      Swal.fire({ icon: "error", text: "Có lỗi xảy ra, vui lòng thử lại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
      <h5 className="mb-3">
        {categoryToEdit ? "📝 Cập nhật danh mục" : "➕ Thêm danh mục mới"}
      </h5>
      <div className="mb-3">
        <label className="form-label">Tên danh mục</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tên danh mục..."
          value={categoryName}
          ref={inputRef}
          onChange={(e) => setCategoryName(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn text-white w-100"
        style={{ backgroundColor: "#DB4916" }}
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : categoryToEdit ? "Cập nhật" : "Thêm"}
      </button>
    </form>
  );
};

export default CategoryForm;
