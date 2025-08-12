import React, { useState, useEffect } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Login from "./Login";
import Register from "./Register";
import { Api } from "./../../api/Api";
import "../css/Authentification.css";
import GoogleLoginButton from "./GoogleLoginButton";
const Authentification = ({ user, removeUser }) => {
  const [authUser, setAuthUser] = useState(user || "");
  const [redirect, setRedirect] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getAuth(token);
    }
  }, []);

  useEffect(() => {
    if (user.name !== authUser.name) {
      setAuthUser(user);
    }
  }, [user]);

  const getAuth = (token) => {
    axios
      .get(`${Api}/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        setAuthUser(result.data.user);
      })
      .catch((error) => {
        console.error(error);
        logout();
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser("");
    removeUser();
  };

  const handleClick = (e) => {
    switch (e.target.id) {
      case "0":
        window.location.href = "/dashboard";
        break;
      case "1":
        setRedirect("my-account");
        break;
      case "2":
        setRedirect("track-my-order");
        break;
      case "3":
        logout();
        break;
      default:
        break;
    }
  };

  if (redirect) {
    return <Navigate to={`/${redirect}`} />;
  }

  return authUser !== "guest" && localStorage.getItem("token") ? (
    <div className="auth-wrapper">
      <DropdownButton
        id="auth-dropdown"
        title={
          <>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            {authUser.name}
          </>
        }
        variant="light"
        className="auth-dropdown-button"
        align="end"
      >
        {authUser?.role_id === 1 && (
          <Dropdown.Item id="0" onClick={handleClick}>
            Bảng điều khiển
          </Dropdown.Item>
        )}
        <Dropdown.Item id="1" onClick={handleClick}>
          Tài khoản của tôi
        </Dropdown.Item>
        <Dropdown.Item id="2" onClick={handleClick}>
          Theo dõi đơn hàng
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item id="3" onClick={handleClick}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Đăng xuất
        </Dropdown.Item>
      </DropdownButton>
    </div>
  ) : (
    <div className="auth-wrapper">
      <DropdownButton
        id="auth-dropdown"
        title={
          <>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Tài khoản
          </>
        }
        variant="light"
        className="auth-dropdown-button"
        align="end"
      >
        <div className="px-3 py-2">
          <Login />
          <Register />
          <div className="mt-3">
            <GoogleLoginButton />
          </div>
        </div>
      </DropdownButton>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.user_data,
});

const mapDispatchToProps = (dispatch) => ({
  removeUser: () => dispatch({ type: "USER", value: "guest" }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Authentification);
