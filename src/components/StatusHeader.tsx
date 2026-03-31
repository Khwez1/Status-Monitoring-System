// components/StatusHeader.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaChartLine } from "react-icons/fa6";
import SubscribeModal from "./SubscribeModal";

export const StatusHeader = () => {
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("subscriber_email");
    setSubscribedEmail(email);
  }, []);

  const handleUnsubscribe = async () => {
    if (!subscribedEmail) return;
    setUnsubscribeLoading(true);

    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: subscribedEmail }),
    });

    if (res.ok) {
      localStorage.removeItem("subscriber_email");
      setSubscribedEmail(null);
    }

    setUnsubscribeLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <FaChartLine className="text-red-600" size={32} />
          <p className="text-blue-600 text-2xl sm:text-3xl lg:text-4xl font-bold">
            Downtime
          </p>
        </div>
        {subscribedEmail ? (
          <button
            onClick={handleUnsubscribe}
            disabled={unsubscribeLoading}
            className="px-6 py-2 sm:px-8 sm:py-3 font-bold rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {unsubscribeLoading ? "..." : "Unsubscribe"}
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 sm:px-8 sm:py-3 font-bold rounded text-gray-700 bg-blue-100 hover:bg-blue-200"
          >
            Subscribe
          </button>
        )}
      </div>
      {showModal && (
        <SubscribeModal
          onClose={() => setShowModal(false)}
          onSuccess={(email) => {
            setSubscribedEmail(email);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default StatusHeader;