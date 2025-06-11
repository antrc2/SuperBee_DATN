"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
// Temporarily comment out unresolved imports; replace with correct paths
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tag,
  User,
  Globe,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Key,
  Mail,
  Hash,
  TrendingUp,
  Gift,
  Phone, // Added Phone icon
} from "lucide-react"
import api from "@utils/http"

// Placeholder components if imports fail
const Badge = ({ children, className, variant = "default" }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${className} ${variant === "secondary" ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"}`}>
    {children}
  </span>
)
const Card = ({ children }) => <div className="bg-white rounded-lg shadow">{children}</div>
const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>
const CardTitle = ({ children }) => <h3 className="text-lg font-bold">{children}</h3>
const CardContent = ({ children }) => <div className="p-4">{children}</div>
const Separator = () => <hr className="my-4 border-gray-200" />
const Avatar = ({ children }) => <div className="relative">{children}</div>
const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="w-12 h-12 rounded-full" />
const AvatarFallback = ({ children }) => <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">{children}</div>

export default function ShowDiscountCodePage() {
  const { id } = useParams()
  const [discountCode, setDiscountCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch discount code data
  useEffect(() => {
    const fetchDiscountCode = async () => {
      try {
        const response = await api.get(`/discountcode/${id}`)
        setDiscountCode(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải chi tiết mã giảm giá!")
      } finally {
        setLoading(false)
      }
    }
    fetchDiscountCode()
  }, [id])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không giới hạn"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Get status badge
  const getStatusBadge = (status) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <Shield className="w-3 h-3 mr-1" />
        Hoạt động
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Shield className="w-3 h-3 mr-1" />
        Không hoạt động
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
          <span>Đang tải...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    )
  }

  if (!discountCode) {
    return (
      <div className="p-6">
        <div className="text-gray-500 text-center">Không tìm thấy mã giảm giá!</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Thông tin chi tiết về mã giảm giá: <strong>{discountCode.code}</strong> </p>
        </div>
        {getStatusBadge(discountCode.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Discount Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discount Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Thông tin mã giảm giá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Mã giảm giá</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                      {discountCode.code}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="font-mono">{discountCode.id}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Giới hạn sử dụng</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{discountCode.usage_limit === -1 ? "Không giới hạn" : discountCode.usage_limit}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Đã sử dụng</label>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span>{discountCode.total_used} lần</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(discountCode.start_date)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(discountCode.end_date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Amount Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Thông tin giảm giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Mức giảm</div>
                  <div className="text-xl font-bold text-green-600">{discountCode.discount_value}%</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Đơn hàng tối thiểu</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(discountCode.min_discount_amount)}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Giảm tối đa</div>
                  <div className="text-xl font-bold text-purple-600">{formatCurrency(discountCode.max_discount_amount)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Người tạo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={discountCode.user?.avatar_url || "/placeholder.svg"} alt={discountCode.user?.username} />
                  {/* <AvatarFallback>{discountCode.user?.username.charAt(0).toUpperCase()}</AvatarFallback> */}
                </Avatar>
                <div>
                  <div className="font-semibold">{discountCode.user?.username || "Không xác định"}</div>
                  <div className="text-sm text-gray-500">ID: {discountCode.user?.id || "N/A"}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{discountCode.user?.email || "Không có"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" /> {/* Now defined */}
                  <span>{discountCode.user?.phone || "Không có"}</span>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(discountCode.user?.status || 0)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Web Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Thông tin website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subdomain</label>
                  <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{discountCode.user?.web?.subdomain || "N/A"}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">API Key</label>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm">{discountCode.user?.web?.api_key.substring(0, 8) || "N/A"}...</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(discountCode.user?.web?.status || 0)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}