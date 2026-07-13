<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text_content' => $this->text_content,
            'is_private' => $this->is_private,
            'user' => $this->user,
            'images' => $this->images,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'like_count' => $this->whenLoaded('likes', $this->likes->count()),
            'comment_count' => $this->whenLoaded('comments', $this->comments->count()),
            'is_liked_by_me' => $this->whenLoaded('likes', $this->likes->contains('user_id', auth()->id())),
        ];
    }
}
