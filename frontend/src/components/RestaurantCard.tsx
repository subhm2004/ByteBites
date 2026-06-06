import { useNavigate } from "react-router-dom";
import { BiChevronRight, BiStar, BiTime } from "react-icons/bi";
import { MdDeliveryDining } from "react-icons/md";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
  featured?: boolean;
};

const RestaurantCard = ({
  id,
  image,
  name,
  distance,
  isOpen,
  featured = false,
}: props) => {
  const navigate = useNavigate();

  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50 transition duration-300 hover:-translate-y-1 hover:border-[#E23744]/20 hover:shadow-xl hover:shadow-[#E23744]/10 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-[#E23744]/30 dark:hover:shadow-[#E23744]/5 ${
        featured ? "sm:col-span-2 lg:col-span-2" : ""
      } ${!isOpen ? "opacity-95" : ""}`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div
        className={`relative w-full overflow-hidden ${
          featured ? "h-48 sm:h-56" : "h-40 sm:h-44"
        }`}
      >
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-110 ${
            !isOpen ? "grayscale" : ""
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {isOpen ? (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Open
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            Closed
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="truncate text-base font-black text-white sm:text-lg">
            {name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/85">
            <span className="flex items-center gap-0.5">
              <BiStar className="text-amber-400" />
              4.2
            </span>
            <span className="flex items-center gap-0.5">
              <BiTime />
              25–35 min
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-3.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E23744]/10 text-[#E23744] dark:bg-[#E23744]/20 dark:text-[#ff6b7a]">
            <MdDeliveryDining className="h-4 w-4" />
          </span>
          <span>
            <span className="block font-semibold text-gray-800 dark:text-gray-200">
              {distance} km away
            </span>
            <span>Free delivery over ₹250</span>
          </span>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-[#E23744] group-hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-[#E23744]">
          <BiChevronRight className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
};

export default RestaurantCard;
