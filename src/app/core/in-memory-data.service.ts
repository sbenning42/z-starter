// import { Todo } from "../state/todo/todo.model";

type Todo = any;

export class InMemoryDataService {
  createDb() {
    const todos: Array<Todo> = [
      { id: 1, name: "Shopping" },
      { id: 2, name: "Meeting" }
    ];
    const users: {
    } = [
      { id: '1', email: "test", password: 'test' },
      { id: '2', email: "test@test.test", password: 'Test42Test' },
      { id: '3', email: "sben@sben.sben", password: 'Sben42Sben' },
    ];

    return { todos, users };
  }
}
