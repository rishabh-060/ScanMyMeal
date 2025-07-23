import Image from "next/image"


const Loader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm">
    {/* Glowing spinner */}
    <div className="relative flex items-center justify-center">
      <div className="absolute animate-ping rounded-full h-16 w-16 bg-amber-600 opacity-20" />
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-amber-600 border-t-transparent" />
      <Image
        className="absolute h-8 w-8 rounded object-contain"
        src="/assets/favicon.png"
        alt="Scan My Meal"
        height={32}
        width={32}
      />
    </div>

    {/* Loading text */}
    <p className="text-lg lg:text-2xl text-amber-700 tracking-widest animate-pulse">
      Please wait...
    </p>
  </div>
)

export default Loader