import React, { Component } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { Api } from "./../../api/Api";
import { ImageApi } from "./../../api/ImageApi";

class CartPreview extends Component {
  constructor() {
    super();
    this.state = {
      userId: "",
      loading: true,
      total: 0,
      cartList: [],
    };

    this.handleToggle = this.handleToggle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleVNPAYCheckout = this.handleVNPAYCheckout.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cartList !== this.state.cartList) {
      this.calcTotal();
    }
  }

  getAuth(token) {
    this.setState({ loading: true });
    axios
      .get(`${Api}/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        this.setState({ userId: result.data.user.id });

        if (localStorage.getItem("cartList"))
          this.saveToShoppingCart(localStorage.getItem("cartList"));
        else this.getShoppingCartList();
      })
      .catch((error) => {
        console.log(error);
        if (localStorage.getItem("cartList") !== null)
          this.getGuestShoppingCartList(localStorage.getItem("cartList"));
      });
  }

  getShoppingCartList() {
    axios
      .get(`${Api}/product/cart-list/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        let localCartList = null;
        if (localStorage.getItem("cartList") !== null)
          localCartList = localStorage.getItem("cartList");

        this.setState({
          cartList: [...response.data],
          localCartList: localCartList,
          loading: false,
        });

        this.update();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getGuestShoppingCartList(localCartList) {
    this.setState({ userId: "", loading: true });
    axios
      .post(`${Api}/product/cart-list/guest`, {
        cartList: localCartList,
      })
      .then((response) => {
        this.setState({
          loading: false,
          cartList: [...response.data],
        });
        this.update();
      });
  }

  update() {
    this.calcTotal();
    this.props.updateCartCount(this.state.cartList.length);
  }

  saveToShoppingCart(localCartList) {
    axios
      .post(
        `${Api}/product/cart-list`,
        {
          localCartList: localCartList,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        this.getShoppingCartList(this.state.userId);
      });
  }

  handleDelete(e) {
    let id = parseInt(e.target.id);

    if (this.state.userId) {
      axios
        .delete(`${Api}/product/cart-list/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          if (response.status === 200) {
            if (localStorage.getItem("cartList")) {
              let items = JSON.parse(localStorage.getItem("cartList"));
              items = items.filter(
                (item) =>
                  item[0].stock_id !== response.data.stock_id &&
                  item[0].userId !== response.data.user_id
              );
              localStorage.setItem("cartList", JSON.stringify(items));
            }
            this.getShoppingCartList(this.state.userId);
          }
        });
    } else {
      let items = JSON.parse(localStorage.getItem("cartList"));
      items = items.filter((item, index) => index + 1 !== id);
      localStorage.setItem("cartList", JSON.stringify(items));
      this.getGuestShoppingCartList(JSON.stringify(items));
    }
  }

  calcTotal() {
    let subtotal = 0;
    let shipping = 0;

    this.state.cartList.forEach((item) => {
      subtotal += item.stock.product.price * item.quantity;
    });

    this.setState({
      total: subtotal + shipping,
    });
  }

  handleToggle(isOpen) {
    if (isOpen)
      if (localStorage.getItem("token"))
        this.getAuth(localStorage.getItem("token"));
      else if (localStorage.getItem("cartList"))
        this.getGuestShoppingCartList(localStorage.getItem("cartList"));
  }

  handleVNPAYCheckout = () => {
    const token = localStorage.getItem("token");
    const { total } = this.state;

    axios
      .post(
        `${Api}/vnpay`,
        { amount: total },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data.code === "00") {
          window.location.href = response.data.data;
        } else {
          console.log("VNPay Error:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  render() {
    const token = localStorage.getItem("token");
    return (
      <Dropdown onToggle={this.handleToggle} bsPrefix="dropdown-arrow">
        <Dropdown.Toggle variant="toggle" id="dropdown-basic"></Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="cart-dropdown">
            <div className="cart-list">
              {this.state.loading ? (
                <div height="40px" className="loading-spinner">
                  <Spinner animation="border" />
                </div>
              ) : (
                <React.Fragment>
                  {this.state.cartList.length === 0 && <p>Giỏ hàng trống!</p>}
                  {this.state.cartList.map((item) => (
                    <div key={item.id} className="product-widget">
                      <div className="product-img">
                        <img
                          src={`${ImageApi}/img/${item.stock.product.photo}`}
                          alt={item.stock.product.photo}
                        />
                      </div>
                      <div className="product-body">
                        <h3 className="product-name">
                          <Link to={`/products/${item.stock.product.id}`}>
                            {item.stock.product.name}
                          </Link>
                        </h3>
                        <h4 className="product-price">
                          <span className="qty">{item.quantity}x</span>$
                          {item.stock.product.price}
                        </h4>
                      </div>
                      <button
                        id={item.id}
                        className="delete"
                        onClick={this.handleDelete}
                      >
                        <i id={item.id} className="fa fa-close"></i>
                      </button>
                    </div>
                  ))}
                </React.Fragment>
              )}
            </div>
            <div className="cart-summary">
              <small>{this.state.cartList.length} Sản phẩm được chọn</small>
              <h5>TỔNG: ${this.state.total.toFixed(2)}</h5>
            </div>
            <div className="cart-btns">
              <Link to="/shopping-cart">Xem giỏ hàng</Link>
              {!token ? (
                <Link to="/checkout">
                  Thanh toán <i className="fa fa-arrow-circle-right"></i>
                </Link>
              ) : (
                <Link to="#" onClick={this.handleVNPAYCheckout}>
                  Ví VNPay <i className="fa fa-arrow-circle-right"></i>
                </Link>
              )}
            </div>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCartCount: (cartCount) =>
      dispatch({ type: "CART_COUNT", value: cartCount }),
  };
};

export default connect(null, mapDispatchToProps)(CartPreview);
