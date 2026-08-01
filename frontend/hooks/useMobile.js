"use client"
import React,{ useState, useEffect } from "react"

const useMobile = (breakpoint = 768) => {
    const [isMobile, setisMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setisMobile(window.innerWidth < breakpoint);
        };
    
        // Run on mount
        handleResize();
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        }, [breakpoint]);
    return [isMobile]
}

export default useMobile
