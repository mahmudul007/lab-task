<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentCollection;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $userId =auth()->user()->id;
        $this->checkPostVisibility($postId, $userId);
        $paginate = $request->input('paginate', 20);

        $comments = Comment::with('user')
            ->where('post_id', $postId)
            ->whereNull('parent_comment_id')
            ->orderBy('created_at', 'desc')
            ->paginate($paginate);

        return new CommentCollection($comments);
    }

    public function store(Request $request, $postId)
    {
        $userId= Auth::user()->id;
        $this->checkPostVisibility($postId, $userId);

        $validated = $request->validate(['text_content' => 'required|string|max:2000']);

        $comment = Comment::create([
            'post_id' => $postId,
            'user_id' => $userId,
            'text_content' => $validated['text_content'],
        ]);

       return new CommentResource($comment);
    }

    public function replies(Request $request, $commentId)
    {

        $replies = Comment::with('user')
            ->where('parent_comment_id', $commentId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return new CommentCollection($replies);
    }

    public function reply(Request $request, $commentId)
    {
        $userId = auth()->user()->id;
        $parentComment = Comment::findOrFail($commentId);
        $this->checkPostVisibility($parentComment->post_id, $userId);

        $validated = $request->validate(['text_content' => 'required|string|max:2000']);

        $reply = Comment::create([
            'post_id' => $parentComment->post_id,
            'user_id' => $userId,
            'parent_comment_id' => $commentId,
            'text_content' => $validated['text_content'],
        ]);
        return new CommentResource($reply);
    }

    public function toggleLike(Request $request, $commentId)
    {
        $userId = auth()->user()->id;

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
        $comment = Comment::find($commentId);
        return response()->json(['is_liked' => $isNowLiked, 'like_count' => $comment->commentLikes()->count()]);
    }

    public function likers(Request $request, $commentId)
    {
        
        $paginate = $request->input('paginate', 20);
        $likers = CommentLike::with('user')->where('comment_id', $commentId)->paginate($paginate);
           return response()->json(['data' => $likers]);
    }

    public function destroy(Request $request, $commentId)
    {
        $comment = Comment::where('id', $commentId)->where('user_id', auth()->user()->id)->firstOrFail();
        $comment->delete(); 
        return response()->json(['message' => 'Comment deleted']);
    }
}