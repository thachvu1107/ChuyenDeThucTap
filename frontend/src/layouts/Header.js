import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { Api } from "./../api/Api";
import Authentification from "./../components/auth/Authentification";
import CartPreview from "./../components/home/CartPreview";
import "./../components/css/header.css";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItemCount: 0,
      wishlistCount: 0,
      searchTerm: "",
    };
  }

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

  handleSearchSubmit(event) {
    event.preventDefault();
    this.setState({ searchTerm: this.state.searchTerm });
  }

  handleSearchInputChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    return (
      <header>
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
                  className="d-flex"
                  onSubmit={(event) => this.handleSearchSubmit(event)}
                >
                  <select
                    className="form-select me-2"
                    style={{ maxWidth: "50px" }}
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
                    onChange={(event) => this.handleSearchInputChange(event)}
                  />
                  <Link
                    to={
                      this.state.searchTerm
                        ? `/search/${this.state.searchTerm}`
                        : "#"
                    }
                  >
                    <button
                      className="btn btn-danger ms-2"
                      disabled={!this.state.searchTerm}
                    >
                      Tìm kiếm
                    </button>
                  </Link>
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
                    {/* <a href="st" className="text-dark text-decoration-none">
                      <i className="fa fa-bars"></i>
                      <span className="ms-1">Menu</span>
                    </a> */}
                    <div className="d-flex align-items-center">
                      <Authentification />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cartCount: state.cart_count,
    wishlistCount: state.wishlist_count,
    userData: state.user_data,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateCartCount: (count) => dispatch({ type: "CART_COUNT", value: count }),
    updateWishlistCount: (count) =>
      dispatch({ type: "WISHLIST_COUNT", value: count }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
