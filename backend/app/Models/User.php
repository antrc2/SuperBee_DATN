<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'password',
        'fullname',
        'email',
        'phone',
        'avatar_url',
        'balance',
        'role_id',
        'web_id',
        'affiliated_by',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'balance' => 'integer',
            'status' => 'integer',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [

            'api_key' => $this->apikey,      // nếu có
            'web_id' => $this->id,       // nếu có
            // thêm gì tùy bạn

        ];
    }
    /**
     * Get the role that the user belongs to.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the web that the user is associated with.
     */
    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }

    /**
     * Get the user who referred this user.
     */
    public function affiliatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'affiliated_by');
    }

    /**
     * Get the webs owned by the user.
     */
    public function webs(): HasMany
    {
        return $this->hasMany(Web::class);
    }

    /**
     * Get the bank histories for the user.
     */
    public function bankHistories(): HasMany
    {
        return $this->hasMany(BankHistory::class);
    }

    /**
     * Get the card histories for the user.
     */
    public function cardHistories(): HasMany
    {
        return $this->hasMany(CardHistory::class);
    }

    /**
     * Get the carts for the user.
     */
    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Get the chats for the user.
     */
    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    /**
     * Get the discount codes for the user.
     */
    public function discountCodes(): HasMany
    {
        return $this->hasMany(DiscountCode::class);
    }

    /**
     * Get the logs for the user.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(Log::class);
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the orders for the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the products created by the user.
     */
    public function createdProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'created_by');
    }

    /**
     * Get the products updated by the user.
     */
    public function updatedProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'updated_by');
    }

    /**
     * Get the refresh tokens for the user.
     */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get the reviews for the user.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the tickets for the user.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
