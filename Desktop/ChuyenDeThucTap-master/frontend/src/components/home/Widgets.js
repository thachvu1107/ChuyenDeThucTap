import React, { Component } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Api } from "../../api/Api";
import { ImageApi } from "../../api/ImageApi";
import "../../assets/css/widget.css";

class WidgetColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
    };
  }

  componentDidMount() {
    this.getProducts();
  }

  getProducts() {
    axios
      .get(`${Api}/product/categories/1/top-selling`)
      .then((response) => {
        this.setState({
          products: [...response.data],
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  formatCurrency(price) {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }

  render() {
    const settings = {
      infinite: true,
      autoplay: true,
      speed: 300,
      dots: true,
      arrows: false,
    };

    const { products } = this.state;

    const renderProduct = (product) => {
      const isOnSale =
        new Date(product.sale_expires).getTime() > new Date().getTime();
      const salePrice = product.price - product.price * product.sale;

      return (
        <div className="product-widget" key={product.id}>
          <div className="product-img">
            <img src={`${ImageApi}/img/${product.photo}`} alt={product.name} />
          </div>
          <div className="product-body">
            <p className="product-category">{product.category.name}</p>
            <h3 className="product-name">
              <a href="#">{product.name}</a>
            </h3>
            <h4 className="product-price">
              {isOnSale ? (
                <>
                  {this.formatCurrency(salePrice)}{" "}
                  <del className="product-old-price">
                    {this.formatCurrency(product.price)}
                  </del>
                </>
              ) : (
                this.formatCurrency(product.price)
              )}
            </h4>
          </div>
        </div>
      );
    };

    return (
      <div className="widget-column">
        <div className="section-title">
          <h4 className="title">{this.props.title}</h4>
        </div>

        <div className="products-widget-slick">
          <Slider {...settings}>
            {[0, 3].map((start) => (
              <div key={start}>
                {products
                  .slice(start, start + 3)
                  .map((product) => renderProduct(product))}
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
  }
}

class Widgets extends Component {
  render() {
    return (
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-4 col-xs-6">
              <WidgetColumn title="Bán chạy nhất" />
            </div>
            <div className="col-md-4 col-xs-6">
              <WidgetColumn title="Sản phẩm nổi bật" />
            </div>
            <div className="col-md-4 col-xs-6">
              <WidgetColumn title="Gợi ý hôm nay" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Widgets;
