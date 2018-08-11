type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_deleted", id: ID }

interface TodoState {
  tasks: Map<ID, Task>
}

interface Task {
  id: ID,
  name: TaskName,
  checked: boolean
}

import { observable } from "mobx"

class TodoApp {
  createTask(id: ID) {
    if (!this.state.tasks.has(id))
      this.apply({ type: "task_created", id })
  }

  renameTask(id: ID, name: TaskName) {
    if (this.state.tasks.has(id))
      this.apply({ type: "task_renamed", id, name })
  }

  checkTask(id: ID) {
    if (this.state.tasks.has(id))
      this.apply({ type: "task_checked", id })
  }

  deleteTask(id: ID) {
    if (this.state.tasks.has(id))
      this.apply({ type: "task_deleted", id })
  }

  @observable
  state: TodoState = {
    tasks: new Map()
  }

  private apply(event: TodoEvent) {
    switch (event.type) {
      case "task_created":
        this.state.tasks.set(event.id, {
          id: event.id,
          name: "",
          checked: false
        })
        break
      case "task_renamed":
        this.state.tasks.get(event.id)!.name = event.name
        break
      case "task_checked":
        this.state.tasks.get(event.id)!.checked = true
        break
      case "task_deleted":
        this.state.tasks.delete(event.id)
        break
    }
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"

const app = window.app = new TodoApp()

@observer
class TodoAppView extends Component<{ app: TodoApp }> {
  render() {
    const { app } = this.props
    return (
      <div style={{
        "display": "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "place-items": "center",
        "min-height": "100vh",
        "font-size": "2em",
        "color": "#666",
        "background-color": "#eee"
      }}>
      {
        [...app.state.tasks.values()].map(task =>
          <TaskView app={app} task={task} />
        )
      }
      </div>
    )
  }
}

@observer
class TaskView extends Component<{ app: TodoApp, task: Task }> {
  render() {
    const { app, task } = this.props
    return (
      <div style={{ "padding": ".2em .5em" }}>
        <span>
          {task.checked ? "☒" : "☐"}
        </span>
        {" "}
        <span>
          {task.name}
        </span>
      </div>
    )
  }
}

render(<TodoAppView app={app} />, document.body)
