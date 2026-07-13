<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;


#[Fillable(['post_id', 'image_url'])]
class PostImage extends Model
{
    protected $table = 'post_images';

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
