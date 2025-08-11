import React, { useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { connect } from "react-redux";
import { Api } from "./../../api/Api";
import "../css/auth.css";

function Register(props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorKeys, setErrorKeys] = useState([]);
  const [error, setError] = useState({});
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${Api}/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
      })
      .then((result) => {
        localStorage.setItem("token", result.data.token);
        props.addUser(result.data.user);
        setShow(false);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.data) {
          try {
            const parsedError = JSON.parse(err.response.data);
            setErrorKeys(Object.keys(parsedError));
            setError(parsedError);
          } catch (parseError) {
            setErrorKeys(["non_field_errors"]);
            setError({
              non_field_errors: "Có lỗi xảy ra. Vui lòng thử lại sau.",
            });
          }
        } else {
          setErrorKeys(["general"]);
          setError({ general: "Có lỗi xảy ra. Vui lòng thử lại sau." });
        }
      });
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;
    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "password_confirmation") setPasswordConfirm(value);
  };

  return (
    <>
      <Button onClick={handleShow} bsPrefix="auth-btn">
        <i className="fa fa-user-plus me-2"></i> Đăng ký
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body className="login-modal-body">
          <div className="login-card">
            <h4 className="login-title">Tạo tài khoản mới</h4>

            {errorKeys.length > 0 &&
              errorKeys.map((key) => (
                <Alert variant="danger" className="login-alert" key={key}>
                  <i className="fa fa-exclamation-circle me-2"></i>
                  {error[key]}
                </Alert>
              ))}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa fa-user"></i>
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Nhập tên"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Nhập email"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-group mb-3">
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

              <div className="input-group mb-4">
                <span className="input-group-text">
                  <i className="fa fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password_confirmation"
                  className="form-control"
                  placeholder="Xác nhận mật khẩu"
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
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    addUser: (user) => dispatch({ type: "USER", value: user }),
  };
};

export default connect(null, mapDispatchToProps)(Register);
