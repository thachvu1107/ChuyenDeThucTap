import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../../api/Api";
import { ImageApi } from "../../../api/ImageApi";

export default function List() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6); // Number of products per page

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${Api}/product`);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    const isConfirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      return result.isConfirmed;
    });

    if (!isConfirm) {
      return;
    }

    try {
      await axios.delete(`${Api}/product/${id}`);
      Swal.fire({
        icon: "success",
        text: "Product deleted successfully!",
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        text: "Failed to delete product",
      });
    }
  };

  // Logic for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Link
            className="btn text-white mb-2 float-end"
            style={{ backgroundColor: "#DB4916" }}
            to="dashboard/product/create"
          >
            Thêm mới
          </Link>
        </div>
        <div className="col-12">
          <div className="card card-body">
            <div className="table-responsive">
              <table className="table table-bordered mb-0 text-center">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Hình ảnh</th>
                    <th>Danh mục</th>
                    <th>Thương hiệu</th>
                    <th>Chi tiết</th>
                    <th>Giá</th>
                    <th>Kích thước</th>
                    <th>Màu sắc</th>
                    <th>Số lượng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((row, key) => (
                      <tr key={key}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td>
                          <img
                            width="100px"
                            src={`${ImageApi}/img/${row.photo}`}
                            alt="Product"
                          />
                        </td>
                        <td>{row.category.name}</td>
                        <td>{row.brand}</td>
                        <td>{row.description}</td>
                        <td>{row.price}</td>
                        <td>
                          {row.stocks.length > 0 ? row.stocks[0].size : "-"}
                        </td>
                        <td>
                          {row.stocks.length > 0 ? row.stocks[0].color : "-"}
                        </td>
                        <td>
                          {row.stocks.length > 0 ? row.stocks[0].quantity : "-"}
                        </td>

                        <td>
                          {/* <Link to={`dashboard/product/edit/${row.id}`} className='btn btn-success'>
                                                        <i className="fa fa-edit"></i>
                                                    </Link>
                                                    <Button variant="danger" onClick={() => deleteProduct(row.id)}>
                                                        <i className="fa fa-trash"></i>
                                                    </Button> */}
                          <div style={{ display: "flex" }}>
                            <Link to={`dashboard/product/edit/${row.id}`}>
                              <i
                                className="fa fa-edit"
                                style={{ paddingRight: "10px" }}
                              ></i>
                            </Link>
                            <i
                              className="fa fa-trash"
                              style={{ color: "#0832e7", marginTop: "5px" }}
                              onClick={() => deleteProduct(row.id)}
                            ></i>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 mt-3 my-3">
          <ul className="pagination justify-content-center">
            {[
              ...Array(Math.ceil(products.length / productsPerPage)).keys(),
            ].map((number) => (
              <li
                key={number}
                className={`page-item ${
                  currentPage === number + 1 ? "active" : ""
                }`}
              >
                <button
                  onClick={() => paginate(number + 1)}
                  className="page-link"
                >
                  {number + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
