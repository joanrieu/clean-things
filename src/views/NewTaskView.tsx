import { observable, action } from "mobx";
import { observer } from "mobx-preact"
import { h, Component } from "preact"
import app from "../app";
import ui from "../ui";

@observer
export default class NewTaskView extends Component {
  @observable
  name = ""

  @action.bound
  onKeyPress(event: any) {
    this.name = event.target.value as string
    if (event.keyCode === 13 && this.name) {
      const id = app.newId("task")
      app.createTask(id, this.name)
      app.setTaskContext(id, ui.contextId)
      this.name = ""
    }
  }

  render() {
    return (
      <form className="uk-position-bottom uk-margin-bottom uk-margin-medium-left uk-margin-medium-right uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
        style={{ zIndex: 2 }}
        uk-grid>
        <div className={"uk-inline uk-width-expand" + (ui.daytime ? "" : " uk-background-secondary")}>
          <span className="uk-form-icon"
            uk-icon="plus" />
          <input className="uk-input uk-box-shadow-large"
            onKeyPress={this.onKeyPress}
            placeholder="New task"
            value={this.name} />
        </div>
      </form>
    )
  }
}
