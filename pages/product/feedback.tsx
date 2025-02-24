"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { Star } from "lucide-react";

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
}

const Feedback = ({ productId }: { productId: number }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axiosClient.get(`/api/feedbacks/${productId}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
  
    try {
      const newFeedback = { product_id: productId, rating, comment };
      const response = await axiosClient.post(`/api/feedbacks`, newFeedback);
  
      // Lấy dữ liệu trả về từ API (response.data.data)
      const feedbackWithUser = response.data.data;
  
      setFeedbacks((prev) => [feedbackWithUser, ...prev]); // Cập nhật danh sách feedbacks
      setRating(0);
      setComment("");
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setError("Validation error: Please check your input.");
      } else {
        setError("An error occurred while submitting feedback.");
      }
      console.error("Error submitting feedback:", error);
    }
  };
  

  return (
    <div className="max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block font-medium">Rating:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={rating >= star ? "text-yellow-500" : "text-gray-300"}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="block font-medium">Comment:</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Submit
        </button>
      </form>

      <div>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedbacks yet.</p>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="border-b py-3">
              <p className="text-gray-700">
                <strong>{fb.user?.name || "Unknown User"}</strong>: {fb.comment}
              </p>
              <div className="flex gap-1">
                {[...Array(fb.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-500" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feedback;
