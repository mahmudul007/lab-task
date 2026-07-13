<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;


#[Fillable(['post_id','user_id'])]
class PostLike extends Model
{
    /** @use HasFactory<\Database\Factories\PostLikeFactory> */
    use HasFactory;

    public static array $storeRules = [
        'post_id' => 'required|exists:posts,id',
    ];

    public static array $updateRules = [
        'post_id' => 'sometimes|required|exists:posts,id',
    ];

    public $timestamps = false;

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
