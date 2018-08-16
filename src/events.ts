type ID = string

type TodoEvent =
  | { type: "task_created", taskId: ID, name: string }
  | { type: "task_renamed", taskId: ID, name: string }
  | { type: "task_attached_to_context", taskId: ID, contextId: ID }
  | { type: "task_detached_from_context", taskId: ID, contextId: ID }
  | { type: "task_checked", taskId: ID }
  | { type: "task_unchecked", taskId: ID }
  | { type: "task_due_date_set", taskId: ID, dueDate: string }
  | { type: "task_due_date_unset", taskId: ID }
  | { type: "task_deleted", taskId: ID }
  | { type: "context_created", contextId: ID, name: string }
  | { type: "context_renamed", contextId: ID, name: string }
  | { type: "context_deleted", contextId: ID }
  | { type: "task_reordered_in_context", contextId: ID, oldPosition: number, newPosition: number }
