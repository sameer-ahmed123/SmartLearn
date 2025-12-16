import { LogOut, } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../UI/button";
import apiClient from "@/api/apiClient";
import { useNavigate } from "react-router-dom";

type LogoutButtonProps = React.ComponentProps<typeof Button>;

const LogoutButton:React.FC<LogoutButtonProps> = ({className, ...props}) => {
    const navigate = useNavigate()
    const logout = useAuthStore((state)=>state.logout)
    const getRefreshToken = () => useAuthStore.getState().refreshToken;

    const handleLogout = async ()=>{
        const refreshToken = getRefreshToken()

        if (refreshToken){
            try{
                await apiClient.post("/auth/logout/", {refresh:refreshToken})
            }
            catch(e){
                console.log("Server-Side token Blacklist Failed, Proceeding with local logout", e)
            }
        }
        logout()
        navigate("/login")
    }
    

    return(
        <Button variant={"outline"} onClick={handleLogout} className={className} {...props}>
            <LogOut className="size-4"/>
            logout
        </Button>
    )

};

export default LogoutButton
