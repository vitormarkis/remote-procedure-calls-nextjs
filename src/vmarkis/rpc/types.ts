import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies"
import { z } from "zod"
import { ResponseRPC } from "./dto"

export type Endpoint = string
export type Controller = {
  endpoint: string
  zodValidator: z.ZodSchema<any>
  handle(req: HandlerRequest, input: unknown): Promise<ResponseRPC>
}

export type HandlerRequest = {
  cookies: RequestCookies
  headers: Headers
}

export type ResponseLike<TResult> = Omit<Response, "json"> & {
  json(): Promise<TResult>
}

export type RequestFetchConfig = Omit<RequestInit, "body" | "method">
