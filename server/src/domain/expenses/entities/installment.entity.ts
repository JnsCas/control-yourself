export class Installment {
  constructor(
    readonly installmentNumber: number,
    readonly amount: number,
    readonly dueDate: Date, //we only care about the month and year
  ) {}

  static create(installmentNumber: number = 1, amount: number, dueDate: Date): Installment {
    return new Installment(installmentNumber, amount, dueDate)
  }

  static restore(document: any): Installment {
    return new Installment(document.installmentNumber, document.amount, document.dueDate)
  }
}
