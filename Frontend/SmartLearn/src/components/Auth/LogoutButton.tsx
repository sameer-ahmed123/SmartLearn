import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api/apiClient";

const LogoutButton = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout)
    const getRefreshToken = () => useAuthStore.getState().refreshToken;
    const handleLogout = async () => {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
            try {
                await apiClient.post('auth/logout/', { refresh: refreshToken });
            }
            catch (e) {
                console.log("ERROR", e)
            }

        }
        logout()
        navigate('/login')
    }
    return (< button onClick={handleLogout}>LOGOUT</button>)
}

export default LogoutButton;