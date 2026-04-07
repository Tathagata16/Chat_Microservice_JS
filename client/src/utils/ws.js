import { io } from "socket.io-client";

export const connectWs = ()=>{
    return io("http://localhost:3002");
}