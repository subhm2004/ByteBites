import { useNavigate } from "react-router-dom";
import { BiTime } from "react-icons/bi";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();
  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#E23744]/15 hover:shadow-lg hover:shadow-[#E23744]/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#E23744]/25 dark:hover:shadow-[#E23744]/10 ${
        !isOpen ? "opacity-90" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-36 w-full overflow-hidden sm:h-40">
        <img
          src={image}
          alt=""
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            !isOpen ? "grayscale" : ""
          }`}
        />

        {isOpen && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            Open
          </span>
        )}

        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              Closed
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <h3 className="truncate font-bold text-gray-900 dark:text-white">{name}</h3>
        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <BiTime className="h-3.5 w-3.5 text-[#E23744]" />
          {distance} km · 25–35 min
        </p>
      </div>
    </div>
  );
};

export default RestaurantCard;
