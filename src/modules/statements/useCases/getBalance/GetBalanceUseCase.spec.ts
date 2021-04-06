import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement UC", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    });

    it("should return correct balance for existing user", async () => {
        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});
        await statementsRepository.create({user_id: user.id, amount: 1000.0, description: "Test depoisiting money", type: OperationType.DEPOSIT });
        await statementsRepository.create({user_id: user.id, amount: 300.0, description: "Test widthdrawing money", type: OperationType.WITHDRAW });
        await statementsRepository.create({user_id: user.id, amount: 100.0, description: "Test widthdrawing money", type: OperationType.WITHDRAW });

        const balance = await getBalanceUseCase.execute({user_id: user.id});
        
        expect(balance.balance).toBe(600.0)
        expect(balance.statement).toHaveLength(3)

    })

    it("should throw error when user is not found or does not exists", async () => {
        expect(async () => {
            await getBalanceUseCase.execute({user_id: "123"})
        }).rejects.toBeInstanceOf(GetBalanceError)
    });

});