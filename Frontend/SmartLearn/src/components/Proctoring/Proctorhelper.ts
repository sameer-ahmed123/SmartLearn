import { toast } from "react-toastify";

export const typeMap =(type:string)=>{
  const typeMapping: Record<string, string> = {
      TAB_SWITCH: "TAB_SWITCH",
      NO_FACE: "NO_FACE",
      MULTI_FACE: "MULTI_FACE",
      LOOK_DOWN: "LOOK_DOWN",
      LOOK_LEFT: "LOOK_AWAY",
      LOOK_RIGHT: "LOOK_AWAY",
    };
    return typeMapping[type] || "LOOK_AWAY";
}

export const triggerWarningToast = (type: string) => {
  const messages: Record<string, string> = {
    TAB_SWITCH: "Tab switching is prohibited!",
    NO_FACE: "Face not detected! Stay in view.",
    MULTI_FACE: "Multiple people detected!",
    LOOK_RIGHT: "Eyes on the screen, please.",
    LOOK_LEFT: "Eyes on the screen, please.",
    LOOK_DOWN: "Looking down detected."
  };

  if (messages[type]) {
    // console.log("Displaying Toast for:", type); 
    toast.error(messages[type], { 
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      toastId: `${type}-${Date.now()}` // Unique ID ensures it pops up every time
    });
  }
};