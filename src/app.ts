import { action, observable } from "mobx"

function assert(predicate: () => any) {
  if (!predicate())
    throw new Error("assertion failed: " + predicate)
}

class TodoApp {
  newId(type: string) {
    return type + ":" + Math.random().toString(16).slice(2);
  }

  @action
  createTask(taskId: ID, name: string) {
    assert(() => !this.state.tasks.has(taskId))
    this.apply({ type: "task_created", taskId, name })
  }

  @action
  setTaskContext(taskId: ID, contextId: ID | null) {
    assert(() => this.state.tasks.has(taskId))
    for (const context of this.state.contexts.values())
      if (context.taskIDs.includes(taskId))
        this.apply({ type: "task_detached_from_context", taskId, contextId: context.id })
    if (contextId) {
      assert(() => this.state.contexts.has(contextId))
      this.apply({ type: "task_attached_to_context", taskId, contextId })
    }
  }

  @action
  renameTask(taskId: ID, name: string) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({ type: "task_renamed", taskId, name })
  }

  @action
  checkTask(taskId: ID, check = true) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({
      type: check ? "task_checked" : "task_unchecked",
      taskId
    } as TodoEvent)
  }

  setTaskDueDate(taskId: ID, dueDate?: Date) {
    assert(() => this.state.tasks.has(taskId))
    if (dueDate)
      this.apply({ type: "task_due_date_set", taskId, dueDate: dueDate.toISOString() })
    else
      this.apply({ type: "task_due_date_unset", taskId })
  }

  @action
  deleteTask(taskId: ID) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({ type: "task_deleted", taskId })
  }

  @action
  createContext(contextId: ID, name: string) {
    assert(() => !this.state.contexts.has(contextId))
    this.apply({ type: "context_created", contextId, name })
  }

  @action
  renameContext(contextId: ID, name: string) {
    assert(() => this.state.contexts.has(contextId))
    this.apply({ type: "context_renamed", contextId, name })
  }

  @action
  deleteContext(contextId: ID, name: string) {
    assert(() => this.state.contexts.has(contextId))
    this.apply({ type: "context_deleted", contextId })
  }

  @action
  reorderTaskInContext(contextId: ID, oldPosition: number, newPosition: number): any {
    assert(() => this.state.contexts.has(contextId))
    const context = this.state.contexts.get(contextId)!
    assert(() => oldPosition >= 0 && oldPosition < context.taskIDs.length)
    assert(() => newPosition >= 0 && newPosition < context.taskIDs.length)
    this.apply({ type: "task_reordered_in_context", contextId, oldPosition, newPosition })
  }

  @observable
  state: TodoState = {
    tasks: new Map(),
    contexts: new Map()
  }

  @observable
  readonly events: TodoEvent[] = []

  apply(event: TodoEvent) {
    this.events.push(event)
    switch (event.type) {
      case "task_created":
        this.state.tasks.set(event.taskId, {
          id: event.taskId,
          name: event.name,
          checked: false,
          dueDate: null
        })
        break
      case "task_renamed":
        this.state.tasks.get(event.taskId)!.name = event.name
        break
      case "task_attached_to_context":
        this.state.contexts.get(event.contextId)!.taskIDs.push(event.taskId)
        break
      case "task_detached_from_context":
        const { taskIDs } = this.state.contexts.get(event.contextId)!
        taskIDs.splice(taskIDs.indexOf(event.taskId), 1)
        break
      case "task_checked":
        this.state.tasks.get(event.taskId)!.checked = true
        break
      case "task_unchecked":
        this.state.tasks.get(event.taskId)!.checked = false
        break
      case "task_due_date_set":
        this.state.tasks.get(event.taskId)!.dueDate = new Date(event.dueDate)
        break
      case "task_due_date_unset":
        this.state.tasks.get(event.taskId)!.dueDate = null
        break
      case "task_deleted":
        this.state.tasks.delete(event.taskId)
        break
      case "context_created":
        this.state.contexts.set(event.contextId, {
          id: event.contextId,
          name: event.name,
          taskIDs: []
        })
        break
      case "context_renamed":
        this.state.contexts.get(event.contextId)!.name = event.name
        break
      case "context_deleted":
        this.state.contexts.delete(event.contextId)
        break
      case "task_reordered_in_context":
        const context = this.state.contexts.get(event.contextId)!
        const [ taskId ] = context.taskIDs.splice(event.oldPosition, 1)
        context.taskIDs.splice(event.newPosition, 0, taskId)
        break
    }
  }
}

const app = new TodoApp()
export default app;
