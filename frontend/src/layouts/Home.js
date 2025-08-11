import React from "react";
import ToastMessage from "../components/home/ToastMessage";
import Carousel from "../components/home/Carousel";
import HotDeals from "../components/home/HotDeals";
import BannerSlider from "../components/BannerSlider";

function Home(props) {
  return (
    <div>
      <BannerSlider />
      <ToastMessage />
      <HotDeals />
      <Carousel title="Sản phẩm mới " id="1" />
    </div>
  );
}
export default Home;
