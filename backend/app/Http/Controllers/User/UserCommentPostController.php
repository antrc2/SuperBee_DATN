<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment; // Assuming you have a Comment model
use Illuminate\Support\Facades\Auth; // For getting the authenticated user

class UserCommentPostController extends Controller
{
    /**
     * Store a newly created comment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function create(Request $request)
    {

        $validatedData = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $authorId = $request->user_id;


        if (!$authorId) {
            return response()->json([
                'message' => 'Unauthorized: User not authenticated.',
                'status' => false,
                'data' => null
            ], 401);
        }

        try {

            $comment = new Comment();
            $comment->post_id = $validatedData['post_id'];
            $comment->content = $validatedData['content'];
            $comment->parent_id = $validatedData['parent_id'] ?? null;
            $comment->user_id  = $authorId;


            $comment->save();
            return response()->json([
                'message' => 'Bình luận thành công',
                'status' => true,
                'data' => $comment
            ], 201);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Đã xảy ra lỗi khi thêm bình luận: ' . $e->getMessage(),
                'status' => false,
                'data' => null
            ], 500);
        }
    }
    public function getCommentByPost($id)
    {
        try {



            $comments = Comment::with('user')->where("post_id", $id)->get();

            // Trả về response JSON
            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách bình luận thành công',
                'data' => $comments
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy bài viết',
            ], 404);
        } catch (\Throwable $th) {
            // Log lỗi nếu cần: Log::error($th);
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy bình luận',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}
