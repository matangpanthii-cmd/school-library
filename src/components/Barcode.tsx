"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

interface BarcodeProps {
  value: string;
  type?: "barcode" | "qrcode";
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
  format?: "CODE128" | "EAN13" | "UPC";
}

export default function Barcode({
  value,
  type = "barcode",
  width = 2,
  height = 55,
  fontSize = 16,
  className = "",
  format = "CODE128"
}: BarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      const cleanVal = value.trim().toUpperCase();
      try {
        if (type === "qrcode") {
          QRCode.toCanvas(canvasRef.current, cleanVal, {
            width: Math.max(120, height * 2),
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
        } else {
          JsBarcode(canvasRef.current, cleanVal, {
            format,
            width,
            height,
            displayValue: true,
            fontSize,
            margin: 8,
            fontOptions: "bold",
            background: "#ffffff",
            lineColor: "#000000",
          });
        }
      } catch (e) {
        console.error("Barcode generation error for value:", value, e);
      }
    }
  }, [value, type, width, height, fontSize, format]);

  return (
    <div className={`flex flex-col items-center justify-center bg-white p-1 rounded-xl ${className}`}>
      <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
    </div>
  );
}
