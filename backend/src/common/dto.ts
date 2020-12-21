
type Constructor<T> = new (...args: any[]) => T;

export const dtoFactory = <T>(
    source: Object,
    destinationConstructor: Constructor<T>
  ): T => Object.assign(new destinationConstructor(), { ...source });
  