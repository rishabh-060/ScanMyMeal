const MiniLoader = () => {
    return <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 bg-transparent backdrop-blur-xs z-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 lg:border-4 border-amber-600 border-t-transparent"></div>
                <p className="text-lg lg:text-2xl text-amber-700 tracking-widest mx-auto">Processing...</p>
            </div>
}

export default MiniLoader