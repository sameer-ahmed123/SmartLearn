import apiClient from "./apiClient";
import  type {ProfileData} from "../types/Profile/Types"


export const profileService = {
    getMyProfile: async (): Promise<ProfileData> => {
        const response = await apiClient.get("/auth/profiles/me/")
        return response.data
    },
    updateMyProfile:async (data:Partial<ProfileData>): Promise<ProfileData> =>{
        const response = await apiClient.patch<ProfileData>("/auth/profiles/me/",data)
        return response.data
    },
    updateAvatar:async(file:File):Promise<ProfileData>=>{
        const formData = new FormData()
        formData.append('avatar',file)
        const response = await apiClient.patch<ProfileData>("/auth/profiles/me/",formData,{
            headers:{
                "Content-Type":"multipart/form-data",
            }
        })
        return response.data
    },
    changePassword:async(passwords:any)=>{
        const response = await apiClient.post("auth/change-pass/", passwords)
        return response.data
    }
    
}