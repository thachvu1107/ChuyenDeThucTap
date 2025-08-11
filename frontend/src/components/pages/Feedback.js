import React, { useState, useEffect } from "react";
import axios from "axios";
import { Api } from "./../../api/Api";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Feedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${Api}/feedback`, { name, email, message });
      fetchFeedback();
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Đã gửi phản hồi thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi phản hồi!");
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${Api}/feedback`);
      setFeedback(response.data.reverse()); // mới nhất lên đầu
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="container my-5">
      <ToastContainer />
      <div className="row">
        {/* Form Gửi phản hồi */}
        <div className="col-md-6 mb-4">
          <h3 className="text-dark mb-3">Gửi nhận xét</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Tên</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Nhận xét</label>
              <textarea
                className="form-control"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button className="btn btn-warning px-4">Gửi</button>
          </form>
        </div>

        {/* Danh sách phản hồi */}
        <div className="col-md-6">
          <h3 className="text-dark mb-3">Phản hồi gần đây</h3>
          <div className="row">
            {feedback.length > 0 ? (
              feedback.slice(0, 4).map((fb) => (
                <div className="col-md-6 mb-3" key={fb.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title mb-1">{fb.name}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        {fb.email}
                      </h6>
                      <p
                        className="card-text fst-italic"
                        style={{ minHeight: "5em" }}
                      >
                        "{fb.message}"
                      </p>
                    </div>
                    <div
                      className="card-footer text-muted text-end"
                      style={{ fontSize: "0.9em" }}
                    >
                      {formatDate(fb.created_at)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Chưa có phản hồi nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
