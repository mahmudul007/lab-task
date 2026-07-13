<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;


#[Fillable(['created_by', 'text_content', 'image_url', 'is_private'])]
class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;

    public static array $storeRules = [
        'text_content' => 'nullable|string',
        'images' => 'nullable|array',
        'images.*' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        'is_private' => 'required|boolean',
    ];

    public static array $updateRules = [
        'text_content' => 'nullable|string',
        'images' => 'nullable|array',
        'images.*' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        'is_private' => 'sometimes|boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
    // post like
    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }
    // images
    public function images()
    {
        return $this->hasMany(PostImage::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
