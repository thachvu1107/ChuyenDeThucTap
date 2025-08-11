import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { Api } from "./../../api/Api";
import { ImageApi } from "../../api/ImageApi";

const formatVND = (price) => {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};
class ShoppingCart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: "",
      loading: false,
      subtotal: 0,
      total: 0,
      cartList: [],
      selectedList: [],
      selectedItems: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCheckout = this.handleCheckout.bind(this);
  }

  componentDidMount() {
    const { user } = this.props;
    const savedSubtotal = localStorage.getItem("subtotal");
    const savedTotal = localStorage.getItem("total");
    const savedSelectedList = JSON.parse(localStorage.getItem("selectedList"));
    const savedSelectedItems = JSON.parse(
      localStorage.getItem("selectedItems")
    );
    if (savedSubtotal && savedTotal) {
      this.setState({
        subtotal: parseFloat(savedSubtotal),
        total: parseFloat(savedTotal),
        selectedList: savedSelectedList || [],
        selectedItems: savedSelectedItems || [],
      });
    }

    if (user && user !== "guest") {
      if (user.id !== this.state.userId) {
        this.getAuth(localStorage.getItem("token"));
      }
    } else if (localStorage.getItem("cartList")) {
      this.getGuestShoppingCartList(localStorage.getItem("cartList"));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;
    if (user !== prevProps.user) {
      if (user !== "guest" && user.id !== this.state.userId) {
        this.getAuth(localStorage.getItem("token"));
      } else if (user === "guest" && this.state.userId !== "") {
        this.getGuestShoppingCartList(localStorage.getItem("cartList"));
      }
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
        if (localStorage.getItem("cartList")) {
          this.saveToShoppingCart(localStorage.getItem("cartList"));
        } else {
          this.getShoppingCartList(result.data.user.id);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        if (localStorage.getItem("cartList")) {
          this.getGuestShoppingCartList(localStorage.getItem("cartList"));
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  getShoppingCartList(userId) {
    this.setState({ loading: true });
    axios
      .get(`${Api}/product/cart-list/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        this.setState({
          cartList: response.data,
          loading: false,
        });
        this.props.updateCartCount(response.data.length);
        this.calcTotal(this.state.selectedList);
      })
      .catch((error) => {
        console.error("Error:", error);
        this.setState({ loading: false });
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
          cartList: response.data,
        });
        this.props.updateCartCount(response.data.length);
        this.calcTotal(this.state.selectedList);
      })
      .catch((error) => {
        console.error("Error:", error);
        this.setState({ loading: false });
      });
  }

  saveToShoppingCart(localCartList) {
    axios
      .post(
        `${Api}/product/cart-list`,
        { localCartList },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        this.getShoppingCartList(this.state.userId);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleChange(e) {
    const { id, type, className, value } = e.target;

    if (type === "checkbox") {
      let updatedSelectedList = [...this.state.selectedList];
      let updatedSelectedItems = [...this.state.selectedItems];
      if (id === "0") {
        if (this.state.selectedList.length === this.state.cartList.length) {
          updatedSelectedList = [];
          updatedSelectedItems = [];
        } else {
          updatedSelectedList = this.state.cartList.map((item) => item.id);
          updatedSelectedItems = this.state.cartList.map((item) => ({
            id: item.id,
            productId: item.stock.product.id,
            name: item.stock.product.name,
            size: item.stock.size,
            color: item.stock.color,
            quantity: item.quantity,
            price: item.stock.product.price,
            photo: item.stock.product.photo,
          }));
        }
      } else {
        const itemId = parseInt(id);
        if (updatedSelectedList.includes(itemId)) {
          updatedSelectedList = updatedSelectedList.filter(
            (item) => item !== itemId
          );
          updatedSelectedItems = updatedSelectedItems.filter(
            (item) => item.id !== itemId
          );
        } else {
          updatedSelectedList.push(itemId);
          const selectedItem = this.state.cartList.find(
            (item) => item.id === itemId
          );
          updatedSelectedItems.push({
            id: selectedItem.id,
            productId: selectedItem.stock.product.id,
            name: selectedItem.stock.product.name,
            size: selectedItem.stock.size,
            color: selectedItem.stock.color,
            quantity: selectedItem.quantity,
            price: selectedItem.stock.product.price,
            photo: selectedItem.stock.product.photo,
          });
        }
      }
      this.setState({
        selectedList: updatedSelectedList,
        selectedItems: updatedSelectedItems,
      });
      localStorage.setItem("selectedList", JSON.stringify(updatedSelectedList));
      localStorage.setItem(
        "selectedItems",
        JSON.stringify(updatedSelectedItems)
      );
      this.calcTotal(updatedSelectedList);
    } else {
      const updatedCartList = this.state.cartList.map((item) => {
        if (item.id === parseInt(id)) {
          let quantity = item.quantity;

          if (className === "qty-up") {
            quantity += 1;
          } else if (className === "qty-down") {
            quantity = Math.max(quantity - 1, 1);
          } else if (type === "number") {
            quantity = parseInt(value);
          }

          if (quantity <= item.stock.quantity) {
            item.quantity = quantity;
          } else {
            item.quantity = item.stock.quantity;
          }
        }
        return item;
      });

      const updatedSelectedItems = this.state.selectedItems.map(
        (selectedItem) => {
          const updatedItem = updatedCartList.find(
            (item) => item.id === selectedItem.id
          );
          if (updatedItem) {
            return {
              ...selectedItem,
              quantity: updatedItem.quantity,
            };
          }
          return selectedItem;
        }
      );

      this.setState({
        cartList: updatedCartList,
        selectedItems: updatedSelectedItems,
      });
      localStorage.setItem(
        "selectedItems",
        JSON.stringify(updatedSelectedItems)
      );
      axios
        .put(`${Api}/product/cart-list/${id}`, {
          quantity: updatedCartList.find((item) => item.id === parseInt(id))
            .quantity,
        })
        .then((response) => {
          this.calcTotal(this.state.selectedList);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  calcTotal(selectedList) {
    let subtotal = 0;

    this.state.cartList.forEach((item) => {
      if (selectedList.includes(item.id)) {
        subtotal += item.stock.product.price * item.quantity;
      }
    });

    this.setState({
      subtotal: subtotal,
      total: subtotal,
    });
    localStorage.setItem("subtotal", subtotal.toFixed(2));
    localStorage.setItem("total", subtotal.toFixed(2));
  }

  handleDelete(e) {
    const id = parseInt(e.target.id);

    if (this.state.userId) {
      axios
        .delete(`${Api}/product/cart-list/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          const updatedSelectedList = this.state.selectedList.filter(
            (item) => item !== id
          );
          const updatedSelectedItems = this.state.selectedItems.filter(
            (item) => item.id !== id
          );
          this.calcTotal(updatedSelectedList);
          this.setState({
            selectedList: updatedSelectedList,
            selectedItems: updatedSelectedItems,
          });
          localStorage.setItem(
            "selectedList",
            JSON.stringify(updatedSelectedList)
          );
          localStorage.setItem(
            "selectedItems",
            JSON.stringify(updatedSelectedItems)
          );

          this.calcTotal(updatedSelectedList);
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
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      let items = JSON.parse(localStorage.getItem("cartList"));
      items = items.filter((item, index) => index + 1 !== id);
      const updatedSelectedList = this.state.selectedList.filter(
        (item) => item !== id
      );
      const updatedSelectedItems = this.state.selectedItems.filter(
        (item) => item.id !== id
      );
      this.setState({
        selectedList: updatedSelectedList,
        selectedItems: updatedSelectedItems,
      });

      localStorage.setItem("selectedList", JSON.stringify(updatedSelectedList));
      localStorage.setItem(
        "selectedItems",
        JSON.stringify(updatedSelectedItems)
      );

      localStorage.setItem("cartList", JSON.stringify(items));
      this.getGuestShoppingCartList(JSON.stringify(items));
      this.calcTotal(updatedSelectedList);
    }
  }

  handleCheckout(e) {
    const id = parseInt(e.target.id);
    let selectedCheckout = [];
    let selectedCheckoutItems = [];

    if (id !== 0) {
      selectedCheckout = [id];
      selectedCheckoutItems = this.state.selectedItems.filter(
        (item) => item.id === id
      );
    } else {
      selectedCheckout = this.state.selectedList;
      selectedCheckoutItems = this.state.selectedItems;
    }

    localStorage.setItem("selectedList", JSON.stringify(selectedCheckout));
    localStorage.setItem(
      "selectedItems",
      JSON.stringify(selectedCheckoutItems)
    );
    localStorage.setItem("checkoutTotal", this.state.total.toFixed(2));
  }

  render() {
    const { cartList, loading, subtotal, total, selectedList } = this.state;

    return (
      <React.Fragment>
        {/* BREADCRUMB */}
        <div id="breadcrumb" className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h3 className="breadcrumb-header">Giỏ hàng</h3>
                <ul className="breadcrumb-tree">
                  <li>
                    <a href="/">TRang chủ</a>
                  </li>
                  <li className="active">Giỏ hàng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* /BREADCRUMB */}

        {/* SECTION */}
        <div className="section">
          <div className="container">
            <div className="row">
              {/* Orders */}
              <div className="col-md-7 cart-items">
                <div className="section-title cart-item">
                  <h3 className="title">
                    Giỏ hàng {cartList.length > 0 && `(${cartList.length})`}
                  </h3>
                  <div className="checkbox-select-all">
                    <div className="input-checkbox">
                      <input
                        name="selectAll"
                        type="checkbox"
                        id={0}
                        checked={
                          cartList.length > 0 &&
                          selectedList.length === cartList.length
                        }
                        onChange={this.handleChange}
                      />
                      <label htmlFor={0} className="px-4">
                        <span></span>
                        Chọn tất cả
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                {loading ? (
                  <div className="spinner-container">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  cartList.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="media cart-item-box">
                        <div className="input-checkbox">
                          <input
                            type="checkbox"
                            id={item.id}
                            checked={selectedList.includes(item.id)}
                            onChange={this.handleChange}
                          />
                          <label htmlFor={item.id}>
                            <span></span>
                          </label>
                        </div>

                        <img
                          height="100"
                          width="100"
                          className="align-self-start mr-3"
                          src={`${ImageApi}/img/${item.stock.product.photo}`}
                          alt={item.stock.product.photo}
                        />
                        <div className="media-body cart-item-body">
                          <h5 className="mt-0 product-name">
                            <Link to={`/products/${item.stock.product.id}`}>
                              {item.stock.product.name}
                            </Link>
                          </h5>
                          <div>
                            <div>
                              <strong>Kích thước:</strong> {item.stock.size}{" "}
                              <strong>Màu sắc:</strong> {item.stock.color}
                              <div className="buy-item">
                                <div className="qty-label">
                                  Số lượng:
                                  <div className="input-number">
                                    <input
                                      id={item.id}
                                      type="number"
                                      value={item.quantity}
                                      onChange={this.handleChange}
                                    />
                                    <span
                                      id={item.id}
                                      className="qty-up"
                                      onClick={this.handleChange}
                                    >
                                      +
                                    </span>
                                    <span
                                      id={item.id}
                                      className="qty-down"
                                      onClick={this.handleChange}
                                    >
                                      -
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <sub>
                              <strong>Miễn phí vận chuyển</strong>
                            </sub>
                          </div>
                          <h4 className="product-price">
                            {formatVND(item.stock.product.price)}
                          </h4>
                        </div>
                        <div className="delete-icon">
                          <i
                            id={item.id}
                            onClick={this.handleDelete}
                            className="fa fa-trash"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* /Cart Items */}
              </div>
              {/* /Orders */}

              {/* Order Summary */}
              <div className="col-md-4 cart-details">
                <div className="section-title text-center">
                  <h3 className="title">Tóm tắt đơn hàng</h3>
                </div>
                <div className="cart-summary">
                  <div className="order-col">
                    <div>Tổng cộng</div>
                    <div>{formatVND(Number(subtotal.toFixed(2)))}</div>
                  </div>
                  <div className="order-col">
                    <div>Vận chuyển</div>
                    <div>
                      <strong>MIỄN PHÍ</strong>
                    </div>
                  </div>
                  <hr />
                  <div className="order-col">
                    <div>
                      <strong>TỔNG CỘNG</strong>
                    </div>
                    <div>
                      <strong
                        className={
                          selectedList.length !== 0
                            ? "order-total"
                            : "order-total-disabled"
                        }
                      >
                        {/* ${total.toFixed(2)} */}
                        <div>{formatVND(total)}</div>
                      </strong>
                    </div>
                  </div>
                </div>
                <Link
                  id={0}
                  onClick={this.handleCheckout}
                  to={"/checkout"}
                  className={
                    selectedList.length !== 0
                      ? "primary-btn order-submit"
                      : "primary-btn order-submit-disabled"
                  }
                >
                  Thanh toán{" "}
                  {selectedList.length !== 0 && `(${selectedList.length})`}
                </Link>
                {/* Vi vnpay
								<button onClick={this.handleVNPAYCheckout} className="btn btn-success">
									VNPAY Checkout
								</button> */}
              </div>

              {/* /Order Summary */}
            </div>
            {/* /row */}
          </div>
          {/* /container */}
        </div>
        {/* /SECTION */}
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
    updateCartCount: (cartCount) =>
      dispatch({ type: "CART_COUNT", value: cartCount }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ShoppingCart);
