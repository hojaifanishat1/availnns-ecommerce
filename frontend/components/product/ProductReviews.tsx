'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Sparkles, Send, CheckCircle2, AlertCircle, ImagePlus, X } from 'lucide-react';

interface Review {
  _id: string;
  user: {
    name: string;
  };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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

  // রিভিউয়ের সাথে ছবি আপলোড হ্যান্ডলার
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImg(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.urls) {
        const newUrls = data.urls.map((item: any) => item.url);
        setReviewImages([...reviewImages, ...newUrls]);
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImg(false);
    }
  };

  const removeReviewImage = (indexToRemove: number) => {
    setReviewImages(reviewImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

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
          images: reviewImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Review failed');
      }

      setReviews([data.review, ...reviews]);
      setComment('');
      setRating(5);
      setReviewImages([]);
      setSuccessMessage('Thank you! Your review has been added successfully.');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="mt-16 border-t border-zinc-200/80 pt-12">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/60 text-xs font-semibold text-zinc-700 mb-2">
            <Sparkles size={12} className="text-amber-500" />
            <span>Verified Feedback</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Customer Reviews
          </h3>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/80 px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="text-2xl font-bold text-zinc-900">{averageRating}</div>
            <div className="space-y-0.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(Number(averageRating)) ? 'currentColor' : 'none'}
                    className={i < Math.round(Number(averageRating)) ? '' : 'text-zinc-300'}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4 mb-12">
        {reviews.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-[2rem] bg-zinc-50/80 border border-zinc-200/80">
            <p className="text-zinc-500 text-sm font-medium">
              No reviews yet. Be the first to share your thoughts about this product!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 sm:p-6 bg-white rounded-3xl border border-zinc-200/80 shadow-xs transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                    {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 text-sm sm:text-base">
                      {rev.user?.name || 'User'}
                    </h4>
                    <span className="text-xs text-zinc-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                      className={i < rev.rating ? '' : 'text-zinc-200'}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-zinc-600 text-sm leading-relaxed pl-13 mb-3">
                {rev.comment}
              </p>

              {/* Review Images Display */}
              {rev.images && rev.images.length > 0 && (
                <div className="pl-13 flex flex-wrap gap-2.5 mt-2">
                  {rev.images.map((imgUrl, imgIdx) => (
                    <a
                      key={imgIdx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-16 w-16 rounded-xl overflow-hidden border border-zinc-200 shadow-2xs hover:opacity-90 transition"
                    >
                      <img src={imgUrl} alt="Review attachment" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-white via-zinc-50/50 to-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-200/80 shadow-xl shadow-zinc-900/5 relative overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2.5 rounded-2xl bg-zinc-900 text-white shadow-sm">
            <MessageSquarePlus size={18} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900 tracking-tight">Write a Review</h4>
            <p className="text-xs text-zinc-500">Share your experience with other shoppers</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 text-sm text-rose-600 bg-rose-50 border border-rose-200/80 p-4 rounded-2xl animate-in fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-2.5 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl animate-in fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Interactive Star Rating Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2.5">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform duration-200 hover:scale-110 cursor-pointer focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={26}
                  fill={
                    (hoverRating || rating) >= star ? 'currentColor' : 'none'
                  }
                  className={
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 drop-shadow-sm'
                      : 'text-zinc-300'
                  }
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-semibold text-zinc-700">
              {rating === 5 && '5 - Excellent'}
              {rating === 4 && '4 - Good'}
              {rating === 3 && '3 - Average'}
              {rating === 2 && '2 - Poor'}
              {rating === 1 && '1 - Terrible'}
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
            Your Comment
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience with this product..."
            required
            className="w-full bg-white border border-zinc-200/80 rounded-2xl p-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all shadow-xs resize-none"
          ></textarea>
        </div>

        {/* Image Upload for Review */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
            Add Photos (Optional)
          </label>
          <div className="flex flex-wrap gap-3">
            {reviewImages.map((url, idx) => (
              <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 shadow-2xs group">
                <img src={url} alt="Uploaded review photo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeReviewImage(idx)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-zinc-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <label className="h-20 w-20 rounded-xl border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition">
              {uploadingImg ? (
                <div className="h-4 w-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <ImagePlus size={20} className="text-zinc-500" />
              )}
              <span className="text-[10px] font-semibold text-zinc-600">Add Photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImg}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-lg shadow-zinc-900/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:bg-zinc-400 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
