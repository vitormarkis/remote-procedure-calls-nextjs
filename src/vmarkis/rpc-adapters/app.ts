import { Controllers } from "../rpc/rpc" // !! Precisa vir da pasta das RPC
import {
  extractZodErrors,
  getEndpoint,
  getPathname,
  makeKey,
  mapAppRequestToControllerHandler,
} from "../rpc"
import { NextRequest, NextResponse } from "next/server"

export function createMutationEndpoint() {
  return async function (req: NextRequest) {
    const endpoint = getEndpoint(getPathname(req.url!))
    const controller = Controllers.getController(makeKey(req.method, endpoint))
    if (!controller) {
      console.log("Controllers: ", Controllers.items.keys())
      return new Response(null, { status: 405 })
    }
    const body = await req.json()
    const validation = controller.zodValidator.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(extractZodErrors(validation.error), {
        status: 400,
      })
    }
    const responseRPC = await controller.handle(
      mapAppRequestToControllerHandler(req),
      validation.data
    )

    return new NextResponse(responseRPC.body, { status: responseRPC.status })
  }
}

export function createQueryEndpoint() {
  return async function (req: NextRequest) {
    const endpoint = getEndpoint(getPathname(req.url!))
    const controller = Controllers.getController(makeKey(req.method, endpoint))
    if (!controller) {
      console.log("Controllers: ", Controllers.items.keys())
      return new Response(null, { status: 405 })
    }
    const responseRPC = await controller.handle(
      mapAppRequestToControllerHandler(req),
      undefined
    )
    return new NextResponse(responseRPC.body, { status: responseRPC.status })
  }
}
