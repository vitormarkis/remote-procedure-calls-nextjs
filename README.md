Alguma dúvida ou problema? Entre em contato comigo ou abra uma PR.

1. Mover pasta `vmarkis` para pasta `src/` do seu projeto.
2. Criar catch all route handler:

#### App router:
```javascript
// src/app/api/[[...routes]]/route.ts
import { createMutationEndpoint, createQueryEndpoint } from "@/vmarkis/rpc-adapters/app"
  
const mutation = createMutationEndpoint()
const query = createQueryEndpoint()
  
export {
  POST: mutation,
  PUT: mutation,
  DELETE: mutation,
  PATCH: mutation,
  GET: query
}
```

#### Pages router:
```javascript
// src/pages/[[...routes]]/index.ts
import { makeRoutesHandler } from "@/vmarkis/rpc-adapters/pages"

const handler = makeRoutesHandler()
export default handler
```

3. Criar procedure (todas nesse mesmo arquivo):
```javascript
// src/vmarkis/rpc/rpc.ts
export const createTodo = Controllers.post(
  "/todo",
  z.object({
    title: z.string().min(1, "Preencha o titulo."),
    text: z.string().min(1, "Preencha o texto."),
    is_done: z.coerce.boolean(),
  }),
  async (req, input) => {
    const todo = await prisma.todo.create({
      data: {
        is_done: input.is_done,
        text: input.text,
        title: input.title,
      },
    })

    return ResponseRPC.json(todo)
  }
)
```

4. Usar no client:
```typescript
import { createTodo } from "@/vmarkis/rpc"

const submitHandler: SubmitHandler<FormSchema> = async payload => {
  const todo = await unwrap(
    createTodo({
      is_done: payload.is_done,
      text: payload.text,
      title: payload.title,
    })
  )
  
  setTodos(todos => (todos ? [...todos, todo] : [todo]))
}
```




# Adendos
O registro de todos os controllers precisa ser feito antes de uma requisição bater em um endpoint, caso contrário não terá handler para tratar a requisição.

Existe algumas formas de fazer isso, a que eu usei foi fazer com que o arquivo das rotas `(e.g [[...routes]]/index.ts)` tenha uma dependência no arquivo da declaração dos controllers, assim quando ele buildar o handler global das rotas, ele já registra todos os controllers no singleton.

Talvez desse pra fazer isso com um script manual que roda antes de export o handler as default, mas não tive tempo de testar isso.

Você poderia até deixar os RPC ao lado de um componente. Em uma pasta `IncreaseCounter` pode ter 2 arquivos, `component.tsx` e `action.ts`, onde action registra uma RPC usada por `component.tsx`. Desde que a declaração/registro da RPC de `action.ts` rode no momento de build do route handler, tudo deve funcionar.
