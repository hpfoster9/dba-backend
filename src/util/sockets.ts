import Server from "socket.io";
const io = Server();

io.on("connection", (socket) => console.log(`a user connected to socket.`));