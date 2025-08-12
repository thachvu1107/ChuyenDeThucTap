import React, { useEffect, useState, useCallback } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../../api/Api";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    category_id: "",
    brand: "",
    details: "",
    size: "",
    color: "",
    quantity: "",
  });
  const [validationError, setValidationError] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch product details on component mount
  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`${Api}/product/${id}`);
      const productData = response.data.product;
      const stockInfo =
        productData.stocks.length > 0 ? productData.stocks[0] : {};
      setProduct((prevState) => ({
        ...prevState,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category_id: productData.category_id,
        brand: productData.brand,
        details: productData.details,
        size: stockInfo.size || "",
        color: stockInfo.color || "",
        quantity: stockInfo.quantity || "",
      }));
    } catch (error) {
      Swal.fire({
        text:
          error.response?.data?.message ||
          "An error occurred while fetching the product details.",
        icon: "error",
      });
    }
  }, [id]);

  // Fetch categories on component mount
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${Api}/product/categories`);
      setCategories(response.data);
    } catch (error) {
      Swal.fire({
        text:
          error.response?.data?.message ||
          "An error occurred while fetching the categories.",
        icon: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [fetchProduct, fetchCategories]);

  // Handle input change
  const changeHandler = (event) => {
    const { name, value, files } = event.target;
    if (name === "image") {
      setProduct((prevState) => ({ ...prevState, image: files[0] }));
    } else {
      setProduct((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  // Handle form submission
  const updateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("category_id", product.category_id);
    formData.append("brand", product.brand);
    formData.append("details", product.details);
    formData.append("size", product.size);
    formData.append("color", product.color);
    formData.append("quantity", product.quantity);
    if (product.image !== null) {
      formData.append("photo", product.image);
    }

    try {
      const response = await axios.post(`${Api}/product/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response);
      const updatedProduct = response.data.product;

      // Logging for debugging
      console.log("Updated product response:", updatedProduct);

      // Update image URL in frontend state
      setProduct((prevState) => ({
        ...prevState,
        image: updatedProduct.photo, // Assuming response includes updated photo URL
      }));

      Swal.fire({
        icon: "success",
        text: response.data.message,
      });
      navigate("/dashboard/");
    } catch (error) {
      if (error.response?.status === 422) {
        setValidationError(error.response.data.errors);
      } else {
        Swal.fire({
          text:
            error.response?.data?.message ||
            "An error occurred while updating the product.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Cập nhật sản phẩm</h4>
              <hr />
              <div className="form-wrapper">
                {Object.keys(validationError).length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-danger">
                        <ul className="mb-0">
                          {Object.entries(validationError).map(
                            ([key, value]) => (
                              <li key={key}>{value[0]}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                <Form onSubmit={updateProduct}>
                  <Row>
                    <Col>
                      <Form.Group controlId="Name">
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={product.name}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="my-3">
                    <Col>
                      <Form.Group controlId="Description">
                        <Form.Label>Chi tiết</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          value={product.description}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="my-3">
                    <Col>
                      <Form.Group controlId="Price">
                        <Form.Label>Giá</Form.Label>
                        <Form.Control
                          type="number"
                          name="price"
                          value={product.price}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="CategoryID">
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Control
                          as="select"
                          name="category_id"
                          value={product.category_id}
                          onChange={changeHandler}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Brand">
                        <Form.Label>Thương hiệu</Form.Label>
                        <Form.Control
                          type="text"
                          name="brand"
                          value={product.brand}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Details">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                          type="text"
                          name="details"
                          value={product.details}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Size">
                        <Form.Label>Kích thước</Form.Label>
                        <Form.Control
                          type="text"
                          name="size"
                          value={product.size}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Color">
                        <Form.Label>Màu sắc</Form.Label>
                        <Form.Control
                          type="text"
                          name="color"
                          value={product.color}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Quantity">
                        <Form.Label>Số lượng</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={product.quantity}
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group controlId="Image" className="mb-3">
                        <Form.Label>Hình ảnh</Form.Label>
                        <Form.Control
                          type="file"
                          name="image"
                          onChange={changeHandler}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    variant="primary"
                    className="mt-2"
                    size="lg"
                    block
                    type="submit"
                  >
                    Cập nhật
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
