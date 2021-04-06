import request from 'supertest';
import {v4} from 'uuid';

import { Connection, createConnection } from "typeorm";
import { app } from '../../../../app';
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";

let connection: Connection
let aliceToken: string;
let depositStatementId: string;

describe("Statement Operations", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const createUserUseCase = new CreateUserUseCase(new UsersRepository());
        await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "123"})
        
        aliceToken = await getToken("alice@mail.com", "123");

        const depositResp = await request(app).post("/api/v1/statements/deposit").set({Authorization: `Bearer ${aliceToken}`}).send({description: "Depositing lots of bidens", amount: 900.0});
        depositStatementId = depositResp.body.id;
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should list created statement successfully", async () => {
        const resp = await request(app).get(`/api/v1/statements/${depositStatementId}`).set({Authorization: `Bearer ${aliceToken}`})

        expect(resp.status).toBe(200);
        expect(resp.body).toHaveProperty("id", depositStatementId);
        expect(parseFloat(resp.body.amount)).toBe(900.0)
    })

    it("should issue a 404 if a statement is not found", async () => {
        const resp = await request(app).get(`/api/v1/statements/${v4()}`).set({Authorization: `Bearer ${aliceToken}`})
        expect(resp.status).toBe(404);
    })
})

async function getToken(email: string, password: string): Promise<string> {
    const res = await request(app).post("/api/v1/sessions").send({email, password});
    return res.body.token as string;
}