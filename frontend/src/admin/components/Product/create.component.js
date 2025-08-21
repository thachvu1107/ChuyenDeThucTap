import React, { Component } from "react";
import axios from "axios";
import { withRouter } from "../../../utils/withRouter";

import { Api } from "../../../api/Api";
class CreateProduct extends Component {
  constructor() {
    super();

    this.state = {
      name: "",
      category_id: "",
      brand: "",
      description: "",
      details: "",
      photos: null,
      price: "",
      size: "",
      color: "",
      quantity: 1,
      success: false,
      error: "",
      errorKeys: "",
      categories: [],
    };

    this.baseState = this.state;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fileSelectHandler = this.fileSelectHandler.bind(this);
  }

  componentDidMount() {
    this.getCategories();
  }

  getCategories() {
    axios.get(`${Api}/product/categories`).then((response) => {
      this.setState({
        category_id: response.data[0].id,
        categories: [...response.data],
      });
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("photo", this.state.photos); // chỉ gửi một ảnh
    fd.append("name", this.state.name);
    fd.append("category_id", this.state.category_id);
    fd.append("brand", this.state.brand);
    fd.append("description", this.state.description);
    fd.append("details", this.state.details);
    fd.append("price", this.state.price);
    fd.append("size", this.state.size);
    fd.append("color", this.state.color);
    fd.append("quantity", this.state.quantity);

    axios
      .post(`${Api}/products`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        this.setState({
          ...this.baseState,
          success: true,
        });
        this.getCategories();
        this.props.navigate("/dashboard");
      })
      .catch((err) => {
        this.setState({
          error: err.response.data.errors,
          // errorKeys: Object.keys(err.response.data.errors)
        });
      });
  }

  handleChange(event) {
    if (event.target.type == "select-one") {
      this.setState({
        category_id: event.target.value,
      });
    } else {
      const { name, value } = event.target;
      this.setState({
        [name]: value,
      });
    }

    if (this.state.success) {
      this.setState({
        success: false,
      });
    }
  }
  // fileSelectHandler(event) {
  //   this.setState({
  //     photos: event.target.files[0],

  //   });
  // }
  fileSelectHandler(event) {
    const file = event.target.files[0]; 
    this.setState({
      photos: file,
      previewUrl: URL.createObjectURL(file), 
    });
  }

  render() {
    return (
      <div className="container-fluid">
        {this.state.success && (
          <div className="card mb-4 py-3 border-left-success">
            <div className="card-body">Sản phẩm đã được tạo thành công.</div>
          </div>
        )}

        {this.state.error && (
          <div className="card mb-4 py-3 border-left-danger">
            <div className="card-body">
              {this.state.error &&
                this.state.errorKeys &&
                this.state.errorKeys.map((key) => (
                  <div key={key}>
                    <i
                      style={{ color: "#e74a3b" }}
                      className="fa fa-exclamation-triangle mr-2"
                    ></i>
                    {this.state.error[key]}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              Thêm 1 sản phẩm mới
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={this.handleSubmit}>
              <div className="d-flex">
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className="small mb-1">Tên sản phẩm</label>
                    <input
                      className="form-control"
                      name="name"
                      value={this.state.name}
                      onChange={this.handleChange}
                      type="text"
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="small mb-1">Danh mục</label>
                    <select
                      className="form-control"
                      onChange={this.handleChange}
                    >
                      {this.state.categories &&
                        this.state.categories.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small mb-1">Thương hiệu</label>
                    <input
                      className="form-control"
                      name="brand"
                      value={this.state.brand}
                      onChange={this.handleChange}
                      type="text"
                      placeholder="Product brand"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="small mb-1">Giá</label>
                    <div className="input-group mb-2">
                      <div className="input-group-prepend">
                        <div className="input-group-text">$</div>
                      </div>
                      <input
                        className="form-control"
                        name="price"
                        value={this.state.price}
                        onChange={this.handleChange}
                        type="text"
                        placeholder="Product price"
                        required
                      />
                    </div>
                  </div>
                  {/* <div className="form-group">
                    <label className="small mb-1">Hình ảnh</label>
                    <input
                      className="form-control"
                      onChange={this.fileSelectHandler}
                      type="file"
                      multiple
                      style={{ paddingTop: "3px" }}
                      required
                    />
                  </div> */}
                  <div className="form-group">
                    <label className="small mb-1">Hình ảnh</label>
                    <input
                      className="form-control"
                      onChange={this.fileSelectHandler}
                      type="file"
                      style={{ paddingTop: "3px" }}
                      required
                    />
                    {this.state.previewUrl && (
                      <div className="mt-2">
                        <img
                          src={this.state.previewUrl}
                          alt="Preview"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="form-group">
                    <label className="small mb-1">Chi tết</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      name="description"
                      value={this.state.description}
                      onChange={this.handleChange}
                      placeholder="Product description"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="small mb-1">Mô tả</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      name="details"
                      value={this.state.details}
                      onChange={this.handleChange}
                      placeholder="Product details"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-5">
                      <label className="small mb-1">Kích thước</label>
                      <input
                        className="form-control"
                        type="text"
                        name="size"
                        placeholder="Product size"
                        onChange={this.handleChange}
                        value={this.state.size}
                        required
                      />
                    </div>
                    <div className="form-group col-md-5">
                      <label className="small mb-1">Màu sắc</label>
                      <input
                        className="form-control"
                        type="text"
                        name="color"
                        placeholder="Product color"
                        onChange={this.handleChange}
                        value={this.state.color}
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label className="small mb-1">Số lượng</label>
                      <input
                        className="form-control"
                        type="number"
                        name="quantity"
                        onChange={this.handleChange}
                        value={this.state.quantity}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button className="btn btn-primary float-right">
                  Tạo sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(CreateProduct);
