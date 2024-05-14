import { ResponseRPC } from "./dto"
import { z } from "zod"
import {
  Controller,
  Endpoint,
  HandlerRequest,
  RequestFetchConfig,
  ResponseLike,
} from "./types"
import { shouldHaveBody } from "./helpers"

export class Controllers {
  static items = new Map<Endpoint, Controller>()

  static get<TResult, TInput>(
    endpoint: string,
    zodValidator: z.ZodSchema<TInput>,
    handle: (
      req: HandlerRequest,
      input: TInput,
    ) => Promise<ResponseRPC<TResult>>,
  ) {
    return this.append(endpoint, zodValidator, handle, "GET")
  }

  static post<TResult, TInput>(
    endpoint: string,
    zodValidator: z.ZodSchema<TInput>,
    handle: (
      req: HandlerRequest,
      input: TInput,
    ) => Promise<ResponseRPC<TResult>>,
  ) {
    return this.append(endpoint, zodValidator, handle, "POST")
  }

  static put<TResult, TInput>(
    endpoint: string,
    zodValidator: z.ZodSchema<TInput>,
    handle: (
      req: HandlerRequest,
      input: TInput,
    ) => Promise<ResponseRPC<TResult>>,
  ) {
    return this.append(endpoint, zodValidator, handle, "PUT")
  }

  static delete<TResult, TInput>(
    endpoint: string,
    zodValidator: z.ZodSchema<TInput>,
    handle: (
      req: HandlerRequest,
      input: TInput,
    ) => Promise<ResponseRPC<TResult>>,
  ) {
    return this.append(endpoint, zodValidator, handle, "DELETE")
  }

  private static append<TResult, TInput = any>(
    endpoint: string,
    zodValidator: z.ZodSchema<TInput>,
    handle: (
      req: HandlerRequest,
      input: TInput,
    ) => Promise<ResponseRPC<TResult>>,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  ) {
    this.items.set(`${method}-${endpoint}`, { endpoint, handle, zodValidator })

    const rpc = (input: TInput, config?: RequestFetchConfig) =>
      new Promise<ResponseLike<TResult>>(async (resolve, reject) => {
        const res = await fetch(`http://localhost:3000/api${endpoint}`, {
          method,
          body: shouldHaveBody(method) ? JSON.stringify(input) : undefined,
          ...config,
        })

        if (!res.ok) return reject(res)
        resolve({
          ...res,
          json: () => res.json() as Promise<TResult>,
        })
      })
    rpc.validator = zodValidator
    return rpc
  }

  static getController(endpoint: string) {
    return this.items.get(endpoint)
  }
}
