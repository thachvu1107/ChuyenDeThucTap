// import React, { useEffect, useRef } from "react";

// const AutoCapture = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const initCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }

//         // Sau 3s tự chụp
//         setTimeout(() => captureAndUpload(), 3000);
//       } catch (err) {
//         console.error("Không thể truy cập camera:", err);
//       }
//     };

//     initCamera();
//   }, []);

//   const captureAndUpload = async () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     // vẽ khung hình hiện tại lên canvas
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("image", blob, "capture.jpg");

//       try {
//         await fetch("http://localhost:8000/api/upload-image", {
//           method: "POST",
//           body: formData,
//         });
//         console.log("Ảnh đã được gửi lên server!");
//       } catch (err) {
//         console.error("Upload thất bại:", err);
//       }
//     }, "image/jpeg");
//   };

//   return (
//     <div>
//       <video ref={videoRef} autoPlay playsInline width="320" height="240" />
//       <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
//     </div>
//   );
// };

// export default AutoCapture;
import React, { useEffect, useRef } from "react";

const AutoCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();

            intervalRef.current = setInterval(() => {
              captureAndUpload();
            }, 5000);
          };
        }
      } catch (err) {
        console.error("Không thể truy cập camera:", err);
      }
    };

    initCamera();

    // Cleanup khi component unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndUpload = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const res = await fetch("http://localhost:8000/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        console.log("Upload thành công:", data);
      } catch (err) {
        console.error("Upload thất bại:", err);
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="1"
        height="1"
        style={{ position: "absolute", top: "-1000px" }}
      />
      <canvas
        ref={canvasRef}
        width="320"
        height="240"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default AutoCapture;
