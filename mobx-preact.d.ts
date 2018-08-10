/// <reference types="preact">
declare module "mobx-preact"
declare function observer<T extends preact.Component>(target: T): T
