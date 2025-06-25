<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable,  HasRoles;

    protected $fillable = [
        'username',
        'password', // Make sure to hash this in a mutator or service
        'email',
        'phone',
        'avatar_url',
        'donate_code',
        'web_id',
        'status',
        'email_verified_at', // Thêm vào fillable
        'email_verification_token', // Thêm vào fillable
        'email_verification_expires_at', // Thêm vào fillable
        'password_reset_token', // Thêm vào fillable
        'password_reset_expires_at', // Thêm vào fillable
    ];
    protected $hidden = [
        'password',
        'remember_token', // Nếu có
        'email_verification_token', // Ẩn token này khỏi API response
        'email_verification_expires_at', // Ẩn token này khỏi API response
        'password_reset_token', // Ẩn token này khỏi API response
        'password_reset_expires_at', // Ẩn token này khỏi API response
    ];
    public function web()
    {
        return $this->belongsTo(Web::class);
    }

    public function createdWebs()
    {
        return $this->hasMany(Web::class, 'user_id');
    }

    public function createdCategories()
    {
        return $this->hasMany(Category::class, 'created_by');
    }

    public function updatedCategories()
    {
        return $this->hasMany(Category::class, 'updated_by');
    }

    public function createdProducts()
    {
        return $this->hasMany(Product::class, 'created_by');
    }

    public function updatedProducts()
    {
        return $this->hasMany(Product::class, 'updated_by');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function productReports()
    {
        return $this->hasMany(ProductReport::class);
    }

    public function cart()
    {
        // Giả sử một user chỉ có một cart
        return $this->hasOne(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function wallet()
    {
        // Giả sử một user chỉ có một wallet
        return $this->hasOne(Wallet::class);
    }

    public function rechargeCards()
    {
        return $this->hasMany(RechargeCard::class);
    }

    public function rechargeBanks()
    {
        return $this->hasMany(RechargeBank::class);
    }

    public function withdraw()
    {
        return $this->hasMany(Withdraw::class);
    }

    public function createdPromotions()
    {
        return $this->hasMany(Promotion::class, 'created_by');
    }

    public function updatedPromotions()
    {
        return $this->hasMany(Promotion::class, 'updated_by');
    }

    public function createdDonatePromotions()
    {
        return $this->hasMany(DonatePromotion::class, 'created_by');
    }

    public function updatedDonatePromotions()
    {
        return $this->hasMany(DonatePromotion::class, 'updated_by');
    }

    public function systemLogs()
    {
        return $this->hasMany(SystemLog::class);
    }

    public function postsAuthored()
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function agent()
    {
        return $this->hasOne(Agent::class, 'user_id');
    }

    /**
     * Lấy tất cả các phòng chat mà người dùng này đã tạo.
     *
     *
     */
    public function createdChatRooms()
    {
        return $this->hasMany(ChatRoom::class, 'created_by');
    }

    /**
     * Lấy tất cả tin nhắn đã gửi bởi người dùng này.
     *
     * 
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Lấy tất cả các phòng chat mà người dùng này tham gia (với bất kỳ vai trò nào).
     *
     * 
     */
    public function chatRooms()
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_room_participants', 'user_id', 'chat_room_id')
                    ->withPivot('role', 'joined_at', 'left_at')
                    ->withTimestamps();
    }

    public function createdBanners()
    {
        return $this->hasMany(Banner::class, 'created_by');
    }

    public function updatedBanners()
    {
        return $this->hasMany(Banner::class, 'updated_by');
    }

    public function affiliateData() // User này là một affiliate
    {
        return $this->hasOne(Affiliate::class, 'user_id');
    }

    public function referredAffiliates() // User này đã giới thiệu các affiliates khác
    {
        return $this->hasMany(Affiliate::class, 'affiliated_by');
    }
    public function referredUsers()
{
    return $this->hasManyThrough(
        User::class,        // Model cuối cùng
        Affiliate::class,   // Model trung gian
        'affiliated_by',    // Khóa ngoại trên Affiliate (trỏ đến user hiện tại)
        'id',               // Khóa chính của bảng User
        'id',               // localKey của user hiện tại
        'user_id'           // khóa ngoại của bảng Affiliate trỏ đến bảng User
    );
}


    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }
}
