type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_deleted", id: ID }

class TodoApp {
  constructor(readonly emit: (event: TodoEvent) => void) { }

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

import { h, render, Component } from "preact"

class TodoView extends Component {
  app = window.app = new TodoApp(this.emit.bind(this))

  state = { events: [] }

  emit(event: TodoEvent) {
    this.setState({
      events: [...this.state.events, event]
    })
  }

  render() {
    const { events } = this.state
    return (
      <div>
        {JSON.stringify(events)}
      </div>
    )
  }
}

render(<TodoView />, document.body)
