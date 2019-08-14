import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import config from "./config/config";
import * as identitiesRest from "./models/identities-rest";
import idTypeOf, { TYPE_EMAIL, TYPE_USERNAME } from "./utils/getIdType";

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.SECRET,
    },
    async (jwtPayload, done) => {
      let user;
      const { id } = jwtPayload;
      try {
        // Find user by email or username from jwtPayload
        if (idTypeOf(id) === TYPE_EMAIL) {
          user = await identitiesRest.findByEmail(id);
        } else {
          user = await identitiesRest.findByUsername(id);
        }
        if (!user) {
          // There is no user with provided id
          return done(new Error(), false);
        }
        return done(null, user);
      } catch (err) {
        return done(new Error(), err);
      }
    },
  ),
);
