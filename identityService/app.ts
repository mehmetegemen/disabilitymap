import debug from "debug";
import restify, { Next, Request, Response } from "restify";
import util from "util";
import config from "./config/config";
import * as identityModel from "./models/identity-mongoose";
import idTypeOf, { TYPE_EMAIL, TYPE_USERNAME } from "./utils/getIdType";

const error = debug("identity:error");
const log = debug("identity:server");

const server = restify.createServer({
  name: "Identity-Service",
  version: "0.1",
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(
  restify.plugins.bodyParser({
    mapParams: true,
  }),
);

server.post("/identities", async (req: Request, res: Response, next: Next) => {
  try {
    const doc = await identityModel.createUser(req.body);
    res.send(identityModel.sanitize(doc));
    next(false);
  } catch (err) {
    error(`User could not be created: ${err.stack}`);
  }
});

server.get("/identities/:id", async (req: Request, res: Response, next: Next) => {
  const { id } = req.params;
  try {
    let doc;
    if (idTypeOf(id) === TYPE_EMAIL) {
      doc = await identityModel.findUserByEmail(id);
    } else {
      doc = await identityModel.findUserByUsername(id);
    }
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
    res.send(identityModel.sanitize(doc));
    next(false);
  } catch (err) {
    error(`User could not be found: ${err.stack}`);
  }
});

server.post("/identities/:id/authorization", async (req: Request, res: Response, next: Next) => {
  const { id } = req.params;
  try {
    const passwordCheck = await identityModel.passwordCheck(
      {
        ...req.body,
        id,
      },
    );
    res.send(passwordCheck);
    next(false);
  } catch (err) {
    error(`password-check error: ${err.stack}`);
  }
});

server.listen(config.PORT, "0.0.0.0", () => {
  log(server.name + " listening at " + server.url);
});

// Mimic API Key authentication.
const apiKeys = [
  {
    key: "f96e1fc4-06d6-4f0a-acb6-c703dc614cdd",
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
