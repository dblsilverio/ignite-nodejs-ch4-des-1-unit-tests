import { getPriority } from 'node:os';
import request from 'supertest';
import { Connection, createConnection, getRepository } from 'typeorm';
import { app } from '../../../../app';
import { UsersRepository } from '../../repositories/UsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';


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

    it("should show existing user profile", async () =>{
        const createUserUseCase = new CreateUserUseCase(new UsersRepository());
        const user = await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "pwd"});

        const resultAuth = await request(app).post("/api/v1/sessions").send({email: user.email, password: "pwd"});
        
        const {token} = resultAuth.body;

        const resultProfile = await request(app).get("/api/v1/profile").set({Authorization: `Bearer ${token}`});

        expect(resultProfile.status).toBe(200)
        expect(resultProfile.body).toHaveProperty("id")
        expect(resultProfile.body.id).toBe(user.id)
    })

});