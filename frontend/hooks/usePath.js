const { usePathname } = require("next/navigation")

const usePath = (path) => {
    // const router = useRouter()
    const pathname = usePathname()

    const isTrue = pathname === path
    return isTrue
}

export default usePath