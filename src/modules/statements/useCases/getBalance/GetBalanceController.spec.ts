import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import { app } from '../../../../app';
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";

let connection: Connection;
let aliceToken: string;
let bobToken: string;

describe("Balance Tests", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations()

        const createUserUseCase = new CreateUserUseCase(new UsersRepository());
        await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "123"})
        await createUserUseCase.execute({name: "Bob", email: "bob@mail.com", password: "123"})

        aliceToken = await getToken("alice@mail.com", "123");
        bobToken = await getToken("bob@mail.com", "123");

        await request(app).post("/api/v1/statements/deposit").set({Authorization: `Bearer ${aliceToken}`}).send({description: "Depositing lots of bidens", amount: 900.0});
        await request(app).post("/api/v1/statements/withdraw").set({Authorization: `Bearer ${aliceToken}`}).send({description: "daily groceries", amount: 75.0});
        await request(app).post("/api/v1/statements/withdraw").set({Authorization: `Bearer ${aliceToken}`}).send({description: "kinder egg", amount: 300.0});
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should get balance from an existing user", async() => {
        const balanceResp = await request(app).get("/api/v1/statements/balance").set({Authorization: `Bearer ${aliceToken}`});

        expect(balanceResp.status).toBe(200)
        expect(balanceResp.body).toHaveProperty("statement")
        expect(balanceResp.body).toHaveProperty("balance")
        expect(balanceResp.body.statement).toHaveLength(3)
        expect(balanceResp.body.balance).toBe(525.0)
    })

    it("should get no balance reports from an existing user with no statements", async() => {
        const balanceResp = await request(app).get("/api/v1/statements/balance").set({Authorization: `Bearer ${bobToken}`});

        expect(balanceResp.status).toBe(200)
        expect(balanceResp.body).toHaveProperty("statement")
        expect(balanceResp.body).toHaveProperty("balance")
        expect(balanceResp.body.statement).toHaveLength(0)
        expect(balanceResp.body.balance).toBe(0)
    })
})

async function getToken(email: string, password: string): Promise<string> {
    const res = await request(app).post("/api/v1/sessions").send({email, password});
    return res.body.token as string;
}