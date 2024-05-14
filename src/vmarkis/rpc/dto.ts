export class ResponseRPC<const TResult = any> {
  status: number
  body: TResult

  constructor(body: TResult, props: ResponseRPCProps) {
    this.status = props.status
    this.body = body
  }

  static json<const TResult = any>(body: TResult) {
    return new ResponseRPC(body, {
      status: 200,
    })
  }
}

type ResponseRPCProps = {
  status: number
}
