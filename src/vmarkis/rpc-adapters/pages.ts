import { Controllers } from "../rpc/rpc" // !! Precisa vir da pasta das RPC
import {
  extractZodErrors,
  getEndpoint,
  makeKey,
  mapPagesRequestToControllerHandler,
  shouldHaveBody,
} from "@/vmarkis/rpc"
import { NextApiRequest, NextApiResponse } from "next"

export function makeRoutesHandler() {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    let body: unknown = undefined
    const endpoint = getEndpoint(req.url!)
    const method = req.method
    if (!method) {
      return res.status(405).end()
    }

    const controller = Controllers.getController(makeKey(method, endpoint))
    if (!controller) {
      console.log({
        controllers: Controllers.items.keys(),
        givenKey: makeKey(method, endpoint),
      })
      return res.status(405).end()
    }
    if (shouldHaveBody(method)) {
      const validation = controller.zodValidator.safeParse(JSON.parse(req.body))
      if (!validation.success) {
        return res.status(400).json(extractZodErrors(validation.error))
      }
      body = validation.data
    }
    const responseRPC = await controller.handle(
      mapPagesRequestToControllerHandler(req),
      body
    )

    return res.status(responseRPC.status).json(responseRPC.body)
  }
}
