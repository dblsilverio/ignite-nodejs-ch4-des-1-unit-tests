import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
    beforeEach(()=> {
        usersRepository = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
        createUserUseCase = new CreateUserUseCase(usersRepository);
    })

    it("should create valid user", async () => {
        const user = await createUserUseCase.execute({email:"alice@mail.com", password:"123", name: "Alice"});
        const userProfile = await showUserProfileUseCase.execute(user.id);

        expect(userProfile).toHaveProperty("id")
        expect(userProfile.name).toBe("Alice")
        expect(userProfile.email).toBe("alice@mail.com")
    });

    it("should throw exception when user not found", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute("1233");
        }).rejects.toBeInstanceOf(ShowUserProfileError)        
    });
})