import { Injectable } from '@angular/core';
import { TodoStore } from 'src/app/state/todo.store';
import { StorageStore } from 'src/app/state/storage.store';

@Injectable({
  providedIn: 'root'
})
export class ActionsService {

  Z = this.create();

  constructor(
    public todo: TodoStore,
    public storage: StorageStore,
  ) { }
  create() {
    const {
      selectOne: { Create: SelectOneTodo },
      deselectOne: { Create: DeselectOneTodo },
      getAll: { Request: GetAllTodo },
      getById: { Request: GetByIdTodo },
      addOne: { Request: AddOneTodo },
      updateOne: { Request: UpdateOneTodo },
      removeAll: { Request: RemoveAllTodo },
      removeOne: { Request: RemoveOneTodo },
    } = this.todo.Z;
    const {
      get: { Request: GetStorage },
      save: { Request: SaveStorage },
      remove: { Request: RemoveStorage },
      clear: { Request: ClearStorage },
    } = this.storage.Z;
    return {
      SelectOneTodo, DeselectOneTodo, GetAllTodo, GetByIdTodo, AddOneTodo, UpdateOneTodo, RemoveOneTodo, RemoveAllTodo,
      GetStorage, SaveStorage, RemoveStorage, ClearStorage,
    };
  }
}
