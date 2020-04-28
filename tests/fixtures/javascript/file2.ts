/* ---------------------------------------------------------------------------------------
 Todos.ts
 Microsoft grants you the right to use these script files under the Apache 2.0 license.
 Microsoft reserves total other rights to the files not expressly granted by Microsoft,
 whether by implication, estoppel or otherwise. The copyright notices and MIT licenses
 below are for informational purposes only.

 Portions Copyright © Microsoft Corporation
 Apache 2.0 License

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 file except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under
 the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 ANY KIND, either express or implied.

 See the License for the specific language governing permissions and limitations
 under the License.
 ------------------------------------------------------------------------------------------
 Provided for Informational Purposes Only
 MIT License
 Permission is hereby granted, free of charge, to any person obtaining a copy of this
 software and associated documentation files (the "Software"), to deal in the Software
 without restriction, including without limitation the rights to use, copy, modify, merge,
 publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in total copies
 or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.
 --------------------------------------------------------------------------------------- */
// Todos.js
// https://github.com/documentcloud/backbone/blob/master/examples/todos/todos.js

// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.js)
// to persist Backbone models within your browser.

declare namespace Backbone {
    export class Model {
        constructor (attr? , opts? );
        public get(name: string): any;
        public set(name: string, val: any): void;
        public set(obj: any): void;
        public save(attr? , opts? ): void;
        public destroy(): void;
        public bind(ev: string, f: Function, ctx?: any): void;
        public toJSON(): any;
    }
    export class Collection<T> {
        public length: number;
        constructor (models? , opts? );
        public bind(ev: string, f: Function, ctx?: any): void;
        public create(attrs, opts? ): any;
        public each(f: (elem: T) => void ): void;
        public fetch(opts?: any): void;
        public last(): T;
        public last(n: number): T[];
        public filter(f: (elem: T) => boolean): T[];
        public without(...values: T[]): T[];
    }
    export class View {

        public static extend: any;
        public el: HTMLElement;
        public $el: JQuery;
        public model: Model;
        public delegateEvents: any;
        public tagName: string;
        public events: any;
        constructor (options? );
        public $(selector: string): JQuery;
        public remove(): void;
        public make(tagName: string, attrs? , opts? ): View;
        public setElement(element: HTMLElement, delegate?: boolean): void;
        public setElement(element: JQuery, delegate?: boolean): void;
    }
}
interface JQuery {
    fadeIn(): JQuery;
    fadeOut(): JQuery;
    focus(): JQuery;
    html(): string;
    html(val: string): JQuery;
    show(): JQuery;
    addClass(className: string): JQuery;
    removeClass(className: string): JQuery;
    append(el: HTMLElement): JQuery;
    val(): string;
    val(value: string): JQuery;
    attr(attrName: string): string;
}
declare var $: {
    (el: HTMLElement): JQuery;
    (selector: string): JQuery;
    (readyCallback: () => void ): JQuery;
};
declare var _: {
    each<T, U>(arr: T[], f: (elem: T) => U): U[];
    delay(f: Function, wait: number, ...arguments: any[]): number;
    template(template: string): (model: any) => string;
    bindAll(object: any, ...methodNames: string[]): void;
};
declare var Store: any;


// Todo Model
// ----------

// Our basic **Todo** model has `content`, `order`, and `done` attributes.
class Todo extends Backbone.Model {

    // Default attributes for the todo.
    public defaults() {
        return {
            content: "empty todo...",
            done: false
        }
    }

    // Ensure that each todo created has `content`.
    public initialize() {
        if (!this.get("content")) {
            this.set({ "content": this.defaults().content });
        }
    }

    // Toggle the `done` state of this todo item.
    public toggle() {
        this.save({ done: !this.get("done") });
    }

    // Remove this Todo from *localStorage* and delete its view.
    public clear() {
        this.destroy();
    }

}

// Todo Collection
// ---------------

// The collection of todos is backed by *localStorage* instead of a remote
// server.
class TodoList extends Backbone.Collection<Todo> {

    // Reference to this collection's model.
    public model = Todo;

    // Save total of the todo items under the `"todos"` namespace.
    public localStorage = new Store("todos-backbone");

    // Filter down the list of total todo items that are finished.
    public done() {
        return this.filter(todo => todo.get('done'));
    }

    // Filter down the list to only todo items that are still not finished.
    public remaining() {
        return this.without.apply(this, this.done());
    }

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    public nextOrder() {
        if (!this.length) { return 1; }
        return this.last().get('order') + 1;
    }

