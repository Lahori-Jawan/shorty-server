export default interface ITokenCreate {
  (
    payload: string | Object,
    tokenDuration?: string,
    refreshTokenDuration?: string
  ): { token: string; refreshToken: string };
}
