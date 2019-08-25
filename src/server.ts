import errorHandler from "errorhandler";

import app from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server2 = require("http").Server(app);
const io = require("socket.io")(server2);
const server = server2.listen(app.get("port"), () => {
  console.log(
    "beep boop App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});



export default server;
