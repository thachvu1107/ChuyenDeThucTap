import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import AddressCard from "./../stripe/AddressCard";
import { Api } from "./../../api/Api";
import "../css/PaymentButtons.css";
import { ImageApi } from "../../api/ImageApi";
import Swal from "sweetalert2";
import animationData from "../../assets/Loading Lottie animation.json";
import Lottie from "lottie-react";
const formatVND = (amount) => {
  if (!amount && amount !== 0) return "0 ₫";
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const userId = parseInt(localStorage.getItem("userId"), 10);
const flagUserId = parseInt(localStorage.getItem("userId"));

const flagChatKey = `flagChat:${flagUserId}`;
const flagChatStateKey = `flagChatState:${flagUserId}`;
class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      presistAddress: true,
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      country: "",
      zip: "",
      telephone: "",
      password: "",
      passwordConfirm: "",
      note: "",
      total: 0,
      redirect: false,
      checkoutList: [],
      selectedItems: JSON.parse(localStorage.getItem("selectedItems")) || [],
      vnpayCallbackProcessed: false,
      loadingPayment: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCashOnDelivery = this.handleCashOnDelivery.bind(this);
    this.handleVNPayPayment = this.handleVNPayPayment.bind(this);
    this.handleVnPaymentCallBack = this.handleVnPaymentCallBack.bind(this);
  }

  componentDidMount() {
    // Handle VNPay callback logic

    // Existing componentDidMount logic
    if (localStorage.getItem("selectedList")) {
      if (localStorage.getItem("token")) {
        this.getShoppingCartList();
      } else {
        this.getGuestShoppingCartList(localStorage.getItem("cartList"));
      }
    } else {
      if (!localStorage.getItem("checkoutList")) {
        this.setState({ redirect: true });
      } else {
        const list = JSON.parse(localStorage.getItem("checkoutList"));
        const total = parseFloat(localStorage.getItem("total")) || 0;
        this.setState({ checkoutList: list, total }, () => {
          if (!localStorage.getItem("total")) {
            this.calcTotal(list);
          }
        });
        if (localStorage.getItem("token") && !this.props.user) {
          this.getAuth(localStorage.getItem("token"));
        }
      }
    }
    this.calcTotal();
    this.handleVNPayCallback();
  }

  componentDidUpdate(prevProps) {
    if (this.props.user && this.props.user !== "guest") {
      if (prevProps.user.id !== this.props.user.id) {
        this.getUserDefaultAddress();
      }
    }
  }

  // Handle VNPay callback logic (replacing useEffect)
  handleVNPayCallback() {
    if (this.state.vnpayCallbackProcessed) return; // Thoát nếu đã xử lý
    const urlParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
    const vnp_TransactionStatus = urlParams.get("vnp_TransactionStatus");
    if (vnp_ResponseCode && vnp_TransactionStatus) {
      this.setState({ vnpayCallbackProcessed: true }); // Đánh dấu đã xử lý
      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        this.handleVnPaymentCallBack();
      } else {
        Swal.fire({
          icon: "error",
          text: `Thanh toán thất bại.`,
        });
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  getAuth(token) {
    console.log("🔐 Bắt đầu xác thực với token:", token);
    axios
      .get(`${Api}/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        const user = result.data.user;
        if (user) {
          this.props.addUser(user);
          this.getUserDefaultAddress();
        } else {
          console.warn("⚠️ Không tìm thấy user trong kết quả.");
        }
      })
      .catch((error) => {
        console.error("❌ Lỗi khi xác thực:", error);
      });
  }

  getShoppingCartList() {
    axios
      .get(`${Api}/product/cart-list/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        this.setState({
          checkoutList: [...response.data],
        });
        this.generateCheckoutList();
        this.getUserDefaultAddress();
      })
      .catch((error) => {
        console.error("Error fetching shopping cart:", error);
      });
  }

  getGuestShoppingCartList(localCartList) {
    axios
      .post(`${Api}/product/cart-list/guest`, {
        cartList: localCartList,
      })
      .then((response) => {
        this.setState({
          checkoutList: [...response.data],
        });
        this.generateCheckoutList();
      })
      .catch((error) => {
        console.error("Error fetching guest cart:", error);
      });
  }

  generateCheckoutList() {
    let checkoutList = this.state.checkoutList;
    let selectedList = JSON.parse(localStorage.getItem("selectedList"));

    if (localStorage.getItem("token")) {
      checkoutList = checkoutList.filter((item) =>
        selectedList.includes(item.id)
      );
    } else {
      checkoutList = checkoutList.filter((item, index) =>
        selectedList.includes(index + 1)
      );
    }

    localStorage.setItem("checkoutList", JSON.stringify(checkoutList));
    localStorage.removeItem("selectedList");

    this.setState({ checkoutList: [...checkoutList] });
    this.calcTotal(checkoutList);
  }

  calcTotal(checkoutList = this.state.checkoutList) {
    const total = parseFloat(localStorage.getItem("total")) || 0;
    this.setState({ total });
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    axios
      .post(`${Api}/user/create-user-address`, {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        address: this.state.address,
        city: this.state.city,
        country: this.state.country,
        zip: this.state.zip,
        telephone: this.state.telephone,
        password: this.state.password,
        passwordConfirm: this.state.passwordConfirm,
        localCartList: localStorage.getItem("cartList"),
      })
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        this.props.addUser(response.data.user);
        this.setState({ presistAddress: false });
      })
      .catch((error) => {
        console.error("Error creating user address:", error);
        Swal.fire({
          icon: "error",
          text: "Không thể tạo địa chỉ. Vui lòng thử lại!",
        });
      });
  }

  getUserDefaultAddress() {
    axios
      .get(`${Api}/user/default-address/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((result) => {
        console.log("Địa chỉ nè", result.status, result.data);
        if (result.status === 200 && result.data) {
          const user = result.data.user;
          const defaultAddress =
            user.addresses && user.addresses.length > 0
              ? user.addresses[0]
              : null;
          if (defaultAddress) {
            this.setState({
              firstName: defaultAddress.firstname,
              lastName: defaultAddress.lastname,
              email: user.email,
              address: defaultAddress.address,
              city: defaultAddress.city,
              country: defaultAddress.country,
              zip: defaultAddress.zip,
              telephone: defaultAddress.telephone,
              presistAddress: false,
            });
          } else {
            console.warn("Không tìm thấy địa chỉ mặc định.");
          }
        }
      })
      .catch((error) => {
        console.error("Lỗi khi lấy địa chỉ mặc định:", error);
      });
  }

  isAddressValid(address) {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "country",
      "zip",
      "telephone",
    ];
    return requiredFields.every(
      (field) => address[field] && address[field].trim() !== ""
    );
  }

  // Refactored to handle both COD and VNPay order creation
  createOrder(method) {
    console.log("VNPay Callback11:");
    console.log("VNPay Callback11:");

    const { selectedItems } = this.state;
    const address = {
      presistAddress: this.state.presistAddress,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      address: this.state.address,
      city: this.state.city,
      country: this.state.country,
      zip: this.state.zip,
      telephone: this.state.telephone,
    };

    if (localStorage.getItem("token") && !this.state.presistAddress) {
      if (!this.isAddressValid(address)) {
        Swal.fire({
          icon: "error",
          text: "Vui lòng điền đầy đủ thông tin địa chỉ giao hàng!",
        });
        return Promise.reject(new Error("Invalid address"));
      }
    }

    if (!selectedItems?.length) {
      Swal.fire({
        perspective: "error",
        text: "Không có sản phẩm nào được chọn!",
      });
      return Promise.reject(new Error("No items selected"));
    }

    const orderItems = selectedItems.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      name: item.name,
      image: item.photo,
      size: item.size,
      color: item.color,
      price: item.price * item.quantity,
    }));

    const orderData = {
      user_id: userId,
      order_items: orderItems,
      note: this.state.note,
      total: this.state.total,
      method,
    };
    console.log("Order data:", orderData);

    return axios
      .post(`${Api}/order`, orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        Swal.fire({
          icon: "success",
          text: "Đặt hàng thành công!",
        });
        return axios.delete(`${Api}/cart/clear`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      })
      .then(() => {
        localStorage.removeItem("selectedItems");
        localStorage.removeItem("subtotal");
        localStorage.removeItem("total");

        localStorage.removeItem(flagChatKey);
        localStorage.removeItem(flagChatStateKey);
        this.setState({ redirect: true });
      })
      .catch((error) => {
        console.error(`${method} order error:`, error);
        Swal.fire({
          icon: "error",
          text: "Đặt hàng không thành công!",
        });
        throw error;
      });
  }

  // handleCashOnDelivery() {
  //   this.createOrder("COD").catch((error) => {
  //     console.error("COD order failed:", error);
  //   });
  // }
  handleCashOnDelivery() {
    this.setState({ loadingPayment: true });
    this.createOrder("COD").finally(() => {
      this.setState({ loadingPayment: false });
    });
  }

  handleVNPayPayment() {
    this.setState({ loadingPayment: true });
    const total = this.state.total;

    if (!total || isNaN(total) || total <= 0) {
      Swal.fire({
        icon: "error",
        text: "Số tiền thanh toán không hợp lệ. Vui lòng kiểm tra giỏ hàng!",
      });
      return;
      this.setState({ loadingPayment: false });
    }

    const paymentData = {
      amount: total,
      orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      returnUrl: `http://localhost:3000/checkout`,
    };

    axios
      .post(`${Api}/vnpay`, paymentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        if (response.data.code === "00" && response.data.data) {
          window.location.href = response.data.data;
        } else {
          Swal.fire({
            icon: "error",
            text: "Không thể khởi tạo thanh toán. Vui lòng thử lại!",
          });
        }
      })
      .catch((error) => {
        console.error("VNPay payment error:", error);
        Swal.fire({
          icon: "error",
          text: "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau!",
        });
      });
  }

  handleVnPaymentCallBack() {
    console.log("VNPay Callback1:");
    this.createOrder("VNPAY").catch((error) => {
      console.error("VNPay order failed:", error);
    });
  }

  render() {
    const { selectedItems } = this.state;
    const address = {
      presistAddress: this.state.presistAddress,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      address: this.state.address,
      city: this.state.city,
      country: this.state.country,
      zip: this.state.zip,
      telephone: this.state.telephone,
    };

    if (this.state.redirect) {
      return <Navigate to="/" />;
    }
    console.log("Địa chỉ", address);

    return (
      <div className="section">
        {this.state.loadingPayment && (
          <div className="loading-overlay">
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
            <p>Đang xử lý thanh toán...</p>
          </div>
        )}
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              {localStorage.getItem("token") && !this.state.presistAddress ? (
                <div className="section-title">
                  <h3 className="title">Địa chỉ giao hàng</h3>
                  <AddressCard address={address} />
                </div>
              ) : (
                <form onSubmit={this.handleSubmit}>
                  <div className="billing-details">
                    <div className="section-title">
                      <h3 className="title">Địa chỉ giao hàng</h3>
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.firstName}
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.lastName}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                      />
                    </div>
                    {!localStorage.getItem("token") && (
                      <div className="form-group">
                        <input
                          className="input"
                          onChange={this.handleChange}
                          value={this.state.email}
                          type="email"
                          name="email"
                          placeholder="Email"
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.address}
                        type="text"
                        name="address"
                        placeholder="Địa chỉ"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.city}
                        type="text"
                        name="city"
                        placeholder="Thành phố"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.country}
                        type="text"
                        name="country"
                        placeholder="Quốc gia"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.zip}
                        type="text"
                        name="zip"
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="input"
                        onChange={this.handleChange}
                        value={this.state.telephone}
                        type="tel"
                        name="telephone"
                        placeholder="Số điện thoại"
                      />
                    </div>
                    {!localStorage.getItem("token") && (
                      <>
                        <div className="form-group">
                          <div className="caption">
                            <p>Enter the password for your new account.</p>
                            <div className="form-group">
                              <input
                                className="input"
                                onChange={this.handleChange}
                                value={this.state.password}
                                type="password"
                                name="password"
                                placeholder="Enter Your Password"
                              />
                            </div>
                            <div className="form-group">
                              <input
                                className="input"
                                onChange={this.handleChange}
                                value={this.state.passwordConfirm}
                                type="password"
                                name="passwordConfirm"
                                placeholder="Enter Your Password Again"
                              />
                            </div>
                          </div>
                        </div>
                        <button className="create-btn">
                          <i className="fa fa-user-plus">Create Account</i>
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
              {localStorage.getItem("token") && (
                <div className="order-notes">
                  <textarea
                    className="input"
                    onChange={this.handleChange}
                    value={this.state.note} // Fixed: Use this.state.note instead of this.state.total.note
                    name="note"
                    placeholder="Ghi chú"
                  ></textarea>
                </div>
              )}
            </div>
            <div className="col-md-5 order-details">
              <div className="section-title text-center">
                <h3 className="title">Đơn hàng của bạn</h3>
              </div>
              <div className="order-summary">
                <div className="order-col">
                  <div>
                    <strong>SẢN PHẨM</strong>
                  </div>
                  <div>
                    <strong>TỔNG CỘNG</strong>
                  </div>
                </div>
                <div className="order-summary">
                  {selectedItems?.map((item) => (
                    <div
                      key={item.id}
                      className="order-item d-flex mb-3 p-2 border rounded"
                    >
                      <img
                        src={`${ImageApi}/img/${item.photo}`}
                        alt={item.name}
                        width="60"
                        height="60"
                        className="mr-3 rounded"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 font-weight-bold">{item.name}</h6>
                        <div className="text-muted small">
                          <div>
                            <strong>Kích thước:</strong> {item.size} |{" "}
                            <strong>Màu:</strong> {item.color}
                          </div>
                          <div>
                            <strong>Số lượng:</strong> {item.quantity}
                          </div>
                          <div>
                            <strong>Đơn giá:</strong> {formatVND(item.price)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-weight-bold">
                        {formatVND(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-col">
                  <div>Vận chuyển</div>
                  <div>
                    <strong>MIỄN PHÍ</strong>
                  </div>
                </div>
                <div className="order-col">
                  <div>
                    <strong>TỔNG CỘNG</strong>
                  </div>
                  <div>
                    <strong className="order-total">
                      {formatVND(this.state.total)}
                    </strong>
                  </div>
                </div>
              </div>
              {localStorage.getItem("token") ? (
                <div className="payment-method">
                  <div className="order-col">
                    {this.state.total > 0 && (
                      <div className="payment-buttons">
                        <button
                          className="payment-btn cash-btn"
                          onClick={this.handleCashOnDelivery}
                        >
                          <span className="btn-icon">💵</span> Thanh Toán Khi
                          Nhận Hàng
                        </button>
                        <button
                          className="payment-btn vnpay-btn"
                          onClick={this.handleVNPayPayment}
                        >
                          <span className="btn-icon">💳</span> Thanh Toán VNPay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <h4 id="login-warning">
                  Đăng nhập hoặc đăng kí tài khoản trước khi thanh toán!
                </h4>
              )}
            </div>
          </div>
        </div>
      </div>
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
    addUser: (user) => dispatch({ type: "USER", value: user }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);
