import React, { useEffect, useRef } from "react";

const News = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const onLoad = () => {
      try {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow.document;

        const style = document.createElement("style");
        style.innerHTML = `
          .header, .footer, .some-specific-class, .mainnav,
          nav.flex.justify-between.items-center.pt-5.border-b-\\[2px\\].border-solid.border-x-0.border-t-0.pb-5.border-\\[\\#E3E3DC\\] {
            display: none !important;
          }
        `;
        iframeDocument.head.appendChild(style);
      } catch (error) {
        console.error("Không thể chỉnh sửa nội dung của iframe:", error);
      }
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div>
      <iframe
        ref={iframeRef}
        src="https://www.elle.vn/thoi-trang/"
        width="100%"
        height="600px"
        title="Genk"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default News;
