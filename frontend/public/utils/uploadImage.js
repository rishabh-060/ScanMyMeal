import Axios from './Axios'
import summaryApi from '../common/summaryApi'

const uploadImage = async (img) => {
    try {
        const formData = new FormData()
        formData.append('image', img)

        const response = await Axios ({
            ...summaryApi.uploadImage,
            data : formData
        })

        return response
    } catch (error) {
        return error
    }
}

export default uploadImage