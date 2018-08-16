import { observer } from "mobx-preact";
import { h, Component } from "preact";
import ui from "../ui";
import ContextListView from "./ContextListView";
import TaskListView from "./TaskListView";
import NewTaskView from "./NewTaskView";
import TaskView from "./TaskView";

@observer
export default class TodoAppView extends Component {
  render() {
    const scrollable = {
      overflow: "auto",
      flex: 1,
      minHeight: 1
    }
    return (
      <div className={"uk-flex" + (ui.daytime ? "" : " uk-light uk-background-secondary")}
        style={{ height: "100vh" }}>
        <div className={"uk-width-medium uk-flex uk-flex-column" + (ui.daytime ? " uk-background-muted" : " uk-background-secondary uk-box-shadow-xlarge")}>
          <div className="uk-logo uk-padding">
            Clean Things
          </div>
          <div className="uk-padding uk-padding-remove-right" style={scrollable}>
            <ContextListView />
          </div>
        </div>
        <div className="uk-flex-1 uk-flex uk-flex-column"
          style={{ position: "relative" }}>
          <div style={scrollable}>
            <div className="uk-padding uk-padding-remove-left uk-padding-remove-right">
              <TaskListView />
              <div className="uk-padding" />
            </div>
          </div>
          <NewTaskView />
        </div>
        {ui.task &&
          <div className={"uk-width-medium uk-flex uk-flex-column" + (ui.daytime ? " uk-background-muted" : " uk-background-secondary uk-box-shadow-xlarge")}>
            <TaskView task={ui.task} />
          </div>
        }
      </div>
    )
  }
}
