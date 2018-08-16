interface TodoState {
  tasks: Map<ID, Task>,
  contexts: Map<ID, Context>
}

interface Task {
  id: ID,
  name: string,
  checked: boolean,
  dueDate: Date | null
}

interface Context {
  id: ID,
  name: string,
  taskIDs: ID[]
}
