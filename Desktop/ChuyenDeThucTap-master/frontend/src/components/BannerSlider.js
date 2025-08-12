import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './css/BannerSlider.css';

import banner1 from "../assets/img/xe-dap-fxbike-768x351.jpg";
import banner2 from "../assets/img/xe-dap-the-thao.jpg";

const BannerSlider = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: false,
  };

  const banners = [
    { id: 1, image: banner1, alt: "Banner 1" },
    { id: 2, image: banner2, alt: "Banner 2" },
    { id: 3, image: banner1, alt: "Banner 3" },
  ];

  return (
    <div className="banner-slider-wrapper">
      <Slider {...sliderSettings}>
        {banners.map((banner) => (
          <div key={banner.id} className="banner-slide">
            <img
              src={banner.image}
              alt={banner.alt}
              className="banner-image"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;
