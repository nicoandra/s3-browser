export class CommonDto {
    static fromObject<T>(parameters: {}) : T {
        return <T>{...parameters}
    }
}