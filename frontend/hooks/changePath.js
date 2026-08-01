import { useRouter } from "next/navigation";

const useChangePath = () => {
    const router = useRouter();
    const changePath = (p, email = '', success = false) => {
        window.dispatchEvent(new Event('scanmymeal:navigation-start'));
        if (email) {
            router.push(`/${p}?email=${encodeURIComponent(email)}`);
        }
        else {
            router.push(p);
        }
    };

    return changePath;
};

export default useChangePath;
