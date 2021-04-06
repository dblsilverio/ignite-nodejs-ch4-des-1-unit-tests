import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../../../app';


let connection: Connection;

describe("Create user Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it("should create a new user", async () => {
        const result = await request(app).post("/api/v1/users").send({ name: "Alice", email: "alice@mail.com", password: "123" });

        expect(result.status).toBe(201)
    })

    it("should issue a 400 with duplicated email", async () => {
        const result = await request(app).post("/api/v1/users").send({ name: "Alice", email: "alice@mail.com", password: "123" });

        expect(result.status).toBe(400)
    })
})