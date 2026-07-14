<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
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
            'post_id' => $this->post_id,
            'user_id' => $this->user_id,
            'parent_comment_id' => $this->parent_comment_id,
            'text_content' => $this->text_content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user'),
            'like_count' => $this->whenLoaded('commentLikes', $this->commentLikes->count()),
            'is_liked_by_me' => $this->whenLoaded('commentLikes', $this->commentLikes->contains('user_id', auth()->user()->id)),
            'reply_count' => $this->whenLoaded('replies', $this->replies->count()),
        ];
    }
}
