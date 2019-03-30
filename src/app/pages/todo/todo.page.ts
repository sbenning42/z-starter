import { Component, OnInit } from "@angular/core";
import { Observable, of } from 'rxjs';
import { Todo, TodoStore } from 'src/app/state/todo.store';

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
    public todo: TodoStore
  ) {}

  ngOnInit() {
    this.todo.dispatch(new this.todo.GetAllRequest());
    this.todo.dispatch(new this.todo.AddOneRequest({ name: 'Added !' }));
  }
}
