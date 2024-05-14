import { NextApiRequest } from "next"
import { HandlerRequest } from "./types"
import { NextRequest } from "next/server"
import { z } from "zod"
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies"

export function mapAppRequestToControllerHandler(
  req: NextRequest
): HandlerRequest {
  return {
    cookies: req.cookies,
    headers: req.headers,
  }
}

export function mapPagesRequestToControllerHandler(
  req: NextApiRequest
): HandlerRequest {
  const reqHeaders: Record<string, any> = req.headers
  const headers = new Headers(reqHeaders)
  const cookies = new RequestCookies(headers)
  return {
    cookies,
    headers,
  }
}

export function makeKey(method: string, endpoint: string) {
  return `${method}-${endpoint}`
}

export function getPathname(url: string) {
  const { pathname } = new URL(url)
  return pathname
}

export function getEndpoint(pathname: string) {
  const [, endpoint] = pathname.split("/api")
  return endpoint
}

export function extractZodErrors(errors: z.ZodError) {
  return errors.issues.map(i => ({
    message: i.message,
    paths: i.path.map(p => String(p)),
  }))
}

export function stringify(object: Record<string, any>) {
  return JSON.stringify(object)
}

export function shouldHaveBody(method: string) {
  return !z.enum(["GET", "HEAD"]).safeParse(method.toUpperCase()).success
}
