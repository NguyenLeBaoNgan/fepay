"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/utils/axiosClient";
import { Star, UserCircle, Send, Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  user: { name: string };
  created_at: string;
}

interface FeedbackProps {
  productId: number;
  onFeedbackUpdate?: (newFeedbacks: Feedback[]) => void;
}

const ITEMS_PER_PAGE = 3;

const Feedback = ({ productId, onFeedbackUpdate }: FeedbackProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axiosClient.get(`/api/feedbacks/${productId}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      setSubmitting(false);
      return;
    }

    try {
      const newFeedback = { product_id: productId, rating, comment };
      const response = await axiosClient.post(`/api/feedbacks`, newFeedback);
      const updatedFeedbacks = [response.data.data, ...feedbacks];
      setFeedbacks(updatedFeedbacks);
      if (onFeedbackUpdate) onFeedbackUpdate(updatedFeedbacks);
      setRating(0);
      setComment("");
    } catch (error: any) {
      setError(
        error.response?.status === 422
          ? "Vui lòng kiểm tra lại thông tin nhập vào."
          : "Bạn cần đăng nhập để đánh giá sản phẩm."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(feedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = feedbacks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderStars = (count: number, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={interactive ? 36 : 20}
        strokeWidth={interactive ? 1.5 : 2}
        fill={(interactive ? (hoverRating || rating) > i : count > i) ? "currentColor" : "none"}
        className={`transition-all duration-200 ${
          interactive
            ? "cursor-pointer text-yellow-400 hover:scale-110"
            : "text-yellow-400"
        } ${(interactive ? (hoverRating || rating) > i : count > i) ? "fill-yellow-400" : ""}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  return (
    <div className="mt-10 bg-gradient-to-br  dark:bg-black rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Đánh giá sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block font-medium text-blue-700 mb-3">Chọn đánh giá của bạn:</label>
              <div className="flex gap-2 items-center mb-2 justify-center">
                {renderStars(0, true)}
              </div>
              <div className="text-center text-blue-600 font-medium">
                {rating > 0 ? `${rating} sao` : "Chưa chọn"}
              </div>
            </div>

            <div className="relative">
              <Textarea
                className="resize-none border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 p-4 text-lg rounded-lg shadow-sm"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
            >
              {submitting ? "Đang gửi..." : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800:text-white flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-blue-600" />
            <span>Đánh giá từ khách hàng</span>
          </h3>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {feedbacks.length} đánh giá
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4 bg-gray-200" />
                    <Skeleton className="h-3 w-1/6 bg-gray-200" />
                    <Skeleton className="h-10 w-full bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <Card className="border border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center text-lg">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paginatedFeedbacks.map((fb) => (
              <Card key={fb.id} className="overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="flex gap-5 p-5">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserCircle size={32} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-gray-800 dark:text-blue-500 font-semibold">{fb.user?.name || "Ẩn danh"}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          <Calendar className="inline w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center my-2">
                        {renderStars(fb.rating)}
                        <span className="text-gray-700 ml-2 text-sm font-medium">{fb.rating} sao</span>
                      </div>
                      <p className="text-gray-700:text-white mt-2 text-base">{fb.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="inline-flex rounded-md shadow-sm bg-white">
              <Button 
                variant="outline"
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
                className="rounded-l-md border border-r-0 border-gray-300"
              >
                Trước
              </Button>
              <div className="flex items-center justify-center px-4 text-gray-700 border border-gray-300">
                Trang {currentPage} / {totalPages}
              </div>
              <Button 
                variant="outline"
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="rounded-r-md border border-l-0 border-gray-300"
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;