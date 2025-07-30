<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Web;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Validation\ValidationException;

class UserReviewController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'web_id' => 'nullable|exists:webs,id',
                'star' => 'nullable|integer|min:1|max:5',
                'page' => 'integer|min:1',
                'limit' => 'integer|min:1|max:50',
                'sort' => 'string|in:latest,oldest,highest_rating,lowest_rating'
            ]);

            $query = Review::with(['user:id,username,avatar_url', 'web:id,subdomain']);

            // Filter by web
            if (isset($validated['web_id'])) {
                $query->where('web_id', $validated['web_id']);
            }

            // Filter by rating
            if (isset($validated['star'])) {
                $query->where('star', $validated['star']);
            }

            // Sorting
            $sort = $validated['sort'] ?? 'latest';
            switch ($sort) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'highest_rating':
                    $query->orderBy('star', 'desc')->latest();
                    break;
                case 'lowest_rating':
                    $query->orderBy('star', 'asc')->latest();
                    break;
                default:
                    $query->latest();
                    break;
            }

            $limit = $validated['limit'] ?? 10;
            $reviews = $query->paginate($limit);

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách đánh giá.',
                'error_code' => 'FETCH_REVIEWS_FAILED',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    public function show($id): JsonResponse
    {
        try {
            $review = Review::with(['user:id,username,avatar_url', 'web:id,subdomain'])
                ->find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá.',
                    'error_code' => 'REVIEW_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $review
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy thông tin đánh giá.',
                'error_code' => 'FETCH_REVIEW_FAILED',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'web_id' => 'required|exists:webs,id',
                'star' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            $userId = Auth::id();

            if (!$this->canUserReviewWeb($userId, $validated['web_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần mua hàng thành công từ trang web này mới có thể đánh giá!',
                    'error_code' => 'NO_PURCHASE_HISTORY',
                ], 403);
            }


            $existingReview = Review::where('user_id', $userId)->where('web_id', $validated['web_id'])->first();
            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã đánh giá trang web này rồi. Vui lòng sử dụng chức năng cập nhật.',
                    'error_code' => 'REVIEW_EXISTS'
                ], 409);
            }

            $review = Review::create([
                'user_id' => $userId,
                'web_id' => $validated['web_id'],
                'star' => $validated['star'],
                'comment' => $validated['comment']
            ]);

            $review->load(['user:id,username,avatar_url', 'web:id,subdomain']);

            return response()->json([
                'success' => true,
                'message' => 'Tạo đánh giá thành công!',
                'data' => $review
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'error_code' => 'VALIDATION_ERROR',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đánh giá.',
                'error_code' => 'CREATE_REVIEW_FAILED',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'star' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            $userId = Auth::id();
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá.',
                    'error_code' => 'REVIEW_NOT_FOUND'
                ], 404);
            }

            if ($review->user_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền cập nhật đánh giá này.',
                    'error_code' => 'UNAUTHORIZED'
                ], 403);
            }

            $review->update([
                'star' => $validated['star'],
                'comment' => $validated['comment']
            ]);

            $review->load(['user:id,username,avatar_url', 'web:id,subdomain']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đánh giá thành công!',
                'data' => $review
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'error_code' => 'VALIDATION_ERROR',
                'errors' => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đánh giá.',
                'error_code' => 'UPDATE_REVIEW_FAILED',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    public function destroy($id): JsonResponse
    {
        try {
            $userId = Auth::id();
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đánh giá.',
                    'error_code' => 'REVIEW_NOT_FOUND'
                ], 404);
            }

            // Check ownership
            if ($review->user_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xóa đánh giá này.',
                    'error_code' => 'UNAUTHORIZED'
                ], 403);
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đánh giá thành công!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa đánh giá.',
                'error_code' => 'DELETE_REVIEW_FAILED',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Kiểm tra xem user có thể đánh giá web này không
     * Trạng thái đơn: 0 = pending, 1 = completed, 2 = cancelled
     */
    private function canUserReviewWeb(int $userId, int $webId): bool
    {
        // Query chính
        return Order::where('user_id', $userId)
            ->where('status', 1)
            ->whereHas('items.product', function ($query) use ($webId) {
                $query->where('web_id', $webId);
            })
            ->exists();
    }
}