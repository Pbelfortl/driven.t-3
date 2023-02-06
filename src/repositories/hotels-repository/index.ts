import { prisma } from "@/config";


async function getHotels () {

    const hotels = await prisma.hotel.findMany({})
    return hotels
}


async function getHotelRooms (hotelId: number) {

    const rooms = await prisma.hotel.findMany({
        where: {
            id: hotelId
        },
        include: {
            Rooms: true
        }
    })
    return rooms
}

const hotelsRepository = {
    getHotels,
    getHotelRooms
}

export default hotelsRepository