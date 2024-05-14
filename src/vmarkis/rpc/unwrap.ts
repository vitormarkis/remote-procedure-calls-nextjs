import { ResponseLike } from "./types"

// don't over abstract :)
export async function unwrap<T>(responseLike: Promise<ResponseLike<T>>) {
  return (await responseLike).json()
}
