const Loader = () => (
  <div className="fixed inset-0 flex flex-col justify-center items-center gap-2 bg-transparent backdrop-blur-xs z-50">
    <div className="animate-spin rounded-full h-8 w-8 border-2 lg:border-4 border-amber-600 border-t-transparent"></div>
    <p className="text-lg lg:text-xl text-amber-700 tracking-widest mx-auto">Please wait...</p>
  </div>
)

export default Loader