import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import Pagination from "react-js-pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Api } from "../../api/Api";
import { ImageApi } from "./../../api/ImageApi";

const formatVND = (price) => {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

class Wishlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "",
      currentPage: 1,
      perPage: 0,
      total: 0,
      loading: true,
      wishlist: [],
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    if (localStorage.getItem("token")) {
      this.getWishlist(1);
    } else {
      // this.props.showLogin()
      toast.error("Đăng nhập để xem danh mục yêu thích!");
    }
  }

  getWishlist(pageNumber) {
    this.setState({ loading: true });
    axios
      .get(`${Api}/product/wishlist?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((result) => {
        if (result.data.data.length > 0)
          this.setState({
            currentPage: result.data.current_page,
            perPage: result.data.per_page,
            total: result.data.total,
          });

        this.setState({
          wishlist: [...result.data.data],
          loading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate() {
    if (this.props.user && this.props.user !== "guest") {
      if (this.props.user.id !== this.state.userId) {
        this.setState({ userId: this.props.user.id });
        this.getWishlist(1);
      }
    }
  }

  handleClick(e) {
    let id = e.target.id;

    this.props.showQuickView(id);
  }

  handleDelete(e) {
    let id = e.target.id;

    axios
      .delete(`${Api}/product/wishlist/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        if (response.status === 200) {
          let page = this.state.currentPage;

          if (response.data % this.state.perPage == 0)
            page = this.state.currentPage - 1;

          this.getWishlist(page);
          this.props.updateWishlistCount(response.data);
        }
      });
  }

  render() {
    return (
      <React.Fragment>
        {/* <!-- BREADCRUMB --> */}
        <div id="breadcrumb" className="section">
          {/* <!-- container --> */}
          <div className="container">
            <ToastContainer />
            {/* <!-- row --> */}
            <div className="row">
              <div className="col-md-12">
                <h3 className="breadcrumb-header">Danh sách yêu thích</h3>
                <ul className="breadcrumb-tree">
                  <li>
                    <a href="#">Trang chủ</a>
                  </li>
                  <li className="active">wishlist</li>
                </ul>
              </div>
            </div>
            {/* <!-- /row --> */}
          </div>
          {/* <!-- /container --> */}
        </div>
        {/* <!-- /BREADCRUMB --> */}

        {/* <!-- SECTION --> */}
        <div className="section">
          {/* <!-- container --> */}
          <div className="container">
            {/* <!-- row --> */}
            <div className="row">
              <table id="wishlist">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}></th>
                    <th style={{ width: "25%" }}>Tên sản phẩm</th>
                    <th style={{ width: "20%", textAlign: "center" }}>Giá</th>
                    <th style={{ width: "20%", textAlign: "center" }}>
                      Số lượng
                    </th>
                    <th style={{ width: "20%" }}></th>
                    <th style={{ width: "10%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {localStorage.getItem("token") ? (
                    this.state.loading ? (
                      <tr>
                        <td colSpan="6">
                          <div className="spinner-container">
                            <Spinner animation="border" />
                          </div>
                        </td>
                      </tr>
                    ) : (
                      this.state.wishlist.length > 0 &&
                      this.state.wishlist.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img
                              height="100"
                              width="100"
                              src={`${ImageApi}/img/${item.product.photo}`}
                              alt={item.product.name}
                            />
                          </td>
                          <td>
                            <h2 className="product-name">
                              <Link to={`/products/${item.product.id}`}>
                                {item.product.name}
                              </Link>
                            </h2>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {formatVND(item.product.price)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.stock ? "Avaiable" : "Not Avaiable"}
                          </td>
                          <td className="product-column">
                            <div className="add-to-cart">
                              <button
                                id={item.product.id}
                                className="add-to-cart-btn"
                                onClick={this.handleClick}
                              >
                                Thêm giỏ hàng
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="delete-wishlist-icon">
                              <i
                                id={item.id}
                                onClick={this.handleDelete}
                                className="fa fa-trash"
                                aria-hidden="true"
                              ></i>
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-5">
                        <h3>
                          Vui lòng đăng nhập để có thể thêm hoặc xem sản phẩm
                          trong danh sách mong muốn của bạn!
                        </h3>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {this.state.wishlist.length > 0 &&
                this.state.total > this.state.perPage && (
                  <div className="pagination-container">
                    <Pagination
                      activePage={this.state.currentPage}
                      itemsCountPerPage={this.state.perPage}
                      totalItemsCount={this.state.total}
                      pageRangeDisplayed={5}
                      onChange={(pageNumber) => this.getWishlist(pageNumber)}
                      itemClass="page-item"
                      linkClass="page-link"
                      firstPageText="First"
                      lastPageText="Last"
                    />
                  </div>
                )}
            </div>
            {/* <!-- /row --> */}
          </div>
          {/* <!-- /container --> */}
        </div>
        {/* <!-- /SECTION --> */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user_data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showLogin: () => dispatch({ type: "LOGIN_CONTROL", value: true }),
    showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
    updateWishlistCount: (count) =>
      dispatch({ type: "WISHLIST_COUNT", value: count }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Wishlist);
