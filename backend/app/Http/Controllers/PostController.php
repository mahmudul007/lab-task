<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostCollection;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $posts = Post::with(['user', 'images'])
            ->where('is_private', false)
            ->orWhere(function ($q) use ($user) {
                $q->where('is_private', true)->where('created_by', $user->id);
            })
            ->orderByDesc('created_at')
            ->paginate(10);
        return new PostCollection($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $post = Post::create($data);
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('posts', 'public');

                    $post->images()->create([
                        'image_url' => Storage::url($path)
                    ]);
                }
            }

            DB::commit();

            return new PostResource($post->load('user', 'images'));
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $post = Post::with('user')
            ->where('is_private', false)
            ->orWhere(function ($q) use ($user) {
                $q->where('is_private', true)->where('created_by', $user->id);
            })
            ->find($id);
        if (!$post) {
            return response()->json([
                'message' => 'Post not found',
            ], 404);
        }

        return new PostResource($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json([
                'message' => 'Post not found',
            ], 404);
        }

        if ($post->created_by != Auth::user()->id) {
            return response()->json([
                'message' => 'You are not authorized to update this post',
            ], 403);
        }

        try {
            DB::beginTransaction();
            $post->update($request->validated());
            if ($request->hasFile('images')) {
                $post->images()->delete();
                foreach ($request->file('images') as $image) {
                    $path = $image->store('posts', 'public');

                    $post->images()->create([
                        'image_url' => Storage::url($path)
                    ]);
                }
            }
            DB::commit();
            return new PostResource($post->load('user', 'images'));
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        if ($post->created_by != Auth::user()->id) {
            return response()->json([
                'message' => 'You are not authorized to delete this post',
            ], 403);
        }
        $post->delete();
        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }

    public function toggleLike($postId)
    {
        $userId = Auth::user()->id;

        $postExists = Post::where('id', $postId)
            ->where(function ($q) use ($userId) {
                $q->where('is_private', false)->orWhere(fn($q2) => $q2->where('is_private', true)->where('created_by', $userId));
            })
            ->exists();

        if (!$postExists) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        $existingLike = PostLike::where('post_id', $postId)->where('user_id', $userId)->first();

        if ($existingLike) {
            $existingLike->delete();
            $isNowLiked = false;
        } else {
            PostLike::create([
                'post_id' => $postId,
                'user_id' => $userId,
            ]);
            $isNowLiked = true;
        }
        $likeCount = PostLike::where('post_id', $postId)->count();

        return response()->json([
            'data' => [
                'liked' => $isNowLiked,
                'like_count' => $likeCount,
            ],
        ]);
    }

    public function likers(Request $request, $postId)
    {
        $likers = PostLike::with('user')->where('post_id', $postId)->paginate(20);
        return response()->json(['data' => $likers]);
    }
}
