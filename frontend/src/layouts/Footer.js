import React from "react";
import "../assets/css/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="footer-section">
      <div className="footer-top section">
        <div className="container">
          <div className="row">
            <section
              className="footer-column col-md-3 col-6"
              aria-labelledby="gioi-thieu"
            >
              <h3 id="gioi-thieu" className="footer-title">
                Giới thiệu
              </h3>
              <p>Tiendo</p>
              <ul className="footer-links">
                <li>
                  <a href="#" aria-label="Địa chỉ: 26 Tu Xuong">
                    <i className="fa fa-map-marker" aria-hidden="true"></i> 26
                    Tu Xuong
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+840372979543"
                    aria-label="Số điện thoại: +84 0372979543"
                  >
                    <i className="fa fa-phone" aria-hidden="true"></i> +84
                    0372979543
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:tiendo030204@gmail.com"
                    aria-label="Email: tiendo030204@gmail.com"
                  >
                    <i className="fa fa-envelope-o" aria-hidden="true"></i>{" "}
                    tiendo030204@gmail.com
                  </a>
                </li>
              </ul>
            </section>

            <section
              className="footer-column col-md-3 col-6"
              aria-labelledby="nganh-hang"
            >
              <h3 id="nganh-hang" className="footer-title">
                Ngành hàng
              </h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Thời trang</a>
                </li>
                <li>
                  <a href="#">Thời trang nam</a>
                </li>
                <li>
                  <a href="#">Thời trang nữ</a>
                </li>
                <li>
                  <a href="#">Thời trang trẻ em</a>
                </li>
              </ul>
            </section>

            <section
              className="footer-column col-md-3 col-6"
              aria-labelledby="lien-he"
            >
              <h3 id="lien-he" className="footer-title">
                Liên hệ
              </h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Giới thiệu</a>
                </li>
                <li>
                  <a href="#">Liên hệ</a>
                </li>
                <li>
                  <a href="#">Chính sách mua hàng</a>
                </li>
                <li>
                  <a href="#">Mua hàng</a>
                </li>
                <li>
                  <a href="#">Điều khoản dịch vụ</a>
                </li>
              </ul>
            </section>

            <section
              className="footer-column col-md-3 col-6"
              aria-labelledby="dich-vu"
            >
              <h3 id="dich-vu" className="footer-title">
                Dịch vụ
              </h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Tài khoản</a>
                </li>
                <li>
                  <a href="#">Giỏ hàng</a>
                </li>
                <li>
                  <a href="#">Ưa thích</a>
                </li>
                <li>
                  <a href="#">Theo dõi đơn hàng</a>
                </li>
                <li>
                  <a href="#">Trợ giúp</a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <div id="bottom-footer" className="footer-bottom section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <ul className="footer-payments list-inline mb-2">
                {[
                  "fa-cc-visa",
                  "fa-credit-card",
                  "fa-cc-paypal",
                  "fa-cc-mastercard",
                  "fa-cc-discover",
                  "fa-cc-amex",
                ].map((iconClass) => (
                  <li key={iconClass} className="list-inline-item mx-2">
                    <a href="#" aria-label={iconClass.replace("fa-cc-", "")}>
                      <i className={`fa ${iconClass}`} aria-hidden="true"></i>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mb-0 copyright">
                &copy; {currentYear} Bản quyền thuộc về Tiến Đỗ. Được tạo với{" "}
                <i className="fa fa-heart-o" aria-hidden="true"></i> bởi{" "}
                <a
                  href="https://colorlib.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Colorlib
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
