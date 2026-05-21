import { API_BASE_URL } from "../api/client";

export function getMediaUrl(path){
     if(!path){
        return null
     }

     if(path.startsWith("http")){
        return path
     }

     return `${API_BASE_URL}${path}`;
}
