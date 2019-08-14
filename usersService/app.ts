import debug from "debug";
import restify, { Next, Request, Response } from "restify";
import util from "util";
import config from "./config/config";
import * as usersModel from "./models/users-mongoose";

const error = debug("users:error");
const log = debug("users:server");

const server = restify.createServer({
  name: "Users-Service",
  version: "0.1",
});

server.use(restify.plugins.authorizationParser());
server.use(check); // TODO: Enable on production
server.use(restify.plugins.queryParser());
server.use(
  restify.plugins.bodyParser({
    mapParams: true,
  }),
);

server.get("/users", async (req: Request, res: Response, next: Next) => {
  const { limit, skip } = req.query;
  try {
    const docs = await usersModel.listUsers({
      limit: limit ? Number(limit) : 12,
      skip: skip ? Number(skip) : 0,
    });
    res.send(docs);
    next(false);
  } catch (err) {
    error(`User could not be found: ${err.stack}`);
  }
});

server.post("/users", async (req: Request, res: Response, next: Next) => {
  try {
    const doc = await usersModel.createUser(req.body);
    res.send(usersModel.sanitizeUser(doc));
    next(false);
  } catch (err) {
    error(`User could not be created: ${err.stack}`);
  }
});

server.get("/users/:username", async (req: Request, res: Response, next: Next) => {
  const { username } = req.params;
  try {
    const doc = await usersModel.findUserByUsername(username);

    // Check if document is found
    if (doc === null) {
      // Not found
      // Exit with failure
      next(false);
      return res.send({
        message: "User not found.",
        success: false,
      });
    }
    res.send(usersModel.sanitizeUser(doc));
    next(false);
  } catch (err) {
    error(`User could not be found: ${err.stack}`);
  }
});

server.listen(config.PORT, "0.0.0.0", () => {
  log(server.name + " listening at " + server.url);
});

// Mimic API Key authentication.
const apiKeys = [
  {
    key: "a6701e54-39fd-4bdf-8bb6-fbf0e82b7603",
    user: "disabilitymap-mainservice",
  },
];

function check(req: any, res: Response, next: Next) {
  if (req.authorization && req.authorization.basic) {
    let found = false;
    apiKeys.forEach((auth) => {
      if (
        auth.key === req.authorization.basic.password &&
        auth.user === req.authorization.basic.username
      ) {
        found = true;
      }
    });
    if (found) { next(); } else {
      res.send(401, "Not authenticated");
      error("Failed authentication check " + util.inspect(req.authorization));
      next(false);
    }
  } else {
    res.send(500, "No Authorization Key");
    error("NO AUTHORIZATION");
    next(false);
  }
}
