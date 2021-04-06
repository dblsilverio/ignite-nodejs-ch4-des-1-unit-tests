import { Connection, createConnection } from "typeorm";
import request from 'supertest';

import { app } from "../../../../app";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";

let connection: Connection;

describe("Create statement", () => {
    beforeAll( async () => {
        connection = await createConnection();
        await connection.runMigrations()

        const createUserUseCase = new CreateUserUseCase(new UsersRepository());
        await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "123"});

    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should create valid statements(debit and withdraw) for a user", async () => {
        const authResponse = await request(app).post("/api/v1/sessions").send({email: "alice@mail.com", password: "123"});
        const {token} = authResponse.body;

        const depResponse = await request(app).post("/api/v1/statements/deposit").set({Authorization: `Bearer ${token}`}).send({description: "Depositing 10 bidens", amount: 10.0})
        expect(depResponse.status).toBe(201)
        expect(depResponse.body).toHaveProperty("id")

        const witResponse = await request(app).post("/api/v1/statements/withdraw").set({Authorization: `Bearer ${token}`}).send({description: "Withdrawing 10 bidens", amount: 10.0})
        expect(witResponse.status).toBe(201)
        expect(witResponse.body).toHaveProperty("id")

    })

    it("should not allow a withdraw let the account balance negative", async () => {
        const authResponse = await request(app).post("/api/v1/sessions").send({email: "alice@mail.com", password: "123"});
        const {token} = authResponse.body;

        const witResponse = await request(app).post("/api/v1/statements/withdraw").set({Authorization: `Bearer ${token}`}).send({description: "Withdrawing 10 bidens", amount: 10.0})
        expect(witResponse.status).toBe(400)

    })
})