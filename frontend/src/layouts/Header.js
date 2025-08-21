import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { Api } from "./../api/Api";
import Authentification from "./../components/auth/Authentification";
import CartPreview from "./../components/home/CartPreview";
import "./../components/css/header.css";
import { withRouter } from "../utils/withRouter";
import debounce from "lodash/debounce";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItemCount: 0,
      wishlistCount: 0,
      searchTerm: "",
      searchResults: [],
      selectedCategory: "0",
      errorMessage: "",
    };
    this.isComposing = false;
    this.debouncedSearch = debounce(this.debouncedSearch.bind(this), 100);
  }

  debouncedSearch(query) {
    const trimmedQuery = query.trim();
    this.setState({ searchTerm: query, errorMessage: "" });

    if (trimmedQuery.length >= 2) {
      axios
        .get(`${Api}/search`, {
          params: { searchTerm: encodeURIComponent(trimmedQuery) },
        })
        .then((res) => {
          const results = res.data.data?.slice(0, 5) || [];
          this.setState({
            searchResults: results,
            errorMessage: results.length === 0 ? "Không tìm thấy sản phẩm" : "",
          });
        })
        .catch((error) => {
          console.error(
            "Search API error:",
            error.response?.data || error.message
          );
          this.setState({
            searchResults: [],
            errorMessage: "Lỗi khi tìm kiếm",
          });
        });
    } else {
      this.setState({ searchResults: [], errorMessage: "" });
    }
  }

  // handleSearchInputChange = (event) => {
  //   this.debouncedSearch(event.target.value);
  // };
    handleSearchInputChange = (event) => {
    if (!this.isComposing) {
      this.debouncedSearch(event.target.value);
    } else {
      // Nếu đang gõ tiếng Việt, không gọi API
      this.setState({ searchTerm: event.target.value });
    }
  };

  handleSearchSubmit = (event) => {
    event.preventDefault();
    const { searchTerm, selectedCategory } = this.state;
    if (!searchTerm.trim()) return;

    const categoryParam =
      selectedCategory !== "0" ? `?category=${selectedCategory}` : "";
    this.props.navigate(
      `/search/${encodeURIComponent(searchTerm)}${categoryParam}`
    );

    this.setState({ searchTerm: "", searchResults: [] });
  };

  componentDidMount() {
    if (localStorage.getItem("token")) {
      this.getShoppingCartCount();
      this.getWishlistCount();
    } else if (localStorage.getItem("cartList")) {
      this.props.updateCartCount(
        JSON.parse(localStorage.getItem("cartList")).length
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.cartCount !== prevProps.cartCount) {
      if (localStorage.getItem("token")) {
        this.getShoppingCartCount();
      } else if (localStorage.getItem("cartList")) {
        this.props.updateCartCount(
          JSON.parse(localStorage.getItem("cartList")).length
        );
      }
    }

    if (this.props.wishlistCount !== prevProps.wishlistCount) {
      if (localStorage.getItem("token")) {
        this.getWishlistCount();
      }
    }
  }

  async getShoppingCartCount() {
    try {
      const result = await axios.get(`${Api}/product/cart-list/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const localCartList = JSON.parse(localStorage.getItem("cartList")) || [];
      const stockList = localCartList.map((list) => list[0].stock_id);

      const cartList = [...stockList, ...result.data];
      const uniqueCartList = [...new Set(cartList)];

      this.setState({ cartItemCount: uniqueCartList.length });
      this.props.updateCartCount(uniqueCartList.length);
    } catch (error) {
      console.error(error);
    }
  }

  async getWishlistCount() {
    try {
      const result = await axios.get(`${Api}/product/wishlist/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      this.setState({ wishlistCount: result.data });
      this.props.updateWishlistCount(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const { searchTerm, searchResults, selectedCategory, errorMessage } =
      this.state;

    return (
      <header>
        {/* Top header */}
        <div id="top-header" className="bg-light py-2 border-bottom">
          <div className="container d-flex justify-content-between flex-wrap align-items-center small text-secondary">
            <ul className="list-unstyled d-flex gap-3 m-0">
              <li>
                <i className="fa fa-map-marker" /> 20 Tang Nhon Phu
              </li>
              <li>
                <i className="fa fa-envelope-o" /> vuthach11072004@gmail.com
              </li>
              <li>
                <i className="fa fa-phone" /> +84-0325493237
              </li>
              <li>
                <i className="fa fa-clock-o" /> 08:00 - 17:00
              </li>
            </ul>
          </div>
        </div>

        {/* Main header */}
        <div id="header" className="bg-white text-dark border-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-3">
                <Link to="/">
                  <img
                    src={require("../assets/img/LOGO-XE-DAP.png")}
                    style={{ width: "80%" }}
                    alt="Company Logo"
                  />
                </Link>
              </div>
              <div className="col-md-6">
                <form
                  className="d-flex position-relative"
                  onSubmit={this.handleSearchSubmit}
                  autoComplete="off"
                >
                  <select
                    className="form-select me-2"
                    style={{ maxWidth: "120px" }}
                    value={selectedCategory}
                    onChange={(e) =>
                      this.setState({ selectedCategory: e.target.value })
                    }
                  >
                    <option value="0">All</option>
                    <option value="1">Xe đạp nam</option>
                    <option value="2">Xe đạp nữ</option>
                    <option value="3">Xe đạp trẻ em</option>
                  </select>

                  <input
                    className="form-control"
                    placeholder="Tìm kiếm sản phẩm"
                    value={this.state.searchTerm}
                    onChange={this.handleSearchInputChange}
                    onCompositionStart={() => (this.isComposing = true)}
                    onCompositionEnd={(e) => {
                      this.isComposing = false;
                      this.debouncedSearch(e.target.value);
                    }}
                  />

                  {/* Dropdown search results */}
                  {(searchResults.length > 0 || errorMessage) && (
                    <ul className="search-dropdown">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            to={`/products/${product.id}`}
                            onClick={() =>
                              this.setState({
                                searchTerm: "",
                                searchResults: [],
                              })
                            }
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))}
                      {errorMessage && searchResults.length === 0 && (
                        <li className="text-danger px-2">{errorMessage}</li>
                      )}
                    </ul>
                  )}

                  <button
                    type="submit"
                    className="btn btn-danger ms-2"
                    disabled={!searchTerm.trim()}
                  >
                    Tìm kiếm
                  </button>
                </form>
              </div>
              <div className="col-md-3">
                <div className="d-flex justify-content-end align-items-center gap-3">
                  <Link
                    to="/wishlist"
                    className="text-dark text-decoration-none position-relative"
                  >
                    <i className="fa fa-heart"></i>
                    <span className="ms-1">Yêu thích</span>
                    {this.props.wishlistCount > 0 && (
                      <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                        {this.props.wishlistCount}
                      </span>
                    )}
                  </Link>

                  <div className="dropdown">
                    <Link
                      className="text-dark text-decoration-none position-relative"
                      to="/shopping-cart"
                    >
                      <i className="fa fa-shopping-cart"></i>
                      <span className="ms-1">Giỏ hàng</span>
                      {this.props.cartCount > 0 && (
                        <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                          {this.props.cartCount}
                        </span>
                      )}
                    </Link>
                    <CartPreview />
                  </div>

                  <div className="menu-toggle d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center">
                      <Authentification />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS cho dropdown */}
        <style>{`
          .search-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            border: 1px solid #ddd;
            z-index: 999;
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 300px;
            overflow-y: auto;
          }
          .search-dropdown li {
            padding: 8px 12px;
            cursor: pointer;
          }
          .search-dropdown li:hover {
            background-color: #f1f1f1;
          }
        `}</style>
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  cartCount: state.cart_count,
  wishlistCount: state.wishlist_count,
  userData: state.user_data,
});

const mapDispatchToProps = (dispatch) => ({
  updateCartCount: (count) => dispatch({ type: "CART_COUNT", value: count }),
  updateWishlistCount: (count) =>
    dispatch({ type: "WISHLIST_COUNT", value: count }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
