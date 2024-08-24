
import { RequestHandler, Router } from "express";
import { default as passport } from "passport";

export const auth_router = Router();
auth_router.get("/steam", passport.authenticate("steam", { failureRedirect: "/" }) as RequestHandler, (req, res) => {
    res.redirect("/");
});
auth_router.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }) as RequestHandler, (req, res) => {
    res.redirect("/");
});
