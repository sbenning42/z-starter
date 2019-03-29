// import { Todo } from "../state/todo/todo.model";

type Todo = any;

export class InMemoryDataService {
  createDb() {
    const todos: Array<Todo> = [
      { id: 1, name: "Shopping" },
      { id: 2, name: "Meeting" }
    ];

    return { todos };
  }
}
