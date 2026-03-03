const e164Regex = /^\+[1-9]\d{1,14}$/;

export class Phone {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(phone: string): Phone {
    const trimmed = phone.trim();
    if (!e164Regex.test(trimmed)) {
      throw new Error(
        "Invalid phone format. Use E.164 format (e.g., +34612345678)",
      );
    }
    return new Phone(trimmed);
  }

  static createUnsafe(phone: string): Phone {
    return new Phone(phone.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
