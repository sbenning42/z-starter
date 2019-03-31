import { Component, OnInit } from "@angular/core";
import { Observable, of } from 'rxjs';
import { Todo, TodoStore } from 'src/app/state/todo.store';
import { StorageStore } from 'src/app/state/storage.store';

@Component({
  selector: "app-todo",
  templateUrl: "./todo.page.html",
  styleUrls: ["./todo.page.scss"]
})
export class TodoPage implements OnInit {

  todos$: Observable<Array<Todo>> = this.todo.all$;
  loading$: Observable<boolean> = of(false);
  error$: Observable<string> = of(null);

  constructor(
    public todo: TodoStore,
    public storage: StorageStore,
  ) {}

  ngOnInit() {
    const testTodo = () => {
      const { GetAllRequest, AddOneRequest } = this.todo;
      this.todo.dispatch(new GetAllRequest());
      this.todo.dispatch(new AddOneRequest({ name: 'Added !' }));
    };
    const testStorage = () => {
      const { get, save } = this.storage.Z;
      this.storage.dispatch(new get.Request());
    };
    testStorage()
  }
}
