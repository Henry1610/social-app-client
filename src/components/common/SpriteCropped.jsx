import React, { useEffect, useState } from "react";

/**
 * Props:
 *  spriteUrl: URL của sprite sheet
 *  bgPosition: background-position CSS, ví dụ "0px -2959px"
 *  width: width của phần ảnh cần cắt
 *  height: height của phần ảnh cần cắt
 */
const SpriteCropped = ({ spriteUrl, bgPosition, width, height, alt = "" }) => {
  const [croppedUrl, setCroppedUrl] = useState("");

  useEffect(() => {
    if (!spriteUrl || !bgPosition || !width || !height) return;

    const [xStr, yStr] = bgPosition.split(" ");
    const x = parseInt(xStr); // có thể âm
    const y = parseInt(yStr);

    const img = new Image();
    img.crossOrigin = "anonymous"; // nếu khác domain
    img.src = spriteUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        img,
        -x, // lưu ý: x/y âm trong background-position → vẽ từ -x, -y
        -y,
        img.width,
        img.height,
        0,
        0,
        img.width,
        img.height
      );

      setCroppedUrl(canvas.toDataURL());
    };
  }, [spriteUrl, bgPosition, width, height]);

  if (!croppedUrl) return null;

  return <img src={croppedUrl} width={width} height={height} alt={alt} />;
};

export default SpriteCropped;
