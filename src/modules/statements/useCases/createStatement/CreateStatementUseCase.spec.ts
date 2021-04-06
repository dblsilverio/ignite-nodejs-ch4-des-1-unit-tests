import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import {OperationType} from '../../entities/Statement';
import { CreateStatementError } from "./CreateStatementError";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement UC", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    });

    it("should deposit money into account", async () => {

        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});
        const depositStmt = await createStatementUseCase.execute({user_id: user.id, amount: 1000.0, description: "Test  depoisiting money", type: OperationType.DEPOSIT });

        expect(depositStmt).toHaveProperty("id");
        expect(depositStmt.amount).toBe(1000.0);       
        
    })

    it("should withdraw money from account", async () => {

        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});
        await createStatementUseCase.execute({user_id: user.id, amount: 1000.0, description: "Test  depoisiting money", type: OperationType.DEPOSIT });
        const withdrawlStmt = await createStatementUseCase.execute({user_id: user.id, amount: 50.0, description: "Taking some money", type: OperationType.WITHDRAW });

        expect(withdrawlStmt).toHaveProperty("id");
        expect(withdrawlStmt.amount).toBe(50.0);       
        
    })

    it("should not create statement when user is not found", async () => {
        expect(async () => {
            await createStatementUseCase.execute({user_id: "1", amount: 10.0, description: "Test statement", type: OperationType.DEPOSIT });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    })

    it("should not allow a withdrawl that leaves balance negative", async () => {

        const user = await usersRepository.create({email: "alice@mail.com", name: "Alice", password: "123"});

        expect(async () => {
            await createStatementUseCase.execute({user_id: user.id, amount: 10.0, description: "Test statement", type: OperationType.WITHDRAW });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    })

} )