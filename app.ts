type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_deleted", id: ID }

class TodoApp {
  events: TodoEvent[] = []

  emit(event: TodoEvent) {
    this.events.push(event)
  }

  createTask(id: ID) {
    this.emit({ type: "task_created", id })
  }

  renameTask(id: ID, name: TaskName) {
    this.emit({ type: "task_renamed", id, name })
  }

  checkTask(id: ID) {
    this.emit({ type: "task_checked", id })
  }

  deleteTask(id: ID) {
    this.emit({ type: "task_deleted", id })
  }
}
