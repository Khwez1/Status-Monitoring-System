"use client";
import { useState } from "react";

interface Props {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const SubscribeModal = ({ onClose, onSuccess }: Props) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      localStorage.setItem("subscriber_email", email);
      onSuccess(email);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-blue-600 mb-2">
          Subscribe to alerts
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Get notified by email when the site goes down or recovers.
        </p>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-bold hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;