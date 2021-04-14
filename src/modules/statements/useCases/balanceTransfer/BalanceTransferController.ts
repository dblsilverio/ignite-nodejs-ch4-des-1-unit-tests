import { Request, Response } from "express";
import { container } from "tsyringe";
import { BalanceTransferUseCase } from "./BalanceTransferUseCase";

export class BalanceTransferController {
    async handle(request: Request, response: Response): Promise<Response> {
        const user_id = request.params.user_id as string;
        const { amount, description } = request.body;
        const { id } = request.user;

        const balanceTransferUC = container.resolve(BalanceTransferUseCase);

        await balanceTransferUC.execute({ amount, description, from: id, to: user_id })
        
        return response.status(204).send();
    }
}