import { AuthenticatedRequest } from "@/middlewares";
import ticketService from "@/services/tickets-service";
import enrollmentsService from "@/services/enrollments-service";
import { Response } from "express";
import hotelsRepository from "@/repositories/hotels-repository";


export async function getHotels (req:AuthenticatedRequest, res: Response) {

    const {userId} = req

    try{

        const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId)
        const ticket = await ticketService.getTicketByUserId(userId)

        if(!ticket || !enrollment){
            return res.sendStatus(404)
        }

        if( ticket?.status !== "PAID" || ticket?.TicketType.isRemote === true || ticket?.TicketType.includesHotel === false) {
            return res.sendStatus(402)
        }

        const hotels = await hotelsRepository.getHotels()

        if(hotels?.length < 1){
            return res.sendStatus(404)
        }

        res.status(200).send(hotels)

    } catch (err) {
        if(err.name === 'NotFoundError'){
            res.sendStatus(404)
        }
        res.sendStatus(400)
    }
}

export async function getRoomsbyHotelId (req: AuthenticatedRequest, res: Response) {

    const {userId} = req
    const hotelId = Number(req.params.hotelId)

    try {

        const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId)
        const ticket = await ticketService.getTicketByUserId(userId)

        if(!ticket || !enrollment){
            return res.sendStatus(404)
        }

        if( ticket.status !== "PAID" || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
            return res.sendStatus(402)
        }

        const rooms = await hotelsRepository.getHotelRooms(hotelId)

        if(!rooms){
            res.sendStatus(404)
        }

        res.status(200).send(rooms)

    } catch (err) {
        if(err.name === 'NotFoundError'){
            res.sendStatus(404)
        }
        res.sendStatus(400)
    }
}