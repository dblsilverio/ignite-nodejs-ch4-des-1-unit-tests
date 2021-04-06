import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

let createUserUseCase: CreateUserUseCase;

describe("User Authentication", () => {
    beforeEach(()=> {
        usersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
        createUserUseCase = new CreateUserUseCase(usersRepository);
    })

    it("should throw error with user inexistent or not found", async () => {
        expect(async () => {
            await authenticateUserUseCase.execute({email:"alice@mail.com", password:"123"});
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    })

    it("should throw error with user invalid password", async () => {
        await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "abc"});
        expect(async () => {
            await authenticateUserUseCase.execute({email:"alice@mail.com", password:"123"});
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    })

    it("should authenticate correctly a valid user", async () => {
        await createUserUseCase.execute({name: "Alice", email: "alice@mail.com", password: "abc"});
        const resp = await authenticateUserUseCase.execute({email:"alice@mail.com", password:"abc"});

        expect(resp).toHaveProperty("token");
        expect(resp.user.email).toBe("alice@mail.com")

    })
})