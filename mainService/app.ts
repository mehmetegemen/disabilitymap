import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import debug from "debug";
import cors from "cors";
import config from "./config/config";
import http from "http";
import routes from "./routes";

const app = express();
const server = http.createServer(app);

const log = debug("main-service:app");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

require("./passport");
routes(app);

server.listen(config.PORT);

export default app;
