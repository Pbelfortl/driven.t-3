import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel () {

    return await prisma.hotel.create({
        data: {
            name: faker.name.findName(),
            image: faker.datatype.string()
        }
    })
}

export async function createRoom(hotelId: number) {
    
    return await prisma.room.create({
        data: {
            name: faker.name.findName(),
            capacity: faker.datatype.number(),
            hotelId: hotelId
        }
    })
}