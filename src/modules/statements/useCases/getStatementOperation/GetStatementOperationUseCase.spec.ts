import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementeUseCase: CreateStatementUseCase;

describe("Create Statement UC", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
        createStatementeUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    });

    it("should return existing statement", async () => {
        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});
        const stmt = await statementsRepository.create({user_id: user.id, amount: 1000.0, description: "Test depoisiting money", type: OperationType.DEPOSIT });

        const result = await getStatementOperationUseCase.execute({user_id: user.id, statement_id: stmt.id})

        expect(result).toHaveProperty("id");
        expect(result.amount).toBe(1000.0);
        expect(result.type).toBe(OperationType.DEPOSIT);
    })

    it("should throw error when user is not found or does not exists", async () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({user_id: "123", statement_id: "321"})
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    });

    it("should throw error when statement is not found or does not exists", async () => {
        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});

        expect(async () => {
            await getStatementOperationUseCase.execute({user_id: user.id, statement_id: "321"})
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    });

});