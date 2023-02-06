import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers"
import httpStatus from "http-status"
import faker from "@faker-js/faker";
import { createUser, createEnrollmentWithAddress, generateCreditCardData,
         createTicket, createTicketType, createRemoteTicketType, createTicketTypeWithoutHotel,
         createTicketTypeWithHotel, createHotel } from "../factories";
import { TicketStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

beforeAll(async () => {
    await init()
    await cleanDb()
})

const server = supertest(app)


describe("GET hotels", () => {

    it("Should respond with 401 if there is no token", async () => {
        const response = await server.get("/hotels")

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("Should respond with 401 when token is not valid", async () => {

        const token = faker.lorem.word();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("When token is valid", () => {

        it("Should respond with 404 when enrollment do not exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when user ticket do not exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("Should respond with 402 if ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })

        it("Should respond with 402 if event is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createRemoteTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })

        it("Should respond with 402 if ticket do not includes hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithoutHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })

        it("Should respond with 200 and hotels list", async () => {

            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createHotel()
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(200)
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        rooms: expect.any(Array)
                    })
                ])
            )
        })
    })

})