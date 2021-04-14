import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement, OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";

interface ITransferDTO {
    from: string;
    to: string;
    amount: number;
    description?: string;
}

@injectable()
export class BalanceTransferUseCase {
    constructor(@inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
        @inject('UsersRepository')
        private usersRepository: IUsersRepository,
        @inject(GetBalanceUseCase) private getBalanceUseCase: GetBalanceUseCase) { }

    async execute(tdto: ITransferDTO): Promise<void> {

        console.log(tdto)
        const fromUser = await this.usersRepository.findById(tdto.from);

        if (!fromUser) {
            throw new InvalidTransferError(`Source account is invalid`);
        }

        const toUser = await this.usersRepository.findById(tdto.to);

        if (!toUser) {
            throw new InvalidTransferError(`Targer account is invalid`);
        }

        const { balance } = await this.getBalanceUseCase.execute({ user_id: fromUser.id });

        if (balance < tdto.amount) {
            throw new InvalidTransferError("Insufficient funds");
        }

        await this.statementsRepository.create({ amount: -tdto.amount, user_id: fromUser.id, description: tdto.description, type: OperationType.TRANSFER });
        
        await this.statementsRepository.create({ amount: tdto.amount, user_id: toUser.id, description: tdto.description, type: OperationType.TRANSFER });
        

    }

}

class InvalidTransferError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}