import { observable } from "mobx";

export default class ObservableSet<T> implements Set<T> {
    [Symbol.toStringTag]: "Set";

    [Symbol.iterator](): IterableIterator<T> {
        return this.values()
    }

    entries(): IterableIterator<[T, T]> {
        return this.map.entries()
    }

    keys(): IterableIterator<T> {
        return this.map.keys()
    }

    values(): IterableIterator<T> {
        return this.map.values()
    }

    add(value: T): this {
        this.map.set(value, value)
        return this
    }

    clear(): void {
        this.map.clear()
    }

    delete(value: T): boolean {
        return this.map.delete(value)
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
        this.map.forEach((a, b) => callbackfn(a, b, this), thisArg)
    }

    has(value: T): boolean {
        return this.map.has(value)
    }

    get size() {
        return this.map.size
    }

    @observable
    private map = new Map()
}
