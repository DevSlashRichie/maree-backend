const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format");
    }
    return new Email(trimmed);
  }

  static createUnsafe(email: string): Email {
    return new Email(email.trim().toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
