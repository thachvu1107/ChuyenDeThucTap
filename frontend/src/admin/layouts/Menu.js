import React from "react";
import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <aside
      className="main-sidebar"
      style={{
        width: "250px",
        backgroundColor: "#1e1e2f",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
        position: "fixed",
      }}
    >
      {/* Logo */}
      <div className="brand-logo mb-4" style={{ textAlign: "center" }}>
        <a href="/dashboard" style={{ textDecoration: "none", color: "#fff" }}>
          <img
            src="/admin/dist/img/LOGO-XE-DAP.png"
            alt="Logo"
            style={{
              width: "70%",
              borderRadius: "10%",
              marginBottom: "10px",
            }}
          />
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            THẾ GIỚI XE ĐẠP
          </div>
        </a>
      </div>

      {/* Menu */}
      <nav>
        <div style={{ marginBottom: "15px", fontSize: "14px" }}>
          <div
            className="menu-section-title"
            style={{ marginBottom: "10px", fontWeight: 600 }}
          >
            Quản lý
          </div>
          <ul style={{ listStyle: "none", paddingLeft: "0" }}>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard" style={linkStyle}>
                <i className="fa fa-box mr-2" /> Sản phẩm
              </Link>
            </li>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard/thong_ke" style={linkStyle}>
                <i className="fa fa-box mr-2" /> Thống kê
              </Link>
            </li>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard/category" style={linkStyle}>
                <i className="fa fa-list-alt mr-2" /> Danh mục
              </Link>
            </li>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard/order" style={linkStyle}>
                <i className="fa fa-shopping-cart mr-2" /> Đơn hàng
              </Link>
            </li>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard/customer" style={linkStyle}>
                <i className="fa fa-user mr-2" /> Khách hàng
              </Link>
            </li>
            <li style={{ margin: "8px 0" }}>
              <Link to="/dashboard/track" style={linkStyle}>
                <i className="fa fa-user mr-2" /> cc
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

const linkStyle = {
  display: "flex",
  alignItems: "center",
  color: "#fff",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "5px",
  transition: "background 0.2s",
};
