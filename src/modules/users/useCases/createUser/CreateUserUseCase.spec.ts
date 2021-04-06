import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
    beforeEach(()=> {
        usersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepository);
    })

    it("should create valid user", async () => {
        const user = await createUserUseCase.execute({email:"alice@mail.com", password:"123", name: "Alice"});

        expect(user).toHaveProperty("id")
        expect(user.name).toBe("Alice")
        expect(user.email).toBe("alice@mail.com")
    });

    it("should throw exception when e-mail already in use", async () => {
        await createUserUseCase.execute({email:"alice@mail.com", password:"123", name: "Alice"});

        expect(async () => {
            await createUserUseCase.execute({email:"alice@mail.com", password:"123", name: "Alice"});
        }).rejects.toBeInstanceOf(CreateUserError)        
    });
})