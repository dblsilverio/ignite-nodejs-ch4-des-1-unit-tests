import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe("User authentication", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations()
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should authenticate user correctly", async() => {
        await request(app).post("/api/v1/users").send({name:"Alice", email: "alice@mail.com", password: '123'});
        const response = await request(app).post("/api/v1/sessions").send({
            email: 'alice@mail.com',
            password: '123'
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("user")
        expect(response.body).toHaveProperty("token")
    })

    it("should respond with 401 when user does not exists or provided invalid password", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: 'alice@mail.com',
            password: '1234'
        })

        expect(response.status).toBe(401)
    })
})