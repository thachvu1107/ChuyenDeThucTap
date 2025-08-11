import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminUser = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <Dropdown>
      <Dropdown.Toggle variant="toggle" id="dropdown-basic">
        <i className="fa fa-user-o"></i>
        <span
          style={{ color: "black", fontSize: "20px", paddingRight: "25px" }}
        >
          {userName}
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item>Tài hoản của tôi</Dropdown.Item>
        {/* <Dropdown.Item>Track My Order</Dropdown.Item> */}
        <Dropdown.Divider />
        <Dropdown.Item>
          <Link to="/">
            {" "}
            <i className="fa fa-sign-out" aria-hidden="true"></i>
            Đăng xuất
          </Link>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminUser;
