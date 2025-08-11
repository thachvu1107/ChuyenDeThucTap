import React from "react";

export default function Contact() {
  return (
    <section className="contact-section py-5">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Thông tin liên hệ */}
          <div className="col-lg-6">
            <div className="contact-info shadow-sm p-4 rounded bg-white">
              <h2 className="mb-4" style={{ color: "#DB4916" }}>
                Liên hệ với chúng tôi
              </h2>
              <p className="mb-4">
                Ghé thăm một trong các địa điểm đại lý của chúng tôi hoặc liên
                hệ ngay hôm nay!
              </p>
              <div className="mb-3 d-flex align-items-start">
                <i className="fas fa-map-marker-alt fs-4 text-primary me-3"></i>
                <div>
                  <strong>Địa chỉ:</strong>
                  <br />
                  Tú Xương, Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <i className="fas fa-envelope fs-4 text-primary me-3"></i>
                <div>
                  <strong>Email:</strong>
                  <br />
                  tiendo030204@gmail.com
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <i className="fas fa-phone fs-4 text-primary me-3"></i>
                <div>
                  <strong>Điện thoại:</strong>
                  <br />
                  0372 979 543
                </div>
              </div>
              <div className="mb-3 d-flex align-items-start">
                <i className="fas fa-clock fs-4 text-primary me-3"></i>
                <div>
                  <strong>Giờ làm việc:</strong>
                  <br />
                  Thứ Hai đến Thứ Bảy: 9:00 - 17:00
                </div>
              </div>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="col-lg-6">
            <div className="map-container shadow-sm rounded overflow-hidden">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.64209316554!2d106.76931717480582!3d10.838677789313902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752707e96ef229%3A0xe7a1a240f7797a48!2zMjYgVMO6IFjGsMahbmcsIFBoxrDhu5tjIExvbmcgQiwgVGjhu6cgxJDhu6ljLCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1749458049807!5m2!1svi!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
