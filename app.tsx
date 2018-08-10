type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_deleted", id: ID }

import { observable } from "mobx"

class TodoApp {
  @observable events: TodoEvent[] = []

  createTask(id: ID) {
    this.events.push({ type: "task_created", id })
  }

  renameTask(id: ID, name: TaskName) {
    this.events.push({ type: "task_renamed", id, name })
  }

  checkTask(id: ID) {
    this.events.push({ type: "task_checked", id })
  }

  deleteTask(id: ID) {
    this.events.push({ type: "task_deleted", id })
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"

const app = window.app = new TodoApp()

@observer
class TodoView extends Component<{ app: TodoApp }> {
  render() {
    return (
      <div>
        {JSON.stringify(this.props.app.events)}
      </div>
    )
  }
}

render(<TodoView app={app} />, document.body)
