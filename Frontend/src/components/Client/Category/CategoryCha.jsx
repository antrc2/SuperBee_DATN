export default function CategoryCha({ item }) {
  return (
    <div className="w-full min-w-28 max-w-32">
      <div className="flex justify-center ">
        <img
          className=" object-cover w-14 h-14"
          src={
            item?.image ??
            "https://i.pinimg.com/736x/9b/aa/66/9baa66a3fb33bfcea3e8b791dee5d1c7.jpg"
          }
        />
      </div>
      <div className="text-center text-[14px] p-2">
        {item?.name ?? "ACC FREE FIRE GIÁ RẺ"}
      </div>
    </div>
  );
}
