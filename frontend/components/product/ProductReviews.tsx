'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Review {
  _id: string;
  user: {
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Review failed');
      }

      setReviews([data.review, ...reviews]);
      setComment('');
      setRating(5);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {/* Reviews List */}
      <div className="space-y-6 mb-10">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{rev.user?.name || 'User'}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                      className={i < rev.rating ? '' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{rev.comment}</p>
              <span className="text-xs text-gray-400 mt-2 block">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Terrible</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
