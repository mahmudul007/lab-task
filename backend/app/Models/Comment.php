<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
  {
      /** @use HasFactory<\Database\Factories\CommentFactory> */
    
    use HasFactory;
    protected $fillable = [
        'post_id',
        'user_id',
        'parent_comment_id',
        'text_content',
    ];

    public static array $storeRules = [
        'post_id' => 'required|exists:posts,id',
        'parent_comment_id' => 'nullable|exists:comments,id',
        'text_content' => 'required|string',
    ];

    public static array $updateRules = [
        'text_content' => 'sometimes|required|string',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_comment_id');
    }
    public function commentLikes(): HasMany
    {
        return $this->hasMany(CommentLike::class);
    }
}
