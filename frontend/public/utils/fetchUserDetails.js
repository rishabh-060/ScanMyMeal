import Axios from "./Axios"
import summaryApi from "../common/summaryApi"
import { toast } from "react-toastify"


const fetchUserDetails = async () => {
    try {
        const response = await Axios({
            ...summaryApi.getuser
        })

        return response?.data
    } catch (error) {
        toast.error(error?.response?.data?.massage)
    }
}

export default fetchUserDetails