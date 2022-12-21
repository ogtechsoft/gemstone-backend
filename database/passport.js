const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const _ = require("lodash");

const keys = require("./keys");
const admin = require("../routes/admin");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      let loggedUser = await admin.getAdmin("", payload.id);
      if (loggedUser) {
        let custom = _.omit(loggedUser, ["password"]);
        return done(null, custom);
      }
      return done(null, false);
    })
  );
};
