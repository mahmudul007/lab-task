
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;


// Public Routes
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login'])->name('login');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Posts
    Route::get('posts', [PostController::class, 'index']);
    Route::post('posts', [PostController::class, 'store']);
    Route::get('posts/{id}', [PostController::class, 'show'])->name('single-post');
    Route::put('posts/{id}', [PostController::class, 'update'])->name('update-post');
    
    Route::delete('posts/{id}', [PostController::class, 'destroy']);
    Route::get('posts/{postId}/like', [PostController::class, 'toggleLike']);
    Route::get('posts/{postId}/likers', [PostController::class, 'likers']);

    // Comments
    Route::get('posts/{postId}/comments', [CommentController::class, 'index']);
    Route::post('posts/{postId}/comments', [CommentController::class, 'store']);
    Route::delete('comments/{commentId}', [CommentController::class, 'destroy']);
    
    // Replies
    Route::get('comments/{commentId}/replies', [CommentController::class, 'replies']);
    Route::post('comments/{commentId}/replies', [CommentController::class, 'reply']);
    
    // Comment Likes
    Route::post('comments/{commentId}/like', [CommentController::class, 'toggleLike']);
    Route::get('comments/{commentId}/likers', [CommentController::class, 'likers']);
});
