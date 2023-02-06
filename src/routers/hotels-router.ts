import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getRoomsbyHotelId } from "@/controllers";


const hotelsRouter = Router()

hotelsRouter
    .all("/*", authenticateToken)
    .get("/", getHotels)
    .get("/:hotelId", getRoomsbyHotelId)

export {hotelsRouter}