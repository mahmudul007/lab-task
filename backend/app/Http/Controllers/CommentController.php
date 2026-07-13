<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    private function checkPostVisibility($postId, $userId)
    {
        $visible = Post::where('id', $postId)
            ->where(fn($q) => $q->where('is_private', false)->orWhere(fn($q2) => $q2->where('is_private', true)->where('created_by', $userId)))
            ->exists();

        if (!$visible) abort(404, 'Post not found');
    }

    public function index(Request $request, $postId)
    {
        $userId = $request->user()->id;
        $this->checkPostVisibility($postId, $userId);

        $comments = Comment::with('user')
            ->where('post_id', $postId)
            ->whereNull('parent_comment_id')
            ->orderByDesc('created_at')
            ->paginate(20);

        $commentIds = $comments->pluck('id');

        if ($commentIds->isNotEmpty()) {
            // RAW COUNTS
            $likeCounts = DB::table('comment_likes')->whereIn('comment_id', $commentIds)->selectRaw('comment_id, COUNT(*) as count')->groupBy('comment_id')->pluck('count', 'comment_id');
            $likedByMe = DB::table('comment_likes')->whereIn('comment_id', $commentIds)->where('user_id', $userId)->pluck('comment_id')->toArray();
            $replyCounts = DB::table('comments')->whereIn('parent_comment_id', $commentIds)->selectRaw('parent_comment_id, COUNT(*) as count')->groupBy('parent_comment_id')->pluck('count', 'parent_comment_id');

            $comments->transform(function ($comment) use ($likeCounts, $likedByMe, $replyCounts) {
                $comment->like_count = $likeCounts[$comment->id] ?? 0;
                $comment->is_liked_by_me = in_array($comment->id, $likedByMe);
                $comment->reply_count = $replyCounts[$comment->id] ?? 0;
                return $comment;
            });
        }

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, $postId)
    {
        $userId = $request->user()->id;
        $this->checkPostVisibility($postId, $userId);

        $validated = $request->validate(['text_content' => 'required|string|max:2000']);

        $comment = Comment::create([
            'post_id' => $postId,
            'user_id' => $userId,
            'text_content' => $validated['text_content'],
        ]);

        return response()->json(['message' => 'Comment added', 'data' => $comment->load('user')], 201);
    }

    public function replies(Request $request, $commentId)
    {
        $userId = $request->user()->id;

        $replies = Comment::with('user')
            ->where('parent_comment_id', $commentId)
            ->orderByAsc('created_at')
            ->paginate(20);

        $replyIds = $replies->pluck('id');

        if ($replyIds->isNotEmpty()) {
            $likeCounts = DB::table('comment_likes')->whereIn('comment_id', $replyIds)->selectRaw('comment_id, COUNT(*) as count')->groupBy('comment_id')->pluck('count', 'comment_id');
            $likedByMe = DB::table('comment_likes')->whereIn('comment_id', $replyIds)->where('user_id', $userId)->pluck('comment_id')->toArray();

            $replies->transform(function ($reply) use ($likeCounts, $likedByMe) {
                $reply->like_count = $likeCounts[$reply->id] ?? 0;
                $reply->is_liked_by_me = in_array($reply->id, $likedByMe);
                return $reply;
            });
        }

        return response()->json(['data' => $replies]);
    }

    public function reply(Request $request, $commentId)
    {
        $userId = $request->user()->id;
        $parentComment = Comment::findOrFail($commentId);
        $this->checkPostVisibility($parentComment->post_id, $userId);

        $validated = $request->validate(['text_content' => 'required|string|max:2000']);

        $reply = Comment::create([
            'post_id' => $parentComment->post_id,
            'user_id' => $userId,
            'parent_comment_id' => $commentId,
            'text_content' => $validated['text_content'],
        ]);

        return response()->json(['message' => 'Reply added', 'data' => $reply->load('user')], 201);
    }

    public function toggleLike(Request $request, $commentId)
    {
        $userId = $request->user()->id;

        if (!Comment::where('id', $commentId)->exists()) {
            return response()->json(['error' => 'Comment not found'], 404);
        }

        // Eloquent Toggle
        $existingLike = CommentLike::where('comment_id', $commentId)->where('user_id', $userId)->first();

        if ($existingLike) {
            $existingLike->delete();
            $isNowLiked = false;
        } else {
            CommentLike::create(['comment_id' => $commentId, 'user_id' => $userId]);
            $isNowLiked = true;
        }

        // Raw Count
        $likeCount = DB::table('comment_likes')->where('comment_id', $commentId)->count();

        return response()->json(['data' => ['liked' => $isNowLiked, 'like_count' => $likeCount]]);
    }

    public function likers(Request $request, $commentId)
    {
        $likers = CommentLike::with('user')->where('comment_id', $commentId)->paginate(20);
        return response()->json(['data' => $likers]);
    }

    public function destroy(Request $request, $commentId)
    {
        $comment = Comment::where('id', $commentId)->where('user_id', $request->user()->id)->firstOrFail();
        $comment->delete(); // ON DELETE CASCADE এ replies ও likes ডিলিট হয়ে যাবে
        return response()->json(['message' => 'Comment deleted']);
    }
}