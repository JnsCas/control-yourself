export class GmailAuthException extends Error {
  constructor(
    message: string,
    public readonly userId: string,
    public readonly originalError?: any,
  ) {
    super(message)
    this.name = 'GmailAuthException'
  }
}
