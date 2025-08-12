import React, { useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { connect } from "react-redux";
import { Api } from "./../../api/Api";
import "../css/auth.css";
function Login(props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleClose = () => {
    setShow(false);
    props.hideLogin();
  };

  const handleShow = () => {
    setShow(true);
  };

  const refreshPage = () => {
    window.location.reload(); // Làm mới trang
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post(`${Api}/login`, { email, password })
      .then((result) => {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("role_id", result.data.user.role_id);
        localStorage.setItem("name", result.data.user.name);
        localStorage.setItem("userId", result.data.user.id);

        props.addUser(result.data.user);
        setShow(false);
        setLoading(false);
        refreshPage(); // Gọi hàm làm mới trang sau khi đăng nhập thành công
      })
      .catch((error) => {
        setError(true);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  return (
    <React.Fragment>
      <Button onClick={handleShow} bsPrefix="auth-btn">
        <i className="fa fa-sign-in me-2"></i> Đăng nhập
      </Button>

      <Modal show={show || props.showLogin} onHide={handleClose} centered>
        <Modal.Body className="login-modal-body">
          <div className="login-card">
            <h4 className="login-title">Chào mừng quay lại</h4>

            {error && (
              <Alert variant="danger" className="login-alert">
                <i className="fa fa-exclamation-circle me-2"></i>
                Thông tin đăng nhập không hợp lệ!
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Nhập Email"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-group mb-4">
                <span className="input-group-text">
                  <i className="fa fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  required
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn login-btn w-100">
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return { showLogin: state.show_login };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addUser: (user) => dispatch({ type: "USER", value: user }),
    hideLogin: () => dispatch({ type: "LOGIN_CONTROL", value: false }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
