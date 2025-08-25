import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../utils/http";

const ReviewWeb = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get("/home/website");
            const data = response.data;

            if (data.success && data.data.recent_reviews) {
                setReviews(data.data.recent_reviews);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
        ));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1 >= Math.ceil(reviews.length / getItemsPerSlide()) ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 < 0 ? Math.ceil(reviews.length / getItemsPerSlide()) - 1 : prev - 1));
    };

    const getItemsPerSlide = () => {
        if (typeof window !== "undefined") {
            if (window.innerWidth >= 1280) return 4; // xl
            if (window.innerWidth >= 1024) return 3; // lg
            if (window.innerWidth >= 768) return 2; // md
        }
        return 1; // sm
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-xl p-6 border-themed animate-pulse">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                <div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/5"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-primary mb-4">Khách hàng nói gì về SuperBee</h2>
                <p className="text-secondary">Chưa có đánh giá nào</p>
            </div>
        );
    }

    const itemsPerSlide = getItemsPerSlide();
    const startIndex = currentIndex * itemsPerSlide;
    const visibleReviews = reviews.slice(startIndex, startIndex + itemsPerSlide);

    return (
        <div className="py-8 max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2">Khách hàng nói gì về SuperBee?</h2>
                <p className="text-secondary">Chia sẻ trải nghiệm thực tế từ cộng đồng người dùng</p>
            </div>

            {/* Reviews Slider */}
            <div className="relative">
                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-card border-themed rounded-full flex items-center justify-center text-primary hover:bg-hover transition-colors"
                    disabled={reviews.length <= itemsPerSlide}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-card border-themed rounded-full flex items-center justify-center text-primary hover:bg-hover transition-colors"
                    disabled={reviews.length <= itemsPerSlide}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-8">
                    {visibleReviews.map((review) => (
                        <div key={review.id} className="bg-card rounded-xl p-6 border border-themed hover:border-primary transition-colors shadow-sm">
                            {/* User Info */}
                            <div className="flex items-center space-x-3 mb-4">
                                {review.user.avatar_url ? (
                                    <img src={review.user.avatar_url} alt={review.user.username} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {review.user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-primary text-sm">{review.user.username}</h3>
                                    <p className="text-secondary text-xs">Khách hàng</p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center mb-4">{renderStars(review.star)}</div>

                            {/* Comment */}
                            <p className="text-content text-sm leading-relaxed line-clamp-4">
                                {review.comment || "Dịch vụ tốt, sẽ tiếp tục sử dụng."}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Dots Indicator */}
                {Math.ceil(reviews.length / itemsPerSlide) > 1 && (
                    <div className="flex justify-center space-x-2 mt-8">
                        {Array.from({
                            length: Math.ceil(reviews.length / itemsPerSlide),
                        }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? "bg-primary" : "bg-gray-400"}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewWeb;
