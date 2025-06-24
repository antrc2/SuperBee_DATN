import CategoryCha from "../../components/Client/Category/CategoryCha";
import { Gamepad2, Sparkles } from "lucide-react";

export default function ListCategoryCha({ categories }) {
  const cate = categories || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Danh Mục Game
          </h2>
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          Khám phá thế giới game đa dạng với những tài khoản chất lượng cao
        </p>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-12 justify-between items-center  ">
          {cate.map((acc) => (
            <div key={acc.id} className="flex-1 ">
              <CategoryCha item={acc} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
