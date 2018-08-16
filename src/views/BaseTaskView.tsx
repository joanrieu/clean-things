import { computed } from "mobx";
import { observer } from "mobx-preact"
import { h, Component } from "preact"
import app from "../app";

@observer
export default abstract class BaseTaskView extends Component<{ task: Task }> {
  @computed
  get taskContext() {
    const { task } = this.props
    return [...app.state.contexts.values()]
      .find(context => context.taskIDs.includes(task.id))
  }

  @computed
  get isOverdue() {
    const { task } = this.props
    return task.dueDate && task.dueDate.getTime() - new Date(new Date().toDateString()).getTime() < 0
  }

  renderCheckbox() {
    const { task } = this.props
    return (
      <input className="uk-checkbox uk-border-circle"
        type="checkbox"
        checked={task.checked}
        onChange={(event: any) =>
          app.checkTask(task.id, event.target.checked)}
        style={{
          width: "2em",
          height: "2em",
          backgroundSize: "2em",
          backgroundPosition: ".1em .1em"
        }} />
    )
  }
}
