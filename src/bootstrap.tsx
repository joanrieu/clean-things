import { autorun } from "mobx";
import { h, render } from "preact"
import app from "./app";

(window as any).app = app

restoreEvents()
autorun(backupEvents)

function backupEvents() {
  const events = JSON.stringify(app.events)
  localStorage.setItem("events", events)
}

function restoreEvents() {
  const events = localStorage.getItem("events")
  if (events)
    for (const event of JSON.parse(events))
      app.apply(event)
}

render(<TodoAppView />, document.body)
