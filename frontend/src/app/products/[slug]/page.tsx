'use client';

import React, { useEffect, useState } from 'react';
import api, { resolveMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  Star, ThumbsUp, ThumbsDown, MessageSquare, Plus, Loader2, 
  CornerDownRight, MessageCircle, Send, Sparkles, Heart 
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get('/wishlist');
      const items = res.data.data.items || [];
      const found = items.some((item: any) => item.productId === product.id);
      setIsInWishlist(found);
    } catch (err) {
      console.error('Failed to fetch wishlist status', err);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id}`);
        setIsInWishlist(false);
      } else {
        await api.post('/wishlist', { productId: product.id });
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  // Review state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Question state
  const [questionText, setQuestionText] = useState<string>('');
  const [submittingQuestion, setSubmittingQuestion] = useState<boolean>(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [questionSuccess, setQuestionSuccess] = useState<string | null>(null);

  // Answer state
  const [replyingToQuestionId, setReplyingToQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/slug/${slug}`);
      const data = res.data.data;
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error('Product not found', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant && product) {
      addItem({
        id: selectedVariant.id,
        variantId: selectedVariant.id,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          price: Number(product.price) + Number(selectedVariant.additionalPrice),
          image: product.images?.[0]?.url || '',
        },
      });
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating < 1 || rating > 5) {
      setReviewError('Please select a rating between 1 and 5');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating,
        comment: comment.trim(),
      });
      setReviewSuccess('Thank you! Your review has been submitted.');
      setComment('');
      setRating(5);
      // Refetch product data to refresh reviews
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.data);
    } catch (err: any) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Vote Review
  const handleVoteReview = async (reviewId: string, voteValue: number) => {
    if (!user) {
      alert('Please log in to vote on reviews.');
      return;
    }
    try {
      await api.post(`/reviews/${reviewId}/vote`, { vote: voteValue });
      // Refetch product data to update vote counts
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to record vote.');
    }
  };

  // Ask Question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (questionText.trim().length < 5) {
      setQuestionError('Question must be at least 5 characters long.');
      return;
    }
    setSubmittingQuestion(true);
    setQuestionError(null);
    setQuestionSuccess(null);
    try {
      await api.post('/reviews/questions', {
        productId: product.id,
        title: questionText.trim(),
      });
      setQuestionSuccess('Your question has been posted successfully!');
      setQuestionText('');
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.data);
    } catch (err: any) {
      console.error(err);
      setQuestionError(err.response?.data?.message || 'Failed to post question.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Reply to Question
  const handleSubmitAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (!user) return;
    if (answerText.trim().length < 5) {
      setAnswerError('Answer must be at least 5 characters long.');
      return;
    }
    setSubmittingAnswer(true);
    setAnswerError(null);
    try {
      await api.post(`/reviews/questions/${questionId}/answers`, {
        content: answerText.trim(),
      });
      setAnswerText('');
      setReplyingToQuestionId(null);
      const res = await api.get(`/products/slug/${slug}`);
      setProduct(res.data.data);
    } catch (err: any) {
      console.error(err);
      setAnswerError(err.response?.data?.message || 'Failed to post answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-20 text-center animate-pulse text-muted-foreground">Loading product...</div>;
  }

  if (!product) {
    return <div className="container mx-auto py-20 text-center text-muted-foreground">Product not found.</div>;
  }

  const finalPrice = Number(product.price) + (selectedVariant ? Number(selectedVariant.additionalPrice) : 0);

  // Review distribution summary
  const reviews = product.reviews || [];
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
    const count = reviews.filter((rev: any) => rev.rating === r).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating: r, count, pct };
  });

  const renderStars = (rating: number, sizeClass = "h-4 w-4") => {
    return (
      <div className="flex text-amber-400 gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`${sizeClass} ${i < rating ? 'fill-amber-400' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  };

  const StarRatingInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
    const [hover, setHover] = useState<number | null>(null);
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="focus:outline-none transition-transform duration-100 hover:scale-110"
          >
            <Star
              className={`h-7 w-7 ${
                (hover !== null ? star <= hover : star <= value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-muted rounded-xl aspect-square relative overflow-hidden flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img 
              src={resolveMediaUrl(product.images[0].url)} 
              alt={product.name}
              className="object-cover w-full h-full animate-fade-in"
            />
          ) : (
            <div className="text-muted-foreground text-lg">No Image Available</div>
          )}
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-2xl font-semibold mt-4">₹{finalPrice.toFixed(2)}</p>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Select Variant</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant: any) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                    onClick={() => setSelectedVariant(variant)}
                    className="rounded-full px-5 transition-all"
                  >
                    {variant.name} 
                    {Number(variant.additionalPrice) > 0 && ` (+₹${variant.additionalPrice})`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center gap-4">
            <Button size="lg" className="w-full md:w-auto px-8 rounded-full shadow-md hover:shadow-lg transition-all" onClick={handleAddToCart} disabled={!selectedVariant}>
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-5 hover:bg-accent border-border active:scale-95 transition-all" 
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-5 w-5 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              <span className="ml-2 hidden sm:inline">{isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-10 border-t border-border">
        <h2 className="text-3xl font-extrabold tracking-tight mb-8">Reviews & Q&A</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* REVIEWS SECTION */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Customer Reviews 
              {reviews.length > 0 && <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>}
            </h3>

            {/* Review Aggregation / Statistics */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center sm:border-r border-border sm:pr-8 shrink-0">
                <p className="text-5xl font-black text-foreground">{product.averageRating || '0.0'}</p>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.round(product.averageRating || 0), "h-5 w-5")}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{reviews.length} customer ratings</p>
              </div>

              <div className="flex-1 w-full space-y-2">
                {ratingDistribution.map((dist) => (
                  <div key={dist.rating} className="flex items-center text-xs gap-3">
                    <span className="w-3 font-semibold">{dist.rating}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 bg-muted h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${dist.pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{dist.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a Review Form */}
            {user ? (
              <form onSubmit={handleSubmitReview} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Write a Review
                </h4>
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Rating</label>
                  <StarRatingInput value={rating} onChange={setRating} />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Review</label>
                  <textarea
                    placeholder="Tell us what you think of this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex min-h-[90px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                </div>

                <Button type="submit" disabled={submittingReview} className="rounded-full shadow-sm hover:shadow transition-all">
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Submit Review
                </Button>

                {reviewError && <p className="text-red-500 text-sm font-semibold">{reviewError}</p>}
                {reviewSuccess && <p className="text-green-600 text-sm font-semibold">{reviewSuccess}</p>}
              </form>
            ) : (
              <div className="bg-muted/30 border border-border p-6 rounded-2xl text-center space-y-3">
                <p className="text-sm text-muted-foreground">Please log in to write a review.</p>
                <Link href={`/auth/login?redirect=/products/${product.slug}`}>
                  <Button variant="outline" className="rounded-full px-6 shadow-sm hover:shadow transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                  No reviews yet. Share your experience!
                </div>
              ) : (
                reviews.map((rev: any) => {
                  const initialName = `${rev.user?.firstName?.[0] || ''}${rev.user?.lastName?.[0] || ''}`.toUpperCase();
                  const upvotes = rev.votes?.filter((v: any) => v.vote === 1).length || 0;
                  const downvotes = rev.votes?.filter((v: any) => v.vote === -1).length || 0;

                  return (
                    <div key={rev.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {initialName || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{rev.user?.firstName} {rev.user?.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {renderStars(rev.rating)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed pl-12">{rev.comment}</p>

                      <div className="flex items-center space-x-3 pl-12 mt-2 pt-2 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">Was this helpful?</span>
                        <button
                          onClick={() => handleVoteReview(rev.id, 1)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-border hover:bg-muted text-xs transition"
                        >
                          <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                          <span>{upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleVoteReview(rev.id, -1)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-border hover:bg-muted text-xs transition"
                        >
                          <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                          <span>{downvotes}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* QUESTIONS & ANSWERS SECTION */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Questions & Answers 
              {product.questions?.length > 0 && <span className="text-sm font-normal text-muted-foreground">({product.questions.length})</span>}
            </h3>

            {/* Ask Question Form */}
            {user ? (
              <form onSubmit={handleSubmitQuestion} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-lg font-bold flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" /> Ask a Question
                </h4>
                
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Ask a question about this product..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="flex h-10 w-full rounded-full border border-input bg-transparent px-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  />
                  <Button type="submit" disabled={submittingQuestion} className="rounded-full shadow-sm">
                    {submittingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>

                {questionError && <p className="text-red-500 text-sm font-semibold">{questionError}</p>}
                {questionSuccess && <p className="text-green-600 text-sm font-semibold">{questionSuccess}</p>}
              </form>
            ) : (
              <div className="bg-muted/30 border border-border p-6 rounded-2xl text-center space-y-3">
                <p className="text-sm text-muted-foreground">Please log in to ask a question.</p>
                <Link href={`/auth/login?redirect=/products/${product.slug}`}>
                  <Button variant="outline" className="rounded-full px-6 shadow-sm hover:shadow transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {!product.questions || product.questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                  No questions yet. Ask anything about the product!
                </div>
              ) : (
                product.questions.map((question: any) => (
                  <div key={question.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-primary">{question.user?.firstName || 'User'}</span>
                          <span>•</span>
                          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-semibold text-base text-foreground">Q: {question.title}</p>
                      </div>
                      
                      {user && replyingToQuestionId !== question.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingToQuestionId(question.id);
                            setAnswerText('');
                            setAnswerError(null);
                          }}
                          className="text-xs hover:bg-muted font-bold text-primary"
                        >
                          Answer
                        </Button>
                      )}
                    </div>

                    {/* Answers List */}
                    <div className="space-y-2 mt-2">
                      {question.answers && question.answers.length > 0 ? (
                        question.answers.map((ans: any) => (
                          <div key={ans.id} className="bg-muted/40 p-3.5 rounded-xl ml-4 border-l-2 border-primary/40 flex items-start space-x-2.5">
                            <CornerDownRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-[9px] text-muted-foreground">
                                <span className="font-semibold text-primary">{ans.user?.firstName || 'User'}</span>
                                <span>•</span>
                                <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">A: {ans.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic ml-4">No answers yet.</p>
                      )}
                    </div>

                    {/* Inline reply form */}
                    {replyingToQuestionId === question.id && (
                      <form onSubmit={(e) => handleSubmitAnswer(e, question.id)} className="ml-4 mt-3 space-y-2">
                        <textarea
                          placeholder="Type your answer..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" type="submit" disabled={submittingAnswer} className="rounded-full">
                            {submittingAnswer ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                            Submit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReplyingToQuestionId(null)} className="rounded-full">
                            Cancel
                          </Button>
                        </div>
                        {answerError && <p className="text-red-500 text-xs mt-1 font-semibold">{answerError}</p>}
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
