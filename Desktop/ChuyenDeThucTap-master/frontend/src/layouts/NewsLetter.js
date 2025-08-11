import React from "react";

const NewsLetter = () => {
  return (
    <div>
      <div id="newsletter" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="newsletter">
                <p>
                  Đăng ký nhận <strong>BẢNG TIN</strong>
                </p>
                <form
                  action="https://gmail.us13.list-manage.com/subscribe/post?u=57c89576eab1a270da0dc3238&id=1ead8d7f9c&f_id=0002f2e1f0"
                  method="post"
                  className="validate"
                  target="_blank"
                >
                  <input
                    className="input"
                    name="EMAIL"
                    type="email"
                    placeholder="Enter Your Email"
                    required
                  />
                  <button
                    className="newsletter-btn"
                    type="submit"
                    name="subscribe"
                  >
                    <i className="fa fa-envelope"></i> Đăng ký
                  </button>
                </form>
                <ul className="newsletter-follow">
                  <li>
                    <a href="#">
                      <i className="fa fa-facebook"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fa fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fa fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fa fa-pinterest"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
