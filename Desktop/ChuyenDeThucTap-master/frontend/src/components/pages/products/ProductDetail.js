import { connect } from "react-redux";
import React, { Component } from "react";
import axios from "axios";
import { Spinner, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { Api } from "./../../../api/Api";
import { ImageApi } from "../../../api/ImageApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductItem from "./ProductItem";
function withRouter(Component) {
  function ComponentWithRouterProps(props) {
    const params = useParams();
    return <Component {...props} params={params} />;
  }
  return ComponentWithRouterProps;
}

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      reviewsPerPage: 2,
      userId: "",
      loading: true,
      cartLoading: false,
      cartButtonInit: true,
      productId: "",
      product: "",
      stocks: [],
      selectedSize: "",
      selectedColor: "",
      cartCount: "",
      quantity: 1,
      avaibleQuantity: "",
      relatedProducts: [], // Added state for related products
      reviews: [], // State for reviews
      reviewName: "",
      reviewEmail: "", // State for email
      reviewRating: 1,
      reviewComment: "",
      activeTab: "tab1",
      settings: {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleWishlist = this.handleWishlist.bind(this);
  }

  handleTabClick = (tabId) => {
    this.setState({ activeTab: tabId });
  };

  getProduct(id) {
    this.setState({ loading: true });
    console.log("Fetching product with ID:", id);
    axios
      .get(`${Api}/products/${id}`)
      .then((response) => {
        console.log("API call successful:", response);
        const product = response.data;
        this.setState({
          productId: id,
          product: product,
          stocks: [...product.stocks],
          loading: false,
        });
        this.getRelatedProducts(product.category.id); // Fetch related products
        this.getReviews(id); // Fetch reviews for the product
      })
      .catch((error) => {
        this.setState({ loading: false });
        console.error("API call failed:", error);
      });
  }

  getRelatedProducts(categoryId) {
    let query = this.props.id === 1 ? "new" : "top-selling";
    axios
      .get(`${Api}/product/categories/${categoryId}/${query}`)
      .then((response) => {
        console.log("API call successful Category:", response);
        this.setState({
          relatedProducts: [...response.data], // Set related products
        });
      })
      .catch((error) => {
        console.log("Error fetching related products:", error);
      });
  }

  getReviews(productId) {
    axios
      .get(`${Api}/reviews/${productId}`)
      .then((response) => {
        console.log("API call successful for reviews:", response);
        this.setState({
          reviews: [...response.data], // Set reviews
        });
      })
      .catch((error) => {
        console.log("Error fetching reviews:", error);
      });
  }

  handleReviewSubmit = (e) => {
    e.preventDefault();
    const { reviewName, reviewEmail, reviewRating, reviewComment, productId } =
      this.state;
    axios
      .post(`${Api}/reviews`, {
        product_id: productId,
        name: reviewName,
        email: reviewEmail,
        rating: reviewRating,
        review: reviewComment,
      })
      .then((response) => {
        console.log("Review submitted successfully:", response);
        this.getReviews(productId); // Fetch updated reviews
        this.setState({
          reviewName: "",
          reviewEmail: "",
          reviewRating: 1,
          reviewComment: "",
        });
      })
      .catch((error) => {
        console.log("Error submitting review:", error);
      });
  };

  handleMouseLeave() {
    this.setState({ cartButtonInit: true });
  }

  handleWishlist(e) {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      toast.error("Cần đăng nhập!");
    } else {
      axios
        .post(
          `${Api}/product/wishlist`,
          {
            productId: e.target.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            this.props.updateWishlistCount(response.data);
            this.props.showToast("Added to wishlist!");
            toast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
          }
        })
        .catch((error) => {
          this.props.showToast("Product is already in the wishlist!");
          toast.success("Sản phẩm đã có trong danh sách yêu thích!");
        });
    }
  }

  handleClick(e) {
    const id = e.target.id;
    if (e.target.className == "add-to-cart-btn") {
      this.props.showQuickView(id);
    } else if (
      e.target.className == "qucik-view q q-primary" ||
      e.target.className == "fa fa-eye"
    ) {
      this.props.showQuickView(id);
    } else {
      e.preventDefault();

      this.getProduct(id);
      this.setState({ currentCategory: id });
    }
  }

  componentDidMount() {
    const { productId } = this.props.params; // Accessing productId from params
    this.getProduct(productId);
  }

  componentDidUpdate(prevProps) {
    const { productId } = this.props.params; // Accessing productId from params
    if (productId !== prevProps.params.productId) {
      this.getProduct(productId);
    }
  }

  handleSizeChange = (e) => {
    this.setState({ selectedSize: e.target.value });
  };

  handleColorChange = (e) => {
    this.setState({ selectedColor: e.target.value });
  };

  handleQuantityChange = (action) => {
    const { quantity } = this.state;
    if (action === "increase") {
      this.setState({ quantity: quantity + 1 });
    } else if (action === "decrease" && quantity > 1) {
      this.setState({ quantity: quantity - 1 });
    }
  };

  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };
  render() {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const { productId } = this.props.params; // Accessing productId from params
    const {
      loading,
      product,
      settings,
      avaibleQuantity,
      quantity,
      cartButtonInit,
      cartLoading,
      stocks,
      selectedSize,
      selectedColor,
      relatedProducts, // Added to render related products
      reviews, // Added to render reviews
      reviewName,
      reviewEmail,
      reviewRating,
      reviewComment,
      activeTab,
      currentPage,
      reviewsPerPage,
    } = this.state;

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    if (loading) {
      return <Spinner animation="border" />;
    }
    return (
      <div>
        <div id="breadcrumb" className="section">
          <ToastContainer />
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <ul className="breadcrumb-tree">
                  <li>
                    <a href="\">Home</a>
                  </li>
                  <li>
                    <a href="\">All Categories</a>
                  </li>
                  <li>
                    <a href="#">{product.category.name}</a>
                  </li>
                  <li className="active">{product.name}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Modal.Body>
          <div className="section">
            <div className="container">
              <div className="row">
                <div className="col-md-6 col-md-push-2">
                  <div id="product-main-imgs">
                    <div id="product-imgs">
                      <div className="product-preview">
                        <img
                          src={`${ImageApi}/img/${product.photo}`}
                          style={{ width: "80%" }}
                          alt={product.photo}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="product-details">
                    <h2 className="product-name">{product.name}</h2>
                    <div>
                      <div className="product-rating">
                        <i
                          className={
                            product.review >= 1
                              ? "fa fa-star"
                              : product.review > 0 && product.review < 1
                              ? "fa fa-star-half-o"
                              : "fa fa-star-o"
                          }
                        ></i>
                        <i
                          className={
                            product.review >= 2
                              ? "fa fa-star"
                              : product.review > 1 && product.review < 2
                              ? "fa fa-star-half-o"
                              : "fa fa-star-o"
                          }
                        ></i>
                        <i
                          className={
                            product.review >= 3
                              ? "fa fa-star"
                              : product.review > 2 && product.review < 3
                              ? "fa fa-star-half-o"
                              : "fa fa-star-o"
                          }
                        ></i>
                        <i
                          className={
                            product.review >= 4
                              ? "fa fa-star"
                              : product.review > 3 && product.review < 4
                              ? "fa fa-star-half-o"
                              : "fa fa-star-o"
                          }
                        ></i>
                        <i
                          className={
                            product.review == 5
                              ? "fa fa-star"
                              : product.review > 4 && product.review < 5
                              ? "fa fa-star-half-o"
                              : "fa fa-star-o"
                          }
                        ></i>
                      </div>
                      <a className="review-link" href="#">
                        {product.num_reviews} đánh giá | Thêm đánh giá của bạn
                      </a>
                    </div>
                    <div>
                      <h3 className="product-price">
                        {(product.price * 0.9).toLocaleString("vi-VN")}₫{" "}
                        <del className="product-old-price">
                          {product.price.toLocaleString("vi-VN")}₫
                        </del>
                      </h3>
                      <span className="product-available">Còn hàng</span>
                    </div>
                    <p>{product.details}</p>

                    <div className="product-options">
                      <label>
                        Kích cỡ &nbsp;&nbsp;
                        <select
                          className="input-select"
                          value={selectedSize}
                          onChange={this.handleSizeChange}
                        >
                          {stocks.map((stock) => (
                            <option key={stock.size} value={stock.size}>
                              {stock.size}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        &nbsp;&nbsp;Màu sắc&nbsp;&nbsp;
                        <select
                          className="input-select"
                          value={selectedColor}
                          onChange={this.handleColorChange}
                        >
                          {stocks.map((stock) => (
                            <option key={stock.color} value={stock.color}>
                              {stock.color}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="add-to-cart">
                      <div className="qty-label">
                        Số lượng
                        <div className="input-number">
                          <button
                            className="qty-down"
                            onClick={() =>
                              this.handleQuantityChange("decrease")
                            }
                          >
                            -
                          </button>
                          <input type="number" value={quantity} readOnly />
                          <button
                            className="qty-up"
                            onClick={() =>
                              this.handleQuantityChange("increase")
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        id={product.id}
                        className="add-to-cart-btn"
                        onClick={this.handleClick}
                      >
                        <i className="fa fa-shopping-cart"></i> Thêm vào giỏ
                      </button>
                    </div>

                    <ul className="product-btns">
                      <li>
                        <a
                          href="#"
                          id={product.id}
                          onClick={this.handleWishlist}
                        >
                          <i className="fa fa-heart-o"></i> Thêm vào yêu thích
                        </a>
                      </li>
                      {/* <li>
                        <a href="#">
                          <i className="fa fa-exchange"></i> So sánh
                        </a>
                      </li> */}
                      {/* <li>
                        <a href="#" id={product.id} onClick={this.handleClick}>
                          <i className="fa fa-eye"></i> Xem nhanh
                        </a>
                      </li> */}
                    </ul>

                    <div className="product-links">
                      <li>Danh mục:</li>
                      <li>
                        <a href="#">{product.category.name}</a>
                      </li>
                    </div>

                    <ul className="product-links">
                      <li>Chia sẻ:</li>
                      <li>
                        <a href="#">
                          <i className="fa fa-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-google-plus"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa fa-envelope"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div id="product-tab">
                  <ul className="tab-nav">
                    <li className={activeTab === "tab1" ? "active" : ""}>
                      <a
                        href="#tab1"
                        onClick={() => this.handleTabClick("tab1")}
                      >
                        Mô tả sản phẩm
                      </a>
                    </li>
                    <li className={activeTab === "tab2" ? "active" : ""}>
                      <a
                        href="#tab2"
                        onClick={() => this.handleTabClick("tab2")}
                      >
                        Chi tiết sản phẩm
                      </a>
                    </li>
                    <li className={activeTab === "tab3" ? "active" : ""}>
                      <a
                        href="#tab3"
                        onClick={() => this.handleTabClick("tab3")}
                      >
                        Đánh giá ({reviews.length})
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div
                      id="tab1"
                      className={`tab-pane ${
                        activeTab === "tab1" ? "active in" : "fade"
                      }`}
                      style={{ textAlign: "center" }}
                    >
                      <p>{product.description}</p>
                    </div>
                    <div
                      id="tab2"
                      className={`tab-pane ${
                        activeTab === "tab2" ? "active in" : "fade"
                      }`}
                      style={{ textAlign: "center" }}
                    >
                      <p>{product.details}</p>
                    </div>
                    <div
                      id="tab3"
                      className={`tab-pane ${
                        activeTab === "tab3" ? "active in" : "fade"
                      }`}
                    >
                      <div className="row">
                        <div className="col-md-6">
                          <h4 className="text-uppercase">Review của bạn</h4>
                          <p>Địa chỉ email của bạn sẽ không được công bố.</p>
                          <form
                            className="review-form"
                            onSubmit={this.handleReviewSubmit}
                          >
                            <div className="form-group">
                              <input
                                className="input"
                                type="text"
                                placeholder="Tên"
                                value={reviewName}
                                onChange={(e) =>
                                  this.setState({ reviewName: e.target.value })
                                }
                                required
                              />
                            </div>
                            <div className="form-group">
                              <textarea
                                className="input"
                                placeholder="Đánh giá"
                                value={reviewComment}
                                onChange={(e) =>
                                  this.setState({
                                    reviewComment: e.target.value,
                                  })
                                }
                                required
                              ></textarea>
                            </div>
                            <input
                              type="email"
                              className="input" // Email input field
                              placeholder="Email"
                              value={reviewEmail}
                              onChange={(e) =>
                                this.setState({ reviewEmail: e.target.value })
                              }
                              required
                            />
                            <div className="form-group">
                              <div className="input-rating">
                                <strong>Đánh giá: </strong>
                                <div className="stars">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <React.Fragment key={rating}>
                                      <input
                                        id={`star${rating}`}
                                        name="rating"
                                        type="radio"
                                        value={rating}
                                        checked={reviewRating === rating}
                                        onChange={(e) =>
                                          this.setState({
                                            reviewRating: parseInt(
                                              e.target.value
                                            ),
                                          })
                                        }
                                      />
                                      <label htmlFor={`star${rating}`}></label>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary">
                              Gửi
                            </button>
                          </form>
                        </div>
                        <div className="col-md-6">
                          <div className="product-reviews">
                            {currentReviews.length > 0 ? (
                              currentReviews.map((review) => (
                                <div className="card mb-3" key={review.id}>
                                  <div className="card-header">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <h5 className="name">{review.name}</h5>
                                      <p className="date">
                                        Thời gian:{" "}
                                        {formatDate(review.created_at)}
                                      </p>
                                    </div>
                                    <div className="review-rating">
                                      {[...Array(5)].map((_, i) => (
                                        <i
                                          key={i}
                                          className={`fa fa-star${
                                            i < review.rating ? "" : "-o"
                                          } text-warning`}
                                        ></i>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="card-body">
                                    <p className="card-text">
                                      Nhận xét: {review.review}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>Chưa có đánh giá nào.</p>
                            )}
                          </div>
                          {reviews.length > reviewsPerPage && (
                            <ul className="pagination justify-content-center">
                              {Array.from(
                                {
                                  length: Math.ceil(
                                    reviews.length / reviewsPerPage
                                  ),
                                },
                                (_, index) => (
                                  <li
                                    key={index}
                                    className={`page-item ${
                                      currentPage === index + 1 ? "active" : ""
                                    }`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() => this.paginate(index + 1)}
                                    >
                                      {index + 1}
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>

        {/* <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-title text-center">
                  <h3 className="title">Sản phẩm liên quan</h3>
                </div>
              </div>
              {relatedProducts.map((relatedProduct) => (
                <div className="col-md-3 col-xs-6" key={relatedProduct.id}>
                  <div className="product">
                    <div className="product-img">
                      <img
                        src={`${ImageApi}/img/${relatedProduct.photo}`}
                        alt={relatedProduct.name}
                      />
                      <div className="product-label">
                        {relatedProduct.new && <span className="new">MỚI</span>}
                      </div>
                    </div>
                    <div className="product-body">
                      <p className="product-category">
                        {relatedProduct.category.name}
                      </p>
                      <h3 className="product-name">
                        <Link to={`/product/${relatedProduct.id}`}>
                          {relatedProduct.name}
                        </Link>
                      </h3>
                      <h4 className="product-price">
                        {(
                          relatedProduct.price -
                          relatedProduct.price * 0.1
                        ).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                        <del className="product-old-price">
                          {relatedProduct.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </del>
                      </h4>
                      <div className="product-rating"></div>
                      <div className="product-btns">
                        <Button
                          id={product.id}
                          className="add-to-wishlist"
                          onClick={this.handleWishlist}
                          bsPrefix="q"
                        >
                          <i id={product.id} className="fa fa-heart-o"></i>
                          <span className="tooltipp">Thêm vào yêu thích</span>
                        </Button>
                        <button className="add-to-compare">
                          <i className="fa fa-exchange"></i>
                          <span className="tooltipp">So sánh</span>
                        </button>
                        <button className="quick-view">
                          <i className="fa fa-eye"></i>
                          <span className="tooltipp">Xem nhanh</span>
                        </button>
                      </div>
                    </div>
                    <div className="add-to-cart">
                      <button
                        id={product.id}
                        className="add-to-cart-btn"
                        onClick={this.handleClick}
                      >
                        <i
                          id={product.id}
                          onClick={this.handleClick}
                          className="fa fa-shopping-cart"
                        ></i>{" "}
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-title text-center">
                  <h3 className="title">Sản phẩm liên quan</h3>
                </div>
              </div>
              {relatedProducts.map((relatedProduct) => (
                <div className="col-md-3 col-xs-6" key={relatedProduct.id}>
                  <ProductItem product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    productId: state.product_id,
    showModal: state.show_modal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
    showLogin: () => dispatch({ type: "LOGIN_CONTROL", value: true }),
    updateWishlistCount: (count) =>
      dispatch({ type: "WISHLIST_COUNT", value: count }),
    showToast: (msg) => dispatch({ type: "SHOW_TOAST", value: msg }),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProductDetail)
);
