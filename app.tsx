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

import { observable, computed } from "mobx"

class TodoApp {
  @observable events: TodoEvent[] = []

  createTask(id: ID) {
    if (!this.state.tasks.has(id))
      this.events.push({ type: "task_created", id })
  }

  renameTask(id: ID, name: TaskName) {
    if (this.state.tasks.has(id))
      this.events.push({ type: "task_renamed", id, name })
  }

  checkTask(id: ID) {
    if (this.state.tasks.has(id))
      this.events.push({ type: "task_checked", id })
  }

  deleteTask(id: ID) {
    if (this.state.tasks.has(id))
      this.events.push({ type: "task_deleted", id })
  }

  @computed get state() {
    const state: TodoState = {
      tasks: new Map()
    }

    for (const event of this.events) {
      switch (event.type) {
        case "task_created":
          state.tasks.set(event.id, {
            id: event.id,
            name: "",
            checked: false
          })
          break
        case "task_renamed":
          state.tasks.get(event.id)!.name = event.name
          break
        case "task_checked":
          state.tasks.get(event.id)!.checked = true
          break
        case "task_deleted":
          state.tasks.delete(event.id)
          break
      }
    }

    return state
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
