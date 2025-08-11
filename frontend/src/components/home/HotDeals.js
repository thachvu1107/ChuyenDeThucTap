import React, { useState, useRef, useEffect } from "react";
import "../../assets/css/HotDeals.css";

const HotDeals = () => {
  const [endDate, setEndDate] = useState("");
  const [timerDays, setTimerDays] = useState("00");
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");

  const interval = useRef();

  const calculateEndDate = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, "0");
    const day = String(endDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startTimer = () => {
    const countDownDate = new Date(endDate).getTime();
    interval.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(interval.current);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimerDays(formatTime(days));
        setTimerHours(formatTime(hours));
        setTimerMinutes(formatTime(minutes));
        setTimerSeconds(formatTime(seconds));
      }
    }, 1000);
  };

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  useEffect(() => {
    setEndDate(calculateEndDate());
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (endDate) startTimer();
  }, [endDate]);

  return (
    <div className="hotdeal-section">
      <div className="hotdeal-content">
        <h2 className="hotdeal-title">ƯU ĐÃI HẤP DẪN TUẦN NÀY</h2>
        <p className="hotdeal-subtitle">
          BỘ SƯU TẬP MỚI GIẢM GIÁ TỚI <strong>50%</strong>
        </p>
        <div className="hotdeal-timer">
          <div className="time-box">
            <h3>{timerDays}</h3>
            <span>Ngày</span>
          </div>
          <div className="time-box">
            <h3>{timerHours}</h3>
            <span>Giờ</span>
          </div>
          <div className="time-box">
            <h3>{timerMinutes}</h3>
            <span>Phút</span>
          </div>
          <div className="time-box">
            <h3>{timerSeconds}</h3>
            <span>Giây</span>
          </div>
        </div>
        <a href="/product" className="hotdeal-btn">
          Shop now
        </a>
      </div>
    </div>
  );
};

export default HotDeals;
