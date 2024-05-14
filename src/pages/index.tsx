import {
  unwrap,
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
} from "@/vmarkis/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Todo } from "@prisma/client"
import { useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type FormSchema = z.infer<typeof createTodo.validator>

export default function Home() {
  const [todos, setTodos] = useState<Todo[] | undefined>()
  const [submitting, startTransition] = useTransition()
  const { register, handleSubmit, formState } = useForm<FormSchema>({
    defaultValues: { is_done: false, text: "", title: "" },
    resolver: zodResolver(createTodo.validator),
  })

  const submitHandler: SubmitHandler<FormSchema> = async payload => {
    startTransition(async () => {
      const todo = await unwrap(
        createTodo({
          is_done: payload.is_done,
          text: payload.text,
          title: payload.title,
        })
      )

      setTodos(todos => (todos ? [...todos, todo] : [todo]))
    })
  }

  const errorMessage = Object.values(formState.errors).at(0)?.message

  const handleToggleTodo = async (todoId: string, checked: boolean) => {
    const updatedTodo = await unwrap(toggleTodo({ checked, todoId }))
    setTodos(todos =>
      todos
        ? todos.map(todo => (todo.id === todoId ? updatedTodo : todo))
        : [updatedTodo]
    )
  }

  const handleDeleteTodo = async (todoId: string) => {
    await deleteTodo({ todoId })
    setTodos(todos => (todos ? todos.filter(todo => todo.id !== todoId) : []))
  }

  useEffect(() => {
    const getTodosInit = async () => {
      const todos = await unwrap(getTodos(null))
      setTodos(todos)
    }

    getTodosInit()
  }, [])

  return (
    <>
      <h1>Todo List</h1>
      <div className="flex gap-6">
        <form onSubmit={handleSubmit(submitHandler)}>
          {errorMessage && <strong>{errorMessage}</strong>}
          <label htmlFor="">Title</label>
          <input
            type="text"
            {...register("title")}
            placeholder="Your task name"
          />
          <label htmlFor="">Text</label>
          <input
            type="text"
            {...register("text")}
            placeholder="Describe your task"
          />
          <label htmlFor="">Done</label>
          <input
            type="checkbox"
            {...register("is_done")}
          />
          <button disabled={submitting}>Submit</button>
        </form>
        {todos ? (
          <section>
            {todos.map(todo => (
              <article key={todo.id}>
                <div className="flex">
                  <h2>{todo.title}</h2>
                  <input
                    className="ml-auto"
                    type="checkbox"
                    onChange={e => handleToggleTodo(todo.id, e.target.checked)}
                    checked={todo.is_done}
                  />
                </div>
                <p>{todo.text}</p>
                <button onClick={() => handleDeleteTodo(todo.id)}>
                  Delete
                </button>
              </article>
            ))}
          </section>
        ) : (
          "loading todos..."
        )}
      </div>
    </>
  )
}
