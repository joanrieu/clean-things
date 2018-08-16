import { observable, computed } from "mobx";
import app from "./app";

declare global {
  const UIkit: any
  const flatpickr: any
}

class TodoUi {
  @observable
  contextId: ID | null = null

  @computed
  get context(): Context | null {
    return this.contextId ? app.state.contexts.get(this.contextId)! : null
  }

  set context(context: Context | null) {
    this.contextId = context ? context.id : null
  }

  @computed
  get taskList() {
    if (this.context)
      return [...this.context.taskIDs.values()].map(id => app.state.tasks.get(id)!)
    else
      return [...app.state.tasks.values()]
  }

  @observable
  taskId: ID | null = null

  @computed
  get task() {
    return this.taskId ? app.state.tasks.get(this.taskId)! : null
  }

  set task(task: Task | null) {
    this.taskId = task ? task.id : null
  }

  get daytime(): boolean {
    const time = new Date().getHours()
    return time > 6 && time < 22
  }
}

const ui = new TodoUi()
export default ui;
