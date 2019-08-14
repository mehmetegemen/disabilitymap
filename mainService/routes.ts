import { Application } from "express";
import IdentityController from "./controllers/IdentityController";
import UsersController from "./controllers/UsersController";

import IdentityControllerPolicy from "./policies/IdentityControllerPolicy";
import isAuthenticated from "./policies/isAuthenticated";

export default (app: Application) => {
  // User Controllers
  // TODO: Add passport login controller policy
  // TODO: Add rate limit
  app.get(
    "/api/additional-infos/:username/geolocation",
    isAuthenticated,
    UsersController.getGeolocation,
  );

  app.get(
    "/api/additional-infos",
    isAuthenticated,
    UsersController.getAllUsersAdditionalInfo,
  );

  // Identity Controllers
  app.post(
    "/api/identities/authorization",
    IdentityControllerPolicy.authenticate,
    IdentityController.login,
  );
  app.post(
    "/api/identities",
    IdentityControllerPolicy.register,
    IdentityController.register,
  );
};
