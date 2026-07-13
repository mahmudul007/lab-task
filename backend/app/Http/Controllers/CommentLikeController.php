<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentLikeController extends Controller
{
    public function toggleCommentLike( $commentId)
    {
        $userId = Auth::user()->id;

        $commentExists = Comment::where('id', $commentId)->exists();

        if (!$commentExists) {
            return response()->json(['error' => 'Comment not found'], 404);
        }

        $existingLike = CommentLike::where('comment_id', $commentId)->where('user_id', $userId)->first();

        if ($existingLike) {
            $existingLike->delete();
            $isNowLiked = false;
        } else {
            CommentLike::create([
                'id' => Str::uuid()->toString(),
                'comment_id' => $commentId,
                'user_id' => $userId,
            ]);
            $isNowLiked = true;
        }

        $likeCount = CommentLike::where('comment_id', $commentId)->count();

        return response()->json([
            'data' => [
                'liked' => $isNowLiked,
                'like_count' => $likeCount,
            ],
        ]);
    }
}
