import React, { useState } from "react";
import QrScanner from "react-weblineindia-qrcode-scanner";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Camera, Flashlight } from "lucide-react";
import { IoCloseCircle } from "react-icons/io5";
import { setTableId } from "@/public/store/addressSlice";

const QRPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  const handleScan = (text) => {
    if (!text || scanned) return;
    setScanned(true);

    let tableNo = null;

    // New – supports scan-my-meal/Table-XX
    if (text.includes("scan-my-meal/Table-")) {
      tableNo = text.split("scan-my-meal/Table-")[1];
    }

    // Backup support for old formats
    else if (!isNaN(text)) {
      tableNo = text.trim();
    } 
    else if (text.includes("table=")) {
      tableNo = text.split("table=")[1];
    } 
    else if (text.includes("table:")) {
      tableNo = text.split("table:")[1];
    }

    if (!tableNo) {
      toast.error("Invalid QR Code");
      setScanned(false);
      return;
    }

    dispatch(setTableId(tableNo));
    toast.success(`Table ${tableNo} selected`);

    setTimeout(() => onClose(), 500);
  };


  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">

      {/* Popup */}
      <div className="relative bg-white w-[94%] max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slideUp">

        {/* Header Branding */}
        <div className="w-full text-center py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-t-2xl">
          <h1 className="text-xl font-bold tracking-wide">Scan My Meal</h1>
          <p className="text-xs opacity-90">Scan the table QR to continue</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:scale-110 transition"
        >
          <IoCloseCircle size={32} className="text-red-600 drop-shadow" />
        </button>

        {/* Camera Container (Full View) */}
        <div className="relative w-full h-[380px] bg-black">

          {/* Full Camera Preview */}
          <QrScanner
            fps={12}
            qrbox={250}
            disableFlip={false}
            torch={torch}
            constraints={{ facingMode }}
            onResult={(text) => handleScan(text)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
            }}
          />

          {/* Square Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-white/40 rounded-md">
              {/* Glowing Corners */}
              <span className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-500 rounded-tl-md shadow-glow"></span>
              <span className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-500 rounded-tr-md shadow-glow"></span>
              <span className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-500 rounded-bl-md shadow-glow"></span>
              <span className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-500 rounded-br-md shadow-glow"></span>

              {/* Scanning Laser */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500 animate-scanLine"></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 py-4 bg-white">
          {/* Flip Camera */}
          <button
            onClick={() => setFacingMode(prev => 
              prev === "environment" ? "user" : "environment"
            )}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-full shadow text-gray-800"
          >
            <Camera size={18} /> Flip
          </button>

          {/* Flashlight */}
          <button
            onClick={() => setTorch(!torch)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full shadow transition 
              ${torch ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-800"}`}
          >
            <Flashlight size={18} /> {torch ? "ON" : "OFF"}
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-[11px] text-gray-500 pb-3">
          Align the QR code inside the frame to scan
        </p>
      </div>
    </div>
  );
};

export default QRPopup;