    // Todos are sorted by their original insertion order.
    public comparator(todo: Todo) {
        return todo.get('order');
    }

}

// Create our global collection of **Todos**.
let Todos = new TodoList();

// Todo Item View
// --------------

// The DOM element for a todo item...
class TodoView extends Backbone.View {

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    public template: (data: any) => string;

    // A TodoView model must be a Todo, redeclare with specific type
    public model: Todo;
    public input: JQuery;

    constructor (options? ) {
        // ... is a list tag.
        this.tagName = "li";

        // The DOM events specific to an item.
        this.events = {
            "click .check": "toggleDone",
            "dblclick label.todo-content": "edit",
            "click span.todo-destroy": "clear",
            "keypress .todo-input": "updateOnEnter",
            "blur .todo-input": "close"
        };

        super(options);

        // Cache the template function for a single item.
        this.template = _.template($('#item-template').html());

        _.bindAll(this, 'render', 'close', 'remove');
        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);
    }

    // Re-render the contents of the todo item.
    public render() {
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.todo-input');
        return this;
    }

    // Toggle the `"done"` state of the model.
    public toggleDone() {
        this.model.toggle();
    }

    // Switch this view into `"editing"` mode, displaying the input field.
    public edit() {
        this.$el.addClass("editing");
        this.input.focus();
    }

    // Close the `"editing"` mode, saving changes to the todo.
    public close() {
        this.model.save({ content: this.input.val() });
        this.$el.removeClass("editing");
    }

    // If you hit `enter`, we're through editing the item.
    public updateOnEnter(e) {
        if (e.keyCode == 13) { close(); }
    }

    // Remove the item, destroy the model.
    public clear() {
        this.model.clear();
    }

}

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
class AppView extends Backbone.View {

    // Delegated events for creating new items, and clearing completed ones.
    public events = {
        "keypress #new-todo": "createOnEnter",
        "keyup #new-todo": "showTooltip",
        "click .todo-clear a": "clearCompleted",
        "click .mark-all-done": "toggleAllComplete"
    };

    public input: JQuery;
    public allCheckbox: HTMLInputElement;
    public statsTemplate: (params: any) => string;

    public tooltipTimeout: number = null;

    constructor () {
        super();
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        this.setElement($("#todoapp"), true);

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        _.bindAll(this, 'addOne', 'addAll', 'render', 'toggleAllComplete');

        this.input = this.$("#new-todo");
        this.allCheckbox = this.$(".mark-total-done")[0];
        this.statsTemplate = _.template($('#stats-template').html());

        Todos.bind('add', this.addOne);
        Todos.bind('reset', this.addAll);
        Todos.bind('all', this.render);

        Todos.fetch();
    }

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    public render() {
        let done = Todos.done().length;
        let remaining = Todos.remaining().length;

        this.$('#todo-stats').html(this.statsTemplate({
            total: Todos.length,
            done,
            remaining
        }));

        this.allCheckbox.checked = !remaining;
    }

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    public addOne(todo) {
        let view = new TodoView({ model: todo });
        this.$("#todo-list").append(view.render().el);
    }

    // Add total items in the **Todos** collection at once.
    public addAll() {
        Todos.each(this.addOne);
    }

    // Generate the attributes for a new Todo item.
    public newAttributes() {
        return {
            content: this.input.val(),
            order: Todos.nextOrder(),
            done: false
        };
    }

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    public createOnEnter(e) {
        if (e.keyCode != 13) { return; }
        Todos.create(this.newAttributes());
        this.input.val('');
    }

    // Clear total done todo items, destroying their models.
    public clearCompleted() {
        _.each(Todos.done(), todo => todo.clear());
        return false;
    }
    // Lazily show the tooltip that tells you to press `enter` to save
    // a new todo item, after one second.
    public showTooltip(e) {
        let tooltip = $(".ui-tooltip-top");
        let val = this.input.val();
        tooltip.fadeOut();
        if (this.tooltipTimeout) { clearTimeout(this.tooltipTimeout); }
        if (val == '' || val == this.input.attr('placeholder')) { return; }
        this.tooltipTimeout = _.delay(() => tooltip.show().fadeIn(), 1000);
    }

    public toggleAllComplete() {
        let done = this.allCheckbox.checked;
        Todos.each(todo => todo.save({ 'done': done }));
    }

}

// Load the application once the DOM is ready, using `jQuery.ready`:
$(() => {
    // Finally, we kick things off by creating the **App**.
    new AppView();
});
