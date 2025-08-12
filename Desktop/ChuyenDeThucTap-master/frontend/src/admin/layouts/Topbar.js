import React, { Component } from "react";
import AdminUser from "../AdminUser";

class Topbar extends Component {
  render() {
    return (
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        {/* Left navbar links */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              className="nav-link"
              data-widget="pushmenu"
              href="#"
              role="button"
            >
              <i className="fa fa-bars" />
            </a>
          </li>
          <li className="nav-item d-none d-sm-inline-block">
            <a href="/dashboard" className="nav-link">
              Trang chủ
            </a>
          </li>
        </ul>

        {/* Right navbar links */}
        <ul className="navbar-nav ml-auto">
          {/* Navbar Search */}
          <li className="nav-item">
            <a
              className="nav-link"
              data-widget="navbar-search"
              href="#"
              role="button"
            >
              <i className="fa fa-search" />
            </a>
            <div className="navbar-search-block">
              <form className="form-inline">
                <div className="input-group input-group-sm">
                  <input
                    className="form-control form-control-navbar"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-navbar" type="submit">
                      <i className="fa fa-search" />
                    </button>
                    <button
                      className="btn btn-navbar"
                      type="button"
                      data-widget="navbar-search"
                    >
                      <i className="fa fa-times" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </li>

          {/* Messages Dropdown Menu */}
          <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
              <i className="fa fa-comments" />
              <span className="badge badge-danger navbar-badge">3</span>
            </a>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <a href="#" className="dropdown-item">
                {/* Message Start */}
                <div className="media">
                  <img
                    src="/admin/dist/img/user1-128x128.jpg"
                    alt="User Avatar"
                    className="img-size-50 mr-3 img-circle"
                  />
                  <div className="media-body">
                    <h3 className="dropdown-item-title">
                      Brad Diesel
                      <span className="float-right text-sm text-danger">
                        <i className="fa fa-star" />
                      </span>
                    </h3>
                    <p className="text-sm">
                      Hãy gọi cho tôi bất cứ khi nào bạn có thể...
                    </p>
                    <p className="text-sm text-muted">
                      <i className="fa fa-clock mr-1" /> 4 giờ trước
                    </p>
                  </div>
                </div>
                {/* Message End */}
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item">
                {/* Message Start */}
                <div className="media">
                  <img
                    src="/admin/dist/img/user8-128x128.jpg"
                    alt="User Avatar"
                    className="img-size-50 img-circle mr-3"
                  />
                  <div className="media-body">
                    <h3 className="dropdown-item-title">
                      John Pierce
                      <span className="float-right text-sm text-muted">
                        <i className="fa fa-star" />
                      </span>
                    </h3>
                    <p className="text-sm">
                      Tôi đã nhận được tin nhắn của anh rồi anh bạn
                    </p>
                    <p className="text-sm text-muted">
                      <i className="fa fa-clock mr-1" /> 4 giờ trước
                    </p>
                  </div>
                </div>
                {/* Message End */}
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item">
                {/* Message Start */}
                <div className="media">
                  <img
                    src="/admin/dist/img/user3-128x128.jpg"
                    alt="User Avatar"
                    className="img-size-50 img-circle mr-3"
                  />
                  <div className="media-body">
                    <h3 className="dropdown-item-title">
                      Nora Silvester
                      <span className="float-right text-sm text-warning">
                        <i className="fa fa-star" />
                      </span>
                    </h3>
                    <p className="text-sm">Chủ đề ở đây</p>
                    <p className="text-sm text-muted">
                      <i className="fa fa-clock mr-1" /> 4 giờ trước
                    </p>
                  </div>
                </div>
                {/* Message End */}
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item dropdown-footer">
                Xem tất cả tin nhắn
              </a>
            </div>
          </li>

          {/* Notifications Dropdown Menu */}
          <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
              <i className="fa fa-bell" />
              <span className="badge badge-warning navbar-badge">9+</span>
            </a>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
              <span className="dropdown-item dropdown-header">
                15 Thông báo
              </span>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item">
                <i className="fa fa-envelope mr-2" /> 4 tin nhắn mới
                <span className="float-right text-muted text-sm">8 Phút</span>
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item">
                <i className="fa fa-users mr-2" /> 8 yêu cầu kết bạn
                <span className="float-right text-muted text-sm">12 giờ</span>
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item">
                <i className="fa fa-file mr-2" /> 3 new reports
                <span className="float-right text-muted text-sm">2 Ngày</span>
              </a>
              <div className="dropdown-divider" />
              <a href="#" className="dropdown-item dropdown-footer">
                See All Notifications
              </a>
            </div>
          </li>

          {/* User Menu */}
          <li className="nav-item">
            <AdminUser />
          </li>
        </ul>
      </nav>
    );
  }
}

export default Topbar;
