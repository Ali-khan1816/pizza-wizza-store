// Last edited by you@example.com @ 08/09/26 11:52.
// CarouselComponent.jsx
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Image from "next/image";

const CarouselComponent = () => {
  const pizzaImages = [
    "/pizza1.jpg",
    "/pizza2.jpg",
    "/pizza3.png",
    "/pizza4.jpg",
  ];

  return (
    <Carousel
      autoPlay
      interval={3000}
      infiniteLoop
      navButtonAlwaysVisible
      showStatus={false}
      emulateTouch
      showThumbs={false}
    >
      {pizzaImages.map((image, index) => (
        <div
          key={index}
          style={{ maxHeight: "36rem", position: "relative", height: "36rem" }}
          className="brightness-50"
        >
          {/* Next.js Image — local files ke liye width/height zaroori hai */}
          <Image
            src={image}
            alt={`pizza-${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0} // pehli image fast load ho
          />
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselComponent;
