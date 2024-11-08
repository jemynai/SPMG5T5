
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run$1);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately before the component is updated after any state change.
     *
     * The first time the callback runs will be before the initial `onMount`
     *
     * https://svelte.dev/docs#run-time-svelte-beforeupdate
     */
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run$1).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /* svelte-app\src\Apply.svelte generated by Svelte v3.59.2 */
    const file$g = "svelte-app\\src\\Apply.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    // (174:8) {:else}
    function create_else_block$5(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let button;
    	let t2_value = (/*step*/ ctx[0] === 4 ? 'Review' : 'Next') + "";
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*step*/ ctx[0] === 1) return create_if_block_3$6;
    		if (/*step*/ ctx[0] === 2) return create_if_block_4$4;
    		if (/*step*/ ctx[0] === 3) return create_if_block_6$2;
    		if (/*step*/ ctx[0] === 4) return create_if_block_8;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*step*/ ctx[0] > 1 && create_if_block_2$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			button = element("button");
    			t2 = text(t2_value);
    			attr_dev(button, "class", "next-button svelte-1ay2dyh");
    			add_location(button, file$g, 285, 16, 10512);
    			attr_dev(div, "class", "buttons svelte-1ay2dyh");
    			add_location(div, file$g, 281, 12, 10339);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*nextStep*/ ctx[12], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			}

    			if (/*step*/ ctx[0] > 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$6(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*step*/ 1 && t2_value !== (t2_value = (/*step*/ ctx[0] === 4 ? 'Review' : 'Next') + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (if_block0) {
    				if_block0.d(detaching);
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(174:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (159:8) {#if reviewMode}
    function create_if_block$8(ctx) {
    	let div0;
    	let h3;
    	let t1;
    	let p0;
    	let strong0;
    	let t3;
    	let t4;
    	let t5;
    	let p1;
    	let strong1;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let p2;
    	let strong2;
    	let t12;

    	let t13_value = (/*selectedDayOption*/ ctx[4] === "full-day"
    	? "Full Day"
    	: /*selectedHalfDay*/ ctx[6]) + "";

    	let t13;
    	let t14;
    	let p3;
    	let strong3;
    	let t16;
    	let t17;
    	let t18;
    	let div1;
    	let button0;
    	let t20;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*applicationType*/ ctx[2] === "weekly" && create_if_block_1$6(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Review your application";
    			t1 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Date:";
    			t3 = space();
    			t4 = text(/*selectedDate*/ ctx[1]);
    			t5 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Application Type:";
    			t7 = space();
    			t8 = text(/*applicationType*/ ctx[2]);
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Time:";
    			t12 = space();
    			t13 = text(t13_value);
    			t14 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Reason:";
    			t16 = space();
    			t17 = text(/*reason*/ ctx[7]);
    			t18 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Back to Edit";
    			t20 = space();
    			button1 = element("button");
    			button1.textContent = "Submit";
    			add_location(h3, file$g, 160, 16, 4594);
    			add_location(strong0, file$g, 161, 19, 4646);
    			add_location(p0, file$g, 161, 16, 4643);
    			add_location(strong1, file$g, 162, 19, 4707);
    			add_location(p1, file$g, 162, 16, 4704);
    			add_location(strong2, file$g, 166, 19, 4941);
    			add_location(p2, file$g, 166, 16, 4938);
    			add_location(strong3, file$g, 167, 19, 5053);
    			add_location(p3, file$g, 167, 16, 5050);
    			attr_dev(div0, "class", "review-box svelte-1ay2dyh");
    			add_location(div0, file$g, 159, 12, 4553);
    			attr_dev(button0, "class", "back-button svelte-1ay2dyh");
    			add_location(button0, file$g, 170, 16, 5160);
    			attr_dev(button1, "class", "next-button svelte-1ay2dyh");
    			add_location(button1, file$g, 171, 16, 5248);
    			attr_dev(div1, "class", "buttons svelte-1ay2dyh");
    			add_location(div1, file$g, 169, 12, 5122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div0, t9);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t10);
    			append_dev(div0, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(div0, t14);
    			append_dev(div0, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t16);
    			append_dev(p3, t17);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t20);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*backToEdit*/ ctx[22], false, false, false, false),
    					listen_dev(button1, "click", /*handleSubmit*/ ctx[21], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDate*/ 2) set_data_dev(t4, /*selectedDate*/ ctx[1]);
    			if (dirty[0] & /*applicationType*/ 4) set_data_dev(t8, /*applicationType*/ ctx[2]);

    			if (/*applicationType*/ ctx[2] === "weekly") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$6(ctx);
    					if_block.c();
    					if_block.m(div0, t10);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*selectedDayOption, selectedHalfDay*/ 80 && t13_value !== (t13_value = (/*selectedDayOption*/ ctx[4] === "full-day"
    			? "Full Day"
    			: /*selectedHalfDay*/ ctx[6]) + "")) set_data_dev(t13, t13_value);

    			if (dirty[0] & /*reason*/ 128) set_data_dev(t17, /*reason*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(159:8) {#if reviewMode}",
    		ctx
    	});

    	return block;
    }

    // (271:33) 
    function create_if_block_8(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Reason";
    			t1 = space();
    			div = element("div");
    			textarea = element("textarea");
    			add_location(h3, file$g, 271, 16, 9944);
    			attr_dev(textarea, "placeholder", "Please provide a reason for your WFH request");
    			attr_dev(textarea, "aria-label", "Reason for WFH request");
    			attr_dev(textarea, "rows", "4");
    			attr_dev(textarea, "class", "svelte-1ay2dyh");
    			add_location(textarea, file$g, 273, 20, 10021);
    			attr_dev(div, "class", "form-group svelte-1ay2dyh");
    			add_location(div, file$g, 272, 16, 9976);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*reason*/ ctx[7]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[29]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*reason*/ 128) {
    				set_input_value(textarea, /*reason*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(271:33) ",
    		ctx
    	});

    	return block;
    }

    // (229:33) 
    function create_if_block_6$2(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let label0;
    	let input0;
    	let input0_checked_value;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let input1_checked_value;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*showPartDayOptions*/ ctx[5] && create_if_block_7$2(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Work Arrangement";
    			t1 = space();
    			div = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text(" \n                        Full Day");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text(" \n                        Part Day");
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(h3, file$g, 229, 16, 8012);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "name", "dayOption");
    			input0.value = "full-day";
    			input0.checked = input0_checked_value = /*selectedDayOption*/ ctx[4] === "full-day";
    			add_location(input0, file$g, 232, 24, 8131);
    			attr_dev(label0, "class", "svelte-1ay2dyh");
    			add_location(label0, file$g, 231, 20, 8099);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "name", "dayOption");
    			input1.value = "part-day";
    			input1.checked = input1_checked_value = /*selectedDayOption*/ ctx[4] === "part-day";
    			add_location(input1, file$g, 242, 24, 8549);
    			attr_dev(label1, "class", "svelte-1ay2dyh");
    			add_location(label1, file$g, 241, 20, 8517);
    			attr_dev(div, "class", "form-group svelte-1ay2dyh");
    			add_location(div, file$g, 230, 16, 8054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			append_dev(label0, input0);
    			append_dev(label0, t2);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t4);
    			append_dev(div, t5);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*handleDayOptionChange*/ ctx[17], false, false, false, false),
    					listen_dev(input1, "change", /*handleDayOptionChange*/ ctx[17], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDayOption*/ 16 && input0_checked_value !== (input0_checked_value = /*selectedDayOption*/ ctx[4] === "full-day")) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (dirty[0] & /*selectedDayOption*/ 16 && input1_checked_value !== (input1_checked_value = /*selectedDayOption*/ ctx[4] === "part-day")) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}

    			if (/*showPartDayOptions*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(229:33) ",
    		ctx
    	});

    	return block;
    }

    // (187:33) 
    function create_if_block_4$4(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let label0;
    	let input0;
    	let input0_checked_value;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let input1_checked_value;
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*applicationType*/ ctx[2] === "weekly" && create_if_block_5$3(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Application Type";
    			t1 = space();
    			div = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text(" \n                        One-time application");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text(" \n                        Repeated weekly");
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(h3, file$g, 187, 16, 5926);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "name", "applicationType");
    			input0.value = "one-time";
    			input0.checked = input0_checked_value = /*applicationType*/ ctx[2] === "one-time";
    			add_location(input0, file$g, 190, 24, 6045);
    			attr_dev(label0, "class", "svelte-1ay2dyh");
    			add_location(label0, file$g, 189, 20, 6013);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "name", "applicationType");
    			input1.value = "weekly";
    			input1.checked = input1_checked_value = /*applicationType*/ ctx[2] === "weekly";
    			add_location(input1, file$g, 200, 24, 6485);
    			attr_dev(label1, "class", "svelte-1ay2dyh");
    			add_location(label1, file$g, 199, 20, 6453);
    			attr_dev(div, "class", "form-group svelte-1ay2dyh");
    			add_location(div, file$g, 188, 16, 5968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			append_dev(label0, input0);
    			append_dev(label0, t2);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t4);
    			append_dev(div, t5);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*handleApplicationTypeChange*/ ctx[14], false, false, false, false),
    					listen_dev(input1, "change", /*handleApplicationTypeChange*/ ctx[14], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*applicationType*/ 4 && input0_checked_value !== (input0_checked_value = /*applicationType*/ ctx[2] === "one-time")) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (dirty[0] & /*applicationType*/ 4 && input1_checked_value !== (input1_checked_value = /*applicationType*/ ctx[2] === "weekly")) {
    				prop_dev(input1, "checked", input1_checked_value);
    			}

    			if (/*applicationType*/ ctx[2] === "weekly") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5$3(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(187:33) ",
    		ctx
    	});

    	return block;
    }

    // (175:12) {#if step === 1}
    function create_if_block_3$6(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let label;
    	let t3;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Apply for WFH Arrangement";
    			t1 = space();
    			div = element("div");
    			label = element("label");
    			label.textContent = "Select WFH Date:";
    			t3 = space();
    			input = element("input");
    			attr_dev(h2, "id", "modal-title");
    			add_location(h2, file$g, 175, 16, 5396);
    			attr_dev(label, "for", "wfh-date");
    			attr_dev(label, "class", "svelte-1ay2dyh");
    			add_location(label, file$g, 177, 20, 5509);
    			attr_dev(input, "type", "date");
    			attr_dev(input, "id", "wfh-date");
    			attr_dev(input, "min", new Date().toISOString().split('T')[0]);
    			add_location(input, file$g, 178, 20, 5576);
    			attr_dev(div, "class", "form-group svelte-1ay2dyh");
    			add_location(div, file$g, 176, 16, 5464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t3);
    			append_dev(div, input);
    			set_input_value(input, /*selectedDate*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[24]),
    					listen_dev(input, "change", /*validateDate*/ ctx[11], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDate*/ 2) {
    				set_input_value(input, /*selectedDate*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(175:12) {#if step === 1}",
    		ctx
    	});

    	return block;
    }

    // (252:20) {#if showPartDayOptions}
    function create_if_block_7$2(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button0_class_value;
    	let button0_aria_pressed_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_class_value;
    	let button1_aria_pressed_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("AM");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("PM");
    			attr_dev(button0, "class", button0_class_value = "day-option " + (/*selectedHalfDay*/ ctx[6] === 'AM' ? 'selected' : '') + " svelte-1ay2dyh");
    			attr_dev(button0, "aria-pressed", button0_aria_pressed_value = /*selectedHalfDay*/ ctx[6] === 'AM');
    			add_location(button0, file$g, 253, 28, 9088);
    			attr_dev(button1, "class", button1_class_value = "day-option " + (/*selectedHalfDay*/ ctx[6] === 'PM' ? 'selected' : '') + " svelte-1ay2dyh");
    			attr_dev(button1, "aria-pressed", button1_aria_pressed_value = /*selectedHalfDay*/ ctx[6] === 'PM');
    			add_location(button1, file$g, 260, 28, 9465);
    			attr_dev(div, "role", "group");
    			attr_dev(div, "aria-label", "Part day selection");
    			attr_dev(div, "class", "part-day-options svelte-1ay2dyh");
    			add_location(div, file$g, 252, 24, 8984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, t0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[27], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[28], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedHalfDay*/ 64 && button0_class_value !== (button0_class_value = "day-option " + (/*selectedHalfDay*/ ctx[6] === 'AM' ? 'selected' : '') + " svelte-1ay2dyh")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty[0] & /*selectedHalfDay*/ 64 && button0_aria_pressed_value !== (button0_aria_pressed_value = /*selectedHalfDay*/ ctx[6] === 'AM')) {
    				attr_dev(button0, "aria-pressed", button0_aria_pressed_value);
    			}

    			if (dirty[0] & /*selectedHalfDay*/ 64 && button1_class_value !== (button1_class_value = "day-option " + (/*selectedHalfDay*/ ctx[6] === 'PM' ? 'selected' : '') + " svelte-1ay2dyh")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty[0] & /*selectedHalfDay*/ 64 && button1_aria_pressed_value !== (button1_aria_pressed_value = /*selectedHalfDay*/ ctx[6] === 'PM')) {
    				attr_dev(button1, "aria-pressed", button1_aria_pressed_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(252:20) {#if showPartDayOptions}",
    		ctx
    	});

    	return block;
    }

    // (210:20) {#if applicationType === "weekly"}
    function create_if_block_5$3(ctx) {
    	let div1;
    	let h4;
    	let t1;
    	let div0;
    	let t2;
    	let p;
    	let t3;
    	let t4_value = (/*selectedDays*/ ctx[3].join(", ") || "None") + "";
    	let t4;
    	let each_value = /*daysOfWeek*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Select Days (max 3):";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			p = element("p");
    			t3 = text("Selected: ");
    			t4 = text(t4_value);
    			add_location(h4, file$g, 211, 28, 7000);
    			attr_dev(div0, "role", "group");
    			attr_dev(div0, "aria-label", "Day selection");
    			attr_dev(div0, "class", "days-container svelte-1ay2dyh");
    			add_location(div0, file$g, 212, 28, 7058);
    			attr_dev(p, "class", "selected-days svelte-1ay2dyh");
    			add_location(p, file$g, 224, 28, 7807);
    			attr_dev(div1, "class", "days-selection");
    			add_location(div1, file$g, 210, 24, 6943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDays, daysOfWeek, toggleDay, handleKeyPress*/ 99336) {
    				each_value = /*daysOfWeek*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*selectedDays*/ 8 && t4_value !== (t4_value = (/*selectedDays*/ ctx[3].join(", ") || "None") + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(210:20) {#if applicationType === \\\"weekly\\\"}",
    		ctx
    	});

    	return block;
    }

    // (214:32) {#each daysOfWeek as day}
    function create_each_block$d(ctx) {
    	let button;
    	let t0_value = /*day*/ ctx[31] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let button_aria_pressed_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[25](/*day*/ ctx[31]);
    	}

    	function keypress_handler(...args) {
    		return /*keypress_handler*/ ctx[26](/*day*/ ctx[31], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "day-option " + (/*selectedDays*/ ctx[3].includes(/*day*/ ctx[31])
    			? 'selected'
    			: '') + " svelte-1ay2dyh");

    			attr_dev(button, "aria-pressed", button_aria_pressed_value = /*selectedDays*/ ctx[3].includes(/*day*/ ctx[31]));
    			add_location(button, file$g, 214, 36, 7221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler_1, false, false, false, false),
    					listen_dev(button, "keypress", keypress_handler, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*selectedDays*/ 8 && button_class_value !== (button_class_value = "day-option " + (/*selectedDays*/ ctx[3].includes(/*day*/ ctx[31])
    			? 'selected'
    			: '') + " svelte-1ay2dyh")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*selectedDays*/ 8 && button_aria_pressed_value !== (button_aria_pressed_value = /*selectedDays*/ ctx[3].includes(/*day*/ ctx[31]))) {
    				attr_dev(button, "aria-pressed", button_aria_pressed_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(214:32) {#each daysOfWeek as day}",
    		ctx
    	});

    	return block;
    }

    // (283:16) {#if step > 1}
    function create_if_block_2$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Back";
    			attr_dev(button, "class", "back-button svelte-1ay2dyh");
    			add_location(button, file$g, 283, 20, 10412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*prevStep*/ ctx[13], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(283:16) {#if step > 1}",
    		ctx
    	});

    	return block;
    }

    // (164:16) {#if applicationType === "weekly"}
    function create_if_block_1$6(ctx) {
    	let p;
    	let strong;
    	let t1;
    	let t2_value = /*selectedDays*/ ctx[3].join(", ") + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Selected Days:";
    			t1 = space();
    			t2 = text(t2_value);
    			add_location(strong, file$g, 164, 23, 4838);
    			add_location(p, file$g, 164, 20, 4835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selectedDays*/ 8 && t2_value !== (t2_value = /*selectedDays*/ ctx[3].join(", ") + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(164:16) {#if applicationType === \\\"weekly\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*reviewMode*/ ctx[8]) return create_if_block$8;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "×";
    			t1 = space();
    			if_block.c();
    			attr_dev(button, "class", "close-button svelte-1ay2dyh");
    			attr_dev(button, "aria-label", "Close modal");
    			add_location(button, file$g, 150, 8, 4340);
    			attr_dev(div0, "class", "modal-content svelte-1ay2dyh");
    			attr_dev(div0, "role", "document");
    			add_location(div0, file$g, 146, 4, 4265);
    			attr_dev(div1, "class", "modal-backdrop svelte-1ay2dyh");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "aria-labelledby", "modal-title");
    			add_location(div1, file$g, 138, 0, 4083);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div0, t1);
    			if_block.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[23], false, false, false, false),
    					listen_dev(div1, "click", /*handleModalClick*/ ctx[19], false, false, false, false),
    					listen_dev(div1, "keydown", /*handleModalKeydown*/ ctx[20], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Apply', slots, []);
    	const dispatch = createEventDispatcher();
    	let step = 1;
    	let selectedDate = "";
    	let isDateValid = false;
    	let applicationType = "one-time";
    	let selectedDays = [];
    	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    	let selectedDayOption = "full-day";
    	let showPartDayOptions = false;
    	let selectedHalfDay = "";
    	let reason = "";
    	let reviewMode = false;

    	// Date validation to ensure selected date is at least 24 hours in the future
    	const validateDate = () => {
    		let now = new Date();
    		let selected = new Date(selectedDate);
    		let diffInMilliseconds = selected.getTime() - now.getTime();
    		let diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    		isDateValid = diffInHours >= 24;
    	};

    	const nextStep = () => {
    		if (step === 1 && (!selectedDate || !isDateValid)) {
    			alert("Please select a valid date at least 24 hours from now.");
    			return;
    		}

    		if (step === 2 && applicationType === "weekly" && selectedDays.length === 0) {
    			alert("Please select at least one day.");
    			return;
    		}

    		if (step === 3 && selectedDayOption === "part-day" && !selectedHalfDay) {
    			alert("Please select AM or PM for Part Day.");
    			return;
    		}

    		if (step === 4 && reason.trim() === "") {
    			alert("Please provide a reason.");
    			return;
    		}

    		if (step === 4) {
    			$$invalidate(8, reviewMode = true);
    		} else {
    			$$invalidate(0, step += 1);
    		}
    	};

    	const prevStep = () => {
    		$$invalidate(0, step -= 1);
    	};

    	const handleApplicationTypeChange = e => {
    		$$invalidate(2, applicationType = e.target.value);

    		if (applicationType === "one-time") {
    			$$invalidate(3, selectedDays = []);
    		}
    	};

    	const toggleDay = day => {
    		if (selectedDays.includes(day)) {
    			$$invalidate(3, selectedDays = selectedDays.filter(d => d !== day));
    		} else if (selectedDays.length < 3) {
    			$$invalidate(3, selectedDays = [...selectedDays, day]);
    		} else {
    			alert("You can only select up to 3 days.");
    		}
    	};

    	const handleKeyPress = (event, day) => {
    		if (event.key === 'Enter' || event.key === ' ') {
    			event.preventDefault();
    			toggleDay(day);
    		}
    	};

    	const handleDayOptionChange = e => {
    		$$invalidate(4, selectedDayOption = e.target.value);
    		$$invalidate(5, showPartDayOptions = selectedDayOption === "part-day");

    		if (selectedDayOption !== "part-day") {
    			$$invalidate(6, selectedHalfDay = "");
    		}
    	};

    	const selectHalfDay = period => {
    		$$invalidate(6, selectedHalfDay = period);
    	};

    	const handleModalClick = e => {
    		if (e.target === e.currentTarget) {
    			dispatch("close");
    		}
    	};

    	const handleModalKeydown = e => {
    		if (e.key === 'Escape') {
    			dispatch("close");
    		}
    	};

    	const handleSubmit = async () => {
    		const applicationData = {
    			employee_id: "YOUR_EMPLOYEE_ID",
    			date: selectedDate,
    			type: applicationType,
    			days: selectedDays,
    			halfDay: selectedDayOption === "full-day"
    			? "Full Day"
    			: selectedHalfDay,
    			reason,
    			status: "Pending"
    		};

    		try {
    			const response = await fetch("http://127.0.0.1:5000/create_arrangement", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify(applicationData)
    			});

    			if (response.ok) {
    				alert("Application submitted successfully!");
    				dispatch("close");
    			} else {
    				const data = await response.json();
    				alert(`Error: ${data.error}`);
    			}
    		} catch(error) {
    			alert(`Submission failed: ${error.message}`);
    		}
    	};

    	const backToEdit = () => {
    		$$invalidate(8, reviewMode = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Apply> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("close");

    	function input_input_handler() {
    		selectedDate = this.value;
    		$$invalidate(1, selectedDate);
    	}

    	const click_handler_1 = day => toggleDay(day);
    	const keypress_handler = (day, e) => handleKeyPress(e, day);
    	const click_handler_2 = () => selectHalfDay("AM");
    	const click_handler_3 = () => selectHalfDay("PM");

    	function textarea_input_handler() {
    		reason = this.value;
    		$$invalidate(7, reason);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		step,
    		selectedDate,
    		isDateValid,
    		applicationType,
    		selectedDays,
    		daysOfWeek,
    		selectedDayOption,
    		showPartDayOptions,
    		selectedHalfDay,
    		reason,
    		reviewMode,
    		validateDate,
    		nextStep,
    		prevStep,
    		handleApplicationTypeChange,
    		toggleDay,
    		handleKeyPress,
    		handleDayOptionChange,
    		selectHalfDay,
    		handleModalClick,
    		handleModalKeydown,
    		handleSubmit,
    		backToEdit
    	});

    	$$self.$inject_state = $$props => {
    		if ('step' in $$props) $$invalidate(0, step = $$props.step);
    		if ('selectedDate' in $$props) $$invalidate(1, selectedDate = $$props.selectedDate);
    		if ('isDateValid' in $$props) isDateValid = $$props.isDateValid;
    		if ('applicationType' in $$props) $$invalidate(2, applicationType = $$props.applicationType);
    		if ('selectedDays' in $$props) $$invalidate(3, selectedDays = $$props.selectedDays);
    		if ('selectedDayOption' in $$props) $$invalidate(4, selectedDayOption = $$props.selectedDayOption);
    		if ('showPartDayOptions' in $$props) $$invalidate(5, showPartDayOptions = $$props.showPartDayOptions);
    		if ('selectedHalfDay' in $$props) $$invalidate(6, selectedHalfDay = $$props.selectedHalfDay);
    		if ('reason' in $$props) $$invalidate(7, reason = $$props.reason);
    		if ('reviewMode' in $$props) $$invalidate(8, reviewMode = $$props.reviewMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		step,
    		selectedDate,
    		applicationType,
    		selectedDays,
    		selectedDayOption,
    		showPartDayOptions,
    		selectedHalfDay,
    		reason,
    		reviewMode,
    		dispatch,
    		daysOfWeek,
    		validateDate,
    		nextStep,
    		prevStep,
    		handleApplicationTypeChange,
    		toggleDay,
    		handleKeyPress,
    		handleDayOptionChange,
    		selectHalfDay,
    		handleModalClick,
    		handleModalKeydown,
    		handleSubmit,
    		backToEdit,
    		click_handler,
    		input_input_handler,
    		click_handler_1,
    		keypress_handler,
    		click_handler_2,
    		click_handler_3,
    		textarea_input_handler
    	];
    }

    class Apply extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Apply",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    var base_url = "http://localhost:5000";
    var config = {
    	base_url: base_url
    };

    /* svelte-app\src\WithdrawalRequest.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$4, console: console_1$6 } = globals;
    const file$f = "svelte-app\\src\\WithdrawalRequest.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (113:4) {:else}
    function create_else_block$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*withdrawalRequests*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*requestWithdrawal, withdrawalRequests, formatDate*/ 9) {
    				each_value = /*withdrawalRequests*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(113:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (108:46) 
    function create_if_block_2$5(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "No Applications Available";
    			t1 = space();
    			p = element("p");
    			p.textContent = "You have no approved applications available for withdrawal at this time.";
    			attr_dev(h3, "class", "svelte-gtl9ju");
    			add_location(h3, file$f, 109, 12, 3500);
    			attr_dev(p, "class", "svelte-gtl9ju");
    			add_location(p, file$f, 110, 12, 3547);
    			attr_dev(div, "class", "empty-state svelte-gtl9ju");
    			add_location(div, file$f, 108, 8, 3462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(108:46) ",
    		ctx
    	});

    	return block;
    }

    // (106:20) 
    function create_if_block_1$5(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*error*/ ctx[2]);
    			attr_dev(div, "class", "error svelte-gtl9ju");
    			add_location(div, file$f, 106, 8, 3374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(106:20) ",
    		ctx
    	});

    	return block;
    }

    // (104:4) {#if loading}
    function create_if_block$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading applications...";
    			attr_dev(div, "class", "loading svelte-gtl9ju");
    			add_location(div, file$f, 104, 8, 3294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(104:4) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (126:20) {#if application.half_day}
    function create_if_block_7$1(ctx) {
    	let p;
    	let strong;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Half Day:";
    			t1 = text(" Yes");
    			add_location(strong, file$f, 126, 27, 4286);
    			attr_dev(p, "class", "svelte-gtl9ju");
    			add_location(p, file$f, 126, 24, 4283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(126:20) {#if application.half_day}",
    		ctx
    	});

    	return block;
    }

    // (129:20) {#if application.days}
    function create_if_block_6$1(ctx) {
    	let p;
    	let strong;
    	let t1;
    	let t2_value = /*application*/ ctx[7].days + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Days:";
    			t1 = space();
    			t2 = text(t2_value);
    			add_location(strong, file$f, 129, 27, 4417);
    			attr_dev(p, "class", "svelte-gtl9ju");
    			add_location(p, file$f, 129, 24, 4414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*withdrawalRequests*/ 1 && t2_value !== (t2_value = /*application*/ ctx[7].days + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(129:20) {#if application.days}",
    		ctx
    	});

    	return block;
    }

    // (132:20) {#if application.reason}
    function create_if_block_5$2(ctx) {
    	let p;
    	let strong;
    	let t1;
    	let t2_value = /*application*/ ctx[7].reason + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Reason:";
    			t1 = space();
    			t2 = text(t2_value);
    			add_location(strong, file$f, 132, 27, 4561);
    			attr_dev(p, "class", "svelte-gtl9ju");
    			add_location(p, file$f, 132, 24, 4558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*withdrawalRequests*/ 1 && t2_value !== (t2_value = /*application*/ ctx[7].reason + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(132:20) {#if application.reason}",
    		ctx
    	});

    	return block;
    }

    // (144:65) 
    function create_if_block_4$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Withdrawal request submitted";
    			attr_dev(span, "class", "withdrawn-message svelte-gtl9ju");
    			add_location(span, file$f, 144, 24, 5101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(144:65) ",
    		ctx
    	});

    	return block;
    }

    // (138:20) {#if application.status === 'Approved'}
    function create_if_block_3$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*application*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Request Withdrawal";
    			attr_dev(button, "class", "withdrawal-button svelte-gtl9ju");
    			add_location(button, file$f, 138, 24, 4787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(138:20) {#if application.status === 'Approved'}",
    		ctx
    	});

    	return block;
    }

    // (114:8) {#each withdrawalRequests as application}
    function create_each_block$c(ctx) {
    	let div3;
    	let div0;
    	let h3;
    	let t1;
    	let span;
    	let t2_value = /*application*/ ctx[7].status + "";
    	let t2;
    	let span_class_value;
    	let t3;
    	let div1;
    	let p0;
    	let strong0;
    	let t5;
    	let t6_value = formatDate$1(/*application*/ ctx[7].date) + "";
    	let t6;
    	let t7;
    	let p1;
    	let strong1;
    	let t9;
    	let t10_value = (/*application*/ ctx[7].type || 'N/A') + "";
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let div2;
    	let t15;
    	let if_block0 = /*application*/ ctx[7].half_day && create_if_block_7$1(ctx);
    	let if_block1 = /*application*/ ctx[7].days && create_if_block_6$1(ctx);
    	let if_block2 = /*application*/ ctx[7].reason && create_if_block_5$2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*application*/ ctx[7].status === 'Approved') return create_if_block_3$5;
    		if (/*application*/ ctx[7].status === 'Withdrawn') return create_if_block_4$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block3 = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Application Details";
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Date:";
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Type:";
    			t9 = space();
    			t10 = text(t10_value);
    			t11 = space();
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			if (if_block2) if_block2.c();
    			t14 = space();
    			div2 = element("div");
    			if (if_block3) if_block3.c();
    			t15 = space();
    			attr_dev(h3, "class", "svelte-gtl9ju");
    			add_location(h3, file$f, 116, 20, 3808);
    			attr_dev(span, "class", span_class_value = "status " + /*application*/ ctx[7].status + " svelte-gtl9ju");
    			add_location(span, file$f, 117, 20, 3857);
    			attr_dev(div0, "class", "card-header svelte-gtl9ju");
    			add_location(div0, file$f, 115, 16, 3762);
    			add_location(strong0, file$f, 123, 23, 4076);
    			attr_dev(p0, "class", "svelte-gtl9ju");
    			add_location(p0, file$f, 123, 20, 4073);
    			add_location(strong1, file$f, 124, 23, 4157);
    			attr_dev(p1, "class", "svelte-gtl9ju");
    			add_location(p1, file$f, 124, 20, 4154);
    			attr_dev(div1, "class", "card-body svelte-gtl9ju");
    			add_location(div1, file$f, 122, 16, 4029);
    			attr_dev(div2, "class", "card-footer svelte-gtl9ju");
    			add_location(div2, file$f, 136, 16, 4677);
    			attr_dev(div3, "class", "withdrawal-card svelte-gtl9ju");
    			add_location(div3, file$f, 114, 12, 3716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, strong0);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t12);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t13);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div3, t14);
    			append_dev(div3, div2);
    			if (if_block3) if_block3.m(div2, null);
    			append_dev(div3, t15);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*withdrawalRequests*/ 1 && t2_value !== (t2_value = /*application*/ ctx[7].status + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*withdrawalRequests*/ 1 && span_class_value !== (span_class_value = "status " + /*application*/ ctx[7].status + " svelte-gtl9ju")) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*withdrawalRequests*/ 1 && t6_value !== (t6_value = formatDate$1(/*application*/ ctx[7].date) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*withdrawalRequests*/ 1 && t10_value !== (t10_value = (/*application*/ ctx[7].type || 'N/A') + "")) set_data_dev(t10, t10_value);

    			if (/*application*/ ctx[7].half_day) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t12);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*application*/ ctx[7].days) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*application*/ ctx[7].reason) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5$2(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if (if_block3) if_block3.d(1);
    				if_block3 = current_block_type && current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			if (if_block3) {
    				if_block3.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(114:8) {#each withdrawalRequests as application}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let h1;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1]) return create_if_block$7;
    		if (/*error*/ ctx[2]) return create_if_block_1$5;
    		if (/*withdrawalRequests*/ ctx[0].length === 0) return create_if_block_2$5;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Withdrawal Requests";
    			t1 = space();
    			if_block.c();
    			attr_dev(h1, "class", "svelte-gtl9ju");
    			add_location(h1, file$f, 101, 4, 3238);
    			attr_dev(div, "class", "container svelte-gtl9ju");
    			add_location(div, file$f, 100, 0, 3210);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$4("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatDate$1(dateValue) {
    	if (!dateValue) return 'N/A';

    	try {
    		let date;

    		if (typeof dateValue === 'object' && dateValue.seconds) {
    			date = new Date(dateValue.seconds * 1000);
    		} else if (typeof dateValue === 'string') {
    			date = new Date(dateValue);
    		} else {
    			date = new Date(dateValue);
    		}

    		if (isNaN(date.getTime())) {
    			return 'Invalid Date';
    		}

    		return date.toLocaleDateString('en-US', {
    			year: 'numeric',
    			month: 'long',
    			day: 'numeric'
    		});
    	} catch(err) {
    		console.error('Error formatting date:', err);
    		return 'Invalid Date';
    	}
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WithdrawalRequest', slots, []);
    	let withdrawalRequests = [];
    	let loading = false;
    	let error = null;

    	// Get employee ID from your auth system
    	const employeeId = localStorage.getItem('employeeId');

    	async function fetchWithdrawalRequests() {
    		$$invalidate(1, loading = true);
    		$$invalidate(2, error = null);

    		try {
    			const response = await fetch(`${config.base_url}/get_user_applications?eid=${employeeId}`, {
    				method: 'GET',
    				headers: {
    					'Accept': 'application/json',
    					'Content-Type': 'application/json'
    				}
    			});

    			if (!response.ok) {
    				throw new Error(`HTTP error! status: ${response.status}`);
    			}

    			const data = await response.json();
    			console.log("Fetched data:", data);

    			// Filter for Approved applications
    			$$invalidate(0, withdrawalRequests = data.filter(app => app.status === 'Approved'));
    		} catch(err) {
    			$$invalidate(2, error = "Failed to load applications. Please try again later.");
    			console.error("Error fetching applications:", err);
    		} finally {
    			$$invalidate(1, loading = false);
    		}
    	}

    	async function requestWithdrawal(applicationId) {
    		try {
    			const response = await fetch(`${config.base_url}/withdraw_application/${applicationId}`, {
    				method: 'POST',
    				headers: { 'Content-Type': 'application/json' },
    				body: JSON.stringify({ employee_id: employeeId })
    			});

    			if (!response.ok) {
    				const errorData = await response.json();
    				throw new Error(errorData.error || 'Failed to submit withdrawal request');
    			}

    			const result = await response.json();
    			alert('Withdrawal request submitted successfully');
    			await fetchWithdrawalRequests(); // Refresh the list
    		} catch(err) {
    			alert(err.message || 'Error submitting withdrawal request. Please try again.');
    			console.error("Error requesting withdrawal:", err);
    		}
    	}

    	onMount(fetchWithdrawalRequests);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<WithdrawalRequest> was created with unknown prop '${key}'`);
    	});

    	const click_handler = application => requestWithdrawal(application.id);

    	$$self.$capture_state = () => ({
    		onMount,
    		config,
    		withdrawalRequests,
    		loading,
    		error,
    		employeeId,
    		fetchWithdrawalRequests,
    		requestWithdrawal,
    		formatDate: formatDate$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('withdrawalRequests' in $$props) $$invalidate(0, withdrawalRequests = $$props.withdrawalRequests);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [withdrawalRequests, loading, error, requestWithdrawal, click_handler];
    }

    class WithdrawalRequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WithdrawalRequest",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* svelte-app\src\HRViewTimetable.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$3, console: console_1$5 } = globals;
    const file$e = "svelte-app\\src\\HRViewTimetable.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    // (178:8) {:else}
    function create_else_block$3(ctx) {
    	let t0;
    	let div9;
    	let div2;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let div1;
    	let svg0;
    	let path0;
    	let t5;
    	let div5;
    	let div3;
    	let p2;
    	let t7;
    	let p3;
    	let t8_value = /*officeEmployees*/ ctx[2].length + "";
    	let t8;
    	let t9;
    	let p4;
    	let t10;
    	let t11;
    	let t12;
    	let div4;
    	let svg1;
    	let path1;
    	let t13;
    	let div8;
    	let div6;
    	let p5;
    	let t15;
    	let p6;
    	let t16_value = /*remoteEmployees*/ ctx[1].length + "";
    	let t16;
    	let t17;
    	let p7;
    	let t18;
    	let t19;
    	let t20;
    	let div7;
    	let svg2;
    	let path2;
    	let t21;
    	let div10;
    	let button0;
    	let t22;
    	let button0_class_value;
    	let t23;
    	let button1;
    	let t24;
    	let button1_class_value;
    	let t25;
    	let button2;
    	let t26;
    	let button2_class_value;
    	let t27;
    	let div11;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let if_block = /*showFilters*/ ctx[13] && create_if_block_2$4(ctx);

    	let each_value = /*activeTab*/ ctx[14] === 'all'
    	? /*filteredEmployees*/ ctx[3]
    	: /*activeTab*/ ctx[14] === 'office'
    		? /*officeEmployees*/ ctx[2]
    		: /*remoteEmployees*/ ctx[1];

    	validate_each_argument(each_value);
    	const get_key = ctx => /*employee*/ ctx[36].id;
    	validate_each_keys(ctx, each_value, get_each_context$b, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$b(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$b(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Total Staff";
    			t2 = space();
    			p1 = element("p");
    			t3 = text(/*totalEmployees*/ ctx[0]);
    			t4 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p2 = element("p");
    			p2.textContent = "In Office";
    			t7 = space();
    			p3 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			p4 = element("p");
    			t10 = text(/*officePercentage*/ ctx[16]);
    			t11 = text("% of total");
    			t12 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t13 = space();
    			div8 = element("div");
    			div6 = element("div");
    			p5 = element("p");
    			p5.textContent = "Remote";
    			t15 = space();
    			p6 = element("p");
    			t16 = text(t16_value);
    			t17 = space();
    			p7 = element("p");
    			t18 = text(/*remotePercentage*/ ctx[15]);
    			t19 = text("% of total");
    			t20 = space();
    			div7 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t21 = space();
    			div10 = element("div");
    			button0 = element("button");
    			t22 = text("All Staff");
    			t23 = space();
    			button1 = element("button");
    			t24 = text("In Office");
    			t25 = space();
    			button2 = element("button");
    			t26 = text("Remote");
    			t27 = space();
    			div11 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "stat-label");
    			add_location(p0, file$e, 242, 24, 9170);
    			attr_dev(p1, "class", "stat-value");
    			add_location(p1, file$e, 243, 24, 9232);
    			add_location(div0, file$e, 241, 20, 9140);
    			attr_dev(path0, "d", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z");
    			add_location(path0, file$e, 247, 28, 9424);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$e, 246, 24, 9370);
    			attr_dev(div1, "class", "stat-icon");
    			add_location(div1, file$e, 245, 20, 9322);
    			attr_dev(div2, "class", "stat-card");
    			add_location(div2, file$e, 240, 16, 9096);
    			attr_dev(p2, "class", "stat-label");
    			add_location(p2, file$e, 254, 24, 9872);
    			attr_dev(p3, "class", "stat-value office");
    			add_location(p3, file$e, 255, 24, 9932);
    			attr_dev(p4, "class", "stat-percentage");
    			add_location(p4, file$e, 256, 24, 10014);
    			add_location(div3, file$e, 253, 20, 9842);
    			attr_dev(path1, "d", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4");
    			add_location(path1, file$e, 260, 28, 10230);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$e, 259, 24, 10176);
    			attr_dev(div4, "class", "stat-icon office");
    			add_location(div4, file$e, 258, 20, 10121);
    			attr_dev(div5, "class", "stat-card");
    			add_location(div5, file$e, 252, 16, 9798);
    			attr_dev(p5, "class", "stat-label");
    			add_location(p5, file$e, 267, 24, 10553);
    			attr_dev(p6, "class", "stat-value remote");
    			add_location(p6, file$e, 268, 24, 10610);
    			attr_dev(p7, "class", "stat-percentage");
    			add_location(p7, file$e, 269, 24, 10692);
    			add_location(div6, file$e, 266, 20, 10523);
    			attr_dev(path2, "d", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6");
    			add_location(path2, file$e, 273, 28, 10908);
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$e, 272, 24, 10854);
    			attr_dev(div7, "class", "stat-icon remote");
    			add_location(div7, file$e, 271, 20, 10799);
    			attr_dev(div8, "class", "stat-card");
    			add_location(div8, file$e, 265, 16, 10479);
    			attr_dev(div9, "class", "stats");
    			add_location(div9, file$e, 239, 12, 9060);
    			attr_dev(button0, "class", button0_class_value = "tab " + (/*activeTab*/ ctx[14] === 'all' ? 'active' : ''));
    			add_location(button0, file$e, 280, 16, 11214);
    			attr_dev(button1, "class", button1_class_value = "tab " + (/*activeTab*/ ctx[14] === 'office' ? 'active' : ''));
    			add_location(button1, file$e, 286, 16, 11438);
    			attr_dev(button2, "class", button2_class_value = "tab " + (/*activeTab*/ ctx[14] === 'remote' ? 'active' : ''));
    			add_location(button2, file$e, 292, 16, 11668);
    			attr_dev(div10, "class", "tabs");
    			add_location(div10, file$e, 279, 12, 11179);
    			attr_dev(div11, "class", "employee-grid");
    			add_location(div11, file$e, 300, 12, 11911);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t5);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p2);
    			append_dev(div3, t7);
    			append_dev(div3, p3);
    			append_dev(p3, t8);
    			append_dev(div3, t9);
    			append_dev(div3, p4);
    			append_dev(p4, t10);
    			append_dev(p4, t11);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, svg1);
    			append_dev(svg1, path1);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, p5);
    			append_dev(div6, t15);
    			append_dev(div6, p6);
    			append_dev(p6, t16);
    			append_dev(div6, t17);
    			append_dev(div6, p7);
    			append_dev(p7, t18);
    			append_dev(p7, t19);
    			append_dev(div8, t20);
    			append_dev(div8, div7);
    			append_dev(div7, svg2);
    			append_dev(svg2, path2);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, button0);
    			append_dev(button0, t22);
    			append_dev(div10, t23);
    			append_dev(div10, button1);
    			append_dev(button1, t24);
    			append_dev(div10, t25);
    			append_dev(div10, button2);
    			append_dev(button2, t26);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, div11, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div11, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[26], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[27], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[28], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*showFilters*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$4(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*totalEmployees*/ 1) set_data_dev(t3, /*totalEmployees*/ ctx[0]);
    			if (dirty[0] & /*officeEmployees*/ 4 && t8_value !== (t8_value = /*officeEmployees*/ ctx[2].length + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*officePercentage*/ 65536) set_data_dev(t10, /*officePercentage*/ ctx[16]);
    			if (dirty[0] & /*remoteEmployees*/ 2 && t16_value !== (t16_value = /*remoteEmployees*/ ctx[1].length + "")) set_data_dev(t16, t16_value);
    			if (dirty[0] & /*remotePercentage*/ 32768) set_data_dev(t18, /*remotePercentage*/ ctx[15]);

    			if (dirty[0] & /*activeTab*/ 16384 && button0_class_value !== (button0_class_value = "tab " + (/*activeTab*/ ctx[14] === 'all' ? 'active' : ''))) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty[0] & /*activeTab*/ 16384 && button1_class_value !== (button1_class_value = "tab " + (/*activeTab*/ ctx[14] === 'office' ? 'active' : ''))) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty[0] & /*activeTab*/ 16384 && button2_class_value !== (button2_class_value = "tab " + (/*activeTab*/ ctx[14] === 'remote' ? 'active' : ''))) {
    				attr_dev(button2, "class", button2_class_value);
    			}

    			if (dirty[0] & /*updateEmployeeStatus, activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 278542) {
    				each_value = /*activeTab*/ ctx[14] === 'all'
    				? /*filteredEmployees*/ ctx[3]
    				: /*activeTab*/ ctx[14] === 'office'
    					? /*officeEmployees*/ ctx[2]
    					: /*remoteEmployees*/ ctx[1];

    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$b, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div11, destroy_block, create_each_block$b, null, get_each_context$b);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(div11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(178:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (171:24) 
    function create_if_block_1$4(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let p;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*error*/ ctx[12]);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file$e, 173, 20, 5743);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$e, 172, 16, 5684);
    			add_location(p, file$e, 175, 16, 5909);
    			attr_dev(div, "class", "error");
    			add_location(div, file$e, 171, 12, 5648);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*error*/ 4096) set_data_dev(t1, /*error*/ ctx[12]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(171:24) ",
    		ctx
    	});

    	return block;
    }

    // (166:8) {#if loading}
    function create_if_block$6(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Loading data...";
    			attr_dev(div0, "class", "spinner");
    			add_location(div0, file$e, 167, 16, 5525);
    			add_location(p, file$e, 168, 16, 5569);
    			attr_dev(div1, "class", "loading");
    			add_location(div1, file$e, 166, 12, 5487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(166:8) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (179:12) {#if showFilters}
    function create_if_block_2$4(ctx) {
    	let div6;
    	let div5;
    	let div1;
    	let label0;
    	let t1;
    	let div0;
    	let input;
    	let t2;
    	let svg;
    	let path;
    	let t3;
    	let div2;
    	let label1;
    	let t5;
    	let select0;
    	let option0;
    	let t7;
    	let div3;
    	let label2;
    	let t9;
    	let select1;
    	let option1;
    	let option2;
    	let option3;
    	let t13;
    	let div4;
    	let label3;
    	let t15;
    	let select2;
    	let option4;
    	let option5;
    	let t18;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*departments*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let if_block = /*selectedDateRange*/ ctx[8] === 'custom' && create_if_block_3$4(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Search Staff";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Department";
    			t5 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "All Departments";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Status";
    			t9 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "All Statuses";
    			option2 = element("option");
    			option2.textContent = "In Office";
    			option3 = element("option");
    			option3.textContent = "Remote";
    			t13 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Date Range";
    			t15 = space();
    			select2 = element("select");
    			option4 = element("option");
    			option4.textContent = "Today";
    			option5 = element("option");
    			option5.textContent = "Custom Range";
    			t18 = space();
    			if (if_block) if_block.c();
    			attr_dev(label0, "for", "search-staff");
    			add_location(label0, file$e, 182, 28, 6151);
    			attr_dev(input, "id", "search-staff");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Name or department...");
    			add_location(input, file$e, 184, 32, 6285);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
    			add_location(path, file$e, 191, 36, 6669);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$e, 190, 32, 6594);
    			attr_dev(div0, "class", "search-input");
    			add_location(div0, file$e, 183, 28, 6226);
    			attr_dev(div1, "class", "filter-item");
    			add_location(div1, file$e, 181, 24, 6097);
    			attr_dev(label1, "for", "department-filter");
    			add_location(label1, file$e, 197, 28, 6974);
    			option0.__value = "All";
    			option0.value = option0.__value;
    			add_location(option0, file$e, 199, 32, 7148);
    			attr_dev(select0, "id", "department-filter");
    			if (/*selectedDepartment*/ ctx[6] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[21].call(select0));
    			add_location(select0, file$e, 198, 28, 7052);
    			attr_dev(div2, "class", "filter-item");
    			add_location(div2, file$e, 196, 24, 6920);
    			attr_dev(label2, "for", "status-filter");
    			add_location(label2, file$e, 207, 28, 7514);
    			option1.__value = "All";
    			option1.value = option1.__value;
    			add_location(option1, file$e, 209, 32, 7672);
    			option2.__value = "office";
    			option2.value = option2.__value;
    			add_location(option2, file$e, 210, 32, 7746);
    			option3.__value = "remote";
    			option3.value = option3.__value;
    			add_location(option3, file$e, 211, 32, 7820);
    			attr_dev(select1, "id", "status-filter");
    			if (/*selectedStatus*/ ctx[7] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[22].call(select1));
    			add_location(select1, file$e, 208, 28, 7584);
    			attr_dev(div3, "class", "filter-item");
    			add_location(div3, file$e, 206, 24, 7460);
    			attr_dev(label3, "for", "date-range-filter");
    			add_location(label3, file$e, 216, 28, 8007);
    			option4.__value = "today";
    			option4.value = option4.__value;
    			add_location(option4, file$e, 218, 32, 8180);
    			option5.__value = "custom";
    			option5.value = option5.__value;
    			add_location(option5, file$e, 219, 32, 8249);
    			attr_dev(select2, "id", "date-range-filter");
    			if (/*selectedDateRange*/ ctx[8] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[23].call(select2));
    			add_location(select2, file$e, 217, 28, 8085);
    			attr_dev(div4, "class", "filter-item");
    			add_location(div4, file$e, 215, 24, 7953);
    			attr_dev(div5, "class", "filter-grid");
    			add_location(div5, file$e, 180, 20, 6047);
    			attr_dev(div6, "class", "filters");
    			add_location(div6, file$e, 179, 16, 6005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*searchQuery*/ ctx[5]);
    			append_dev(div0, t2);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t5);
    			append_dev(div2, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select0, null);
    				}
    			}

    			select_option(select0, /*selectedDepartment*/ ctx[6], true);
    			append_dev(div5, t7);
    			append_dev(div5, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t9);
    			append_dev(div3, select1);
    			append_dev(select1, option1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			select_option(select1, /*selectedStatus*/ ctx[7], true);
    			append_dev(div5, t13);
    			append_dev(div5, div4);
    			append_dev(div4, label3);
    			append_dev(div4, t15);
    			append_dev(div4, select2);
    			append_dev(select2, option4);
    			append_dev(select2, option5);
    			select_option(select2, /*selectedDateRange*/ ctx[8], true);
    			append_dev(div4, t18);
    			if (if_block) if_block.m(div4, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[20]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[21]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[22]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[23])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchQuery*/ 32 && input.value !== /*searchQuery*/ ctx[5]) {
    				set_input_value(input, /*searchQuery*/ ctx[5]);
    			}

    			if (dirty[0] & /*departments*/ 16) {
    				each_value_1 = /*departments*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*selectedDepartment, departments*/ 80) {
    				select_option(select0, /*selectedDepartment*/ ctx[6]);
    			}

    			if (dirty[0] & /*selectedStatus*/ 128) {
    				select_option(select1, /*selectedStatus*/ ctx[7]);
    			}

    			if (dirty[0] & /*selectedDateRange*/ 256) {
    				select_option(select2, /*selectedDateRange*/ ctx[8]);
    			}

    			if (/*selectedDateRange*/ ctx[8] === 'custom') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$4(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(179:12) {#if showFilters}",
    		ctx
    	});

    	return block;
    }

    // (201:32) {#each departments as dept}
    function create_each_block_1$2(ctx) {
    	let option;
    	let t_value = /*dept*/ ctx[39] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*dept*/ ctx[39];
    			option.value = option.__value;
    			add_location(option, file$e, 201, 36, 7289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*departments*/ 16 && t_value !== (t_value = /*dept*/ ctx[39] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*departments*/ 16 && option_value_value !== (option_value_value = /*dept*/ ctx[39])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(201:32) {#each departments as dept}",
    		ctx
    	});

    	return block;
    }

    // (223:28) {#if selectedDateRange === 'custom'}
    function create_if_block_3$4(ctx) {
    	let div;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "date");
    			add_location(input0, file$e, 224, 36, 8519);
    			attr_dev(input1, "type", "date");
    			add_location(input1, file$e, 228, 36, 8716);
    			attr_dev(div, "class", "date-range");
    			add_location(div, file$e, 223, 32, 8458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*startDate*/ ctx[9]);
    			append_dev(div, t);
    			append_dev(div, input1);
    			set_input_value(input1, /*endDate*/ ctx[10]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[24]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[25])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*startDate*/ 512) {
    				set_input_value(input0, /*startDate*/ ctx[9]);
    			}

    			if (dirty[0] & /*endDate*/ 1024) {
    				set_input_value(input1, /*endDate*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(223:28) {#if selectedDateRange === 'custom'}",
    		ctx
    	});

    	return block;
    }

    // (302:16) {#each activeTab === 'all' ? filteredEmployees :                         activeTab === 'office' ? officeEmployees :                         remoteEmployees as employee (employee.id)}
    function create_each_block$b(key_1, ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let p0;
    	let t0_value = /*employee*/ ctx[36].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*employee*/ ctx[36].department + "";
    	let t2;
    	let t3;
    	let t4_value = /*employee*/ ctx[36].team + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6_value = /*employee*/ ctx[36].email + "";
    	let t6;
    	let t7;
    	let div0;
    	let span;
    	let t8_value = /*employee*/ ctx[36].status + "";
    	let t8;
    	let span_class_value;
    	let t9;
    	let button;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[29](/*employee*/ ctx[36]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = text(" • ");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div0 = element("div");
    			span = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			button = element("button");
    			button.textContent = "Toggle Status";
    			t11 = space();
    			attr_dev(p0, "class", "employee-name");
    			add_location(p0, file$e, 307, 32, 12329);
    			attr_dev(p1, "class", "employee-dept");
    			add_location(p1, file$e, 308, 32, 12406);
    			attr_dev(p2, "class", "employee-email");
    			add_location(p2, file$e, 309, 32, 12507);
    			attr_dev(span, "class", span_class_value = "status-badge " + /*employee*/ ctx[36].status + " svelte-ef8ckv");
    			add_location(span, file$e, 311, 36, 12651);
    			attr_dev(button, "class", "status-toggle svelte-ef8ckv");
    			add_location(button, file$e, 314, 36, 12835);
    			attr_dev(div0, "class", "status-wrapper svelte-ef8ckv");
    			add_location(div0, file$e, 310, 32, 12586);
    			attr_dev(div1, "class", "employee-details");
    			add_location(div1, file$e, 306, 28, 12266);
    			attr_dev(div2, "class", "employee-info");
    			add_location(div2, file$e, 305, 24, 12210);
    			attr_dev(div3, "class", "employee-card");
    			add_location(div3, file$e, 304, 20, 12158);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(p2, t6);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t8);
    			append_dev(div0, t9);
    			append_dev(div0, button);
    			append_dev(div3, t11);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_3, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && t0_value !== (t0_value = /*employee*/ ctx[36].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && t2_value !== (t2_value = /*employee*/ ctx[36].department + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && t4_value !== (t4_value = /*employee*/ ctx[36].team + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && t6_value !== (t6_value = /*employee*/ ctx[36].email + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && t8_value !== (t8_value = /*employee*/ ctx[36].status + "")) set_data_dev(t8, t8_value);

    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16398 && span_class_value !== (span_class_value = "status-badge " + /*employee*/ ctx[36].status + " svelte-ef8ckv")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(302:16) {#each activeTab === 'all' ? filteredEmployees :                         activeTab === 'office' ? officeEmployees :                         remoteEmployees as employee (employee.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let button;
    	let svg;
    	let path;
    	let t4;

    	let t5_value = (/*showFilters*/ ctx[13]
    	? 'Hide Filters'
    	: 'Show Filters') + "";

    	let t5;
    	let t6;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[11]) return create_if_block$6;
    		if (/*error*/ ctx[12]) return create_if_block_1$4;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Staff Schedule Dashboard";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Manage and track employee work locations";
    			t3 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t4 = space();
    			t5 = text(t5_value);
    			t6 = space();
    			if_block.c();
    			add_location(h1, file$e, 154, 16, 4855);
    			add_location(p, file$e, 155, 16, 4905);
    			attr_dev(div0, "class", "header-text");
    			add_location(div0, file$e, 153, 12, 4813);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4");
    			add_location(path, file$e, 159, 20, 5115);
    			attr_dev(svg, "class", "icon");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$e, 158, 16, 5056);
    			attr_dev(button, "class", "filter-toggle");
    			add_location(button, file$e, 157, 12, 4984);
    			attr_dev(div1, "class", "header");
    			add_location(div1, file$e, 152, 8, 4780);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$e, 151, 4, 4748);
    			attr_dev(main, "class", "dashboard");
    			add_location(main, file$e, 150, 0, 4719);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div1, t3);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(button, t4);
    			append_dev(button, t5);
    			append_dev(div2, t6);
    			if_block.m(div2, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleFilters*/ ctx[17], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*showFilters*/ 8192 && t5_value !== (t5_value = (/*showFilters*/ ctx[13]
    			? 'Hide Filters'
    			: 'Show Filters') + "")) set_data_dev(t5, t5_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function filterEmployees(employees, filters) {
    	return employees.filter(employee => {
    		// Department filter
    		if (filters.department && filters.department !== 'All' && employee.department !== filters.department) {
    			return false;
    		}

    		// Status filter
    		if (filters.status && filters.status !== 'All' && employee.status !== filters.status.toLowerCase()) {
    			return false;
    		}

    		// Search filter
    		if (filters.search) {
    			const searchTerm = filters.search.toLowerCase();

    			const searchFields = [
    				employee.id,
    				employee.name,
    				employee.department,
    				employee.email,
    				employee.country,
    				employee.position
    			];

    			return searchFields.some(field => String(field).toLowerCase().includes(searchTerm));
    		}

    		return true;
    	});
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let filteredEmployees;
    	let officeEmployees;
    	let remoteEmployees;
    	let totalEmployees;
    	let officePercentage;
    	let remotePercentage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HRViewTimetable', slots, []);
    	let departments = [];
    	let allEmployees = []; // Store all employees
    	let showDetailModal = false;
    	let selectedEmployee = null;
    	let searchQuery = '';
    	let selectedDepartment = 'All';
    	let selectedStatus = 'All';
    	let selectedDateRange = 'today';
    	let startDate = '';
    	let endDate = '';
    	let loading = true;
    	let error = null;
    	let isRequestInProgress = false;
    	let showFilters = true;
    	let activeTab = 'all';
    	const API_BASE_URL = config.base_url || 'http://localhost:5000';

    	function getFilterState() {
    		return {
    			department: selectedDepartment,
    			status: selectedStatus,
    			search: searchQuery,
    			dateRange: selectedDateRange,
    			startDate,
    			endDate
    		};
    	}

    	async function fetchInitialData() {
    		if (isRequestInProgress) return;

    		try {
    			isRequestInProgress = true;
    			$$invalidate(11, loading = true);

    			// Fetch all data at once
    			const [deptResponse, empResponse] = await Promise.all([fetch(`${API_BASE_URL}/departments`), fetch(`${API_BASE_URL}/employees`)]);

    			if (!deptResponse.ok || !empResponse.ok) {
    				throw new Error('Failed to fetch initial data');
    			}

    			const deptData = await deptResponse.json();
    			const empData = await empResponse.json();
    			$$invalidate(4, departments = deptData.departments);
    			$$invalidate(19, allEmployees = empData.employees);
    			$$invalidate(12, error = null);
    		} catch(err) {
    			console.error('Error fetching initial data:', err);
    			$$invalidate(12, error = err.message || 'Failed to load data');
    			$$invalidate(4, departments = []);
    			$$invalidate(19, allEmployees = []);
    		} finally {
    			$$invalidate(11, loading = false);
    			isRequestInProgress = false;
    		}
    	}

    	function toggleFilters() {
    		$$invalidate(13, showFilters = !showFilters);
    	}

    	async function updateEmployeeStatus(employeeId, newStatus) {
    		try {
    			const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/status`, {
    				method: 'PUT',
    				headers: { 'Content-Type': 'application/json' },
    				body: JSON.stringify({ status: newStatus })
    			});

    			if (!response.ok) {
    				throw new Error('Failed to update status');
    			}

    			// Refresh employee data after status update
    			await fetchInitialData();
    		} catch(err) {
    			console.error('Error updating status:', err);
    			$$invalidate(12, error = err.message);
    		}
    	}

    	onMount(async () => {
    		await fetchInitialData();
    	});

    	onDestroy(() => {
    		
    	}); // Cleanup if needed

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<HRViewTimetable> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(5, searchQuery);
    	}

    	function select0_change_handler() {
    		selectedDepartment = select_value(this);
    		$$invalidate(6, selectedDepartment);
    		$$invalidate(4, departments);
    	}

    	function select1_change_handler() {
    		selectedStatus = select_value(this);
    		$$invalidate(7, selectedStatus);
    	}

    	function select2_change_handler() {
    		selectedDateRange = select_value(this);
    		$$invalidate(8, selectedDateRange);
    	}

    	function input0_input_handler() {
    		startDate = this.value;
    		$$invalidate(9, startDate);
    	}

    	function input1_input_handler() {
    		endDate = this.value;
    		$$invalidate(10, endDate);
    	}

    	const click_handler = () => $$invalidate(14, activeTab = 'all');
    	const click_handler_1 = () => $$invalidate(14, activeTab = 'office');
    	const click_handler_2 = () => $$invalidate(14, activeTab = 'remote');
    	const click_handler_3 = employee => updateEmployeeStatus(employee.id, employee.status === 'office' ? 'remote' : 'office');

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		config,
    		departments,
    		allEmployees,
    		showDetailModal,
    		selectedEmployee,
    		searchQuery,
    		selectedDepartment,
    		selectedStatus,
    		selectedDateRange,
    		startDate,
    		endDate,
    		loading,
    		error,
    		isRequestInProgress,
    		showFilters,
    		activeTab,
    		API_BASE_URL,
    		getFilterState,
    		filterEmployees,
    		fetchInitialData,
    		toggleFilters,
    		updateEmployeeStatus,
    		totalEmployees,
    		remoteEmployees,
    		remotePercentage,
    		officeEmployees,
    		officePercentage,
    		filteredEmployees
    	});

    	$$self.$inject_state = $$props => {
    		if ('departments' in $$props) $$invalidate(4, departments = $$props.departments);
    		if ('allEmployees' in $$props) $$invalidate(19, allEmployees = $$props.allEmployees);
    		if ('showDetailModal' in $$props) showDetailModal = $$props.showDetailModal;
    		if ('selectedEmployee' in $$props) selectedEmployee = $$props.selectedEmployee;
    		if ('searchQuery' in $$props) $$invalidate(5, searchQuery = $$props.searchQuery);
    		if ('selectedDepartment' in $$props) $$invalidate(6, selectedDepartment = $$props.selectedDepartment);
    		if ('selectedStatus' in $$props) $$invalidate(7, selectedStatus = $$props.selectedStatus);
    		if ('selectedDateRange' in $$props) $$invalidate(8, selectedDateRange = $$props.selectedDateRange);
    		if ('startDate' in $$props) $$invalidate(9, startDate = $$props.startDate);
    		if ('endDate' in $$props) $$invalidate(10, endDate = $$props.endDate);
    		if ('loading' in $$props) $$invalidate(11, loading = $$props.loading);
    		if ('error' in $$props) $$invalidate(12, error = $$props.error);
    		if ('isRequestInProgress' in $$props) isRequestInProgress = $$props.isRequestInProgress;
    		if ('showFilters' in $$props) $$invalidate(13, showFilters = $$props.showFilters);
    		if ('activeTab' in $$props) $$invalidate(14, activeTab = $$props.activeTab);
    		if ('totalEmployees' in $$props) $$invalidate(0, totalEmployees = $$props.totalEmployees);
    		if ('remoteEmployees' in $$props) $$invalidate(1, remoteEmployees = $$props.remoteEmployees);
    		if ('remotePercentage' in $$props) $$invalidate(15, remotePercentage = $$props.remotePercentage);
    		if ('officeEmployees' in $$props) $$invalidate(2, officeEmployees = $$props.officeEmployees);
    		if ('officePercentage' in $$props) $$invalidate(16, officePercentage = $$props.officePercentage);
    		if ('filteredEmployees' in $$props) $$invalidate(3, filteredEmployees = $$props.filteredEmployees);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*allEmployees*/ 524288) {
    			// Computed properties using filtered data
    			$$invalidate(3, filteredEmployees = allEmployees.length
    			? filterEmployees(allEmployees, getFilterState())
    			: []);
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 8) {
    			$$invalidate(2, officeEmployees = filteredEmployees.filter(emp => emp.status === 'office'));
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 8) {
    			$$invalidate(1, remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote'));
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 8) {
    			$$invalidate(0, totalEmployees = filteredEmployees.length);
    		}

    		if ($$self.$$.dirty[0] & /*totalEmployees, officeEmployees*/ 5) {
    			$$invalidate(16, officePercentage = totalEmployees
    			? (officeEmployees.length / totalEmployees * 100).toFixed(1)
    			: 0);
    		}

    		if ($$self.$$.dirty[0] & /*totalEmployees, remoteEmployees*/ 3) {
    			$$invalidate(15, remotePercentage = totalEmployees
    			? (remoteEmployees.length / totalEmployees * 100).toFixed(1)
    			: 0);
    		}
    	};

    	return [
    		totalEmployees,
    		remoteEmployees,
    		officeEmployees,
    		filteredEmployees,
    		departments,
    		searchQuery,
    		selectedDepartment,
    		selectedStatus,
    		selectedDateRange,
    		startDate,
    		endDate,
    		loading,
    		error,
    		showFilters,
    		activeTab,
    		remotePercentage,
    		officePercentage,
    		toggleFilters,
    		updateEmployeeStatus,
    		allEmployees,
    		input_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class HRViewTimetable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HRViewTimetable",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const jwtToken$1 = writable(localStorage.getItem('jwt') || '');
    const userClaims$1 = writable({});

    // Function to decode the JWT and extract claims
    function decodeJWT$1(token) {
        if (!token) return {};

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    }

    // Initialize claims if token exists
    userClaims$1.set(decodeJWT$1(localStorage.getItem('jwt')) || {});

    // Subscribe to jwtToken updates to store it and update claims
    jwtToken$1.subscribe((token) => {
        if (token) {
            localStorage.setItem('jwt', token);
            userClaims$1.set(decodeJWT$1(token)); // Update claims
            console.log("Token added");
            console.log(userClaims$1);
        } else {
            localStorage.removeItem('jwt');
            userClaims$1.set({});
            console.log("Token removed");
        }
    });

    /* svelte-app\src\Login.svelte generated by Svelte v3.59.2 */

    const { console: console_1$4 } = globals;
    const file$d = "svelte-app\\src\\Login.svelte";

    function create_fragment$f(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let form;
    	let h1;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let button;
    	let t7;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Log in";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Email:\r\n          ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Password:\r\n          ");
    			input1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Log in";
    			t7 = space();
    			div0 = element("div");
    			add_location(h1, file$d, 41, 8, 1236);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Input your email");
    			input0.required = true;
    			attr_dev(input0, "class", "svelte-h26j68");
    			add_location(input0, file$d, 44, 10, 1317);
    			attr_dev(label0, "class", "text-field svelte-h26j68");
    			add_location(label0, file$d, 42, 8, 1261);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Input your password");
    			input1.required = true;
    			attr_dev(input1, "class", "svelte-h26j68");
    			add_location(input1, file$d, 48, 10, 1485);
    			attr_dev(label1, "class", "text-field svelte-h26j68");
    			add_location(label1, file$d, 46, 8, 1426);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-h26j68");
    			add_location(button, file$d, 50, 8, 1603);
    			attr_dev(form, "class", "svelte-h26j68");
    			add_location(form, file$d, 40, 6, 1195);
    			attr_dev(div0, "class", "form-splash svelte-h26j68");
    			add_location(div0, file$d, 52, 6, 1663);
    			attr_dev(div1, "class", "form-container svelte-h26j68");
    			add_location(div1, file$d, 39, 4, 1159);
    			attr_dev(div2, "class", "page-container svelte-h26j68");
    			add_location(div2, file$d, 38, 2, 1125);
    			attr_dev(div3, "class", "hide-overflow svelte-h26j68");
    			add_location(div3, file$d, 37, 0, 1094);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, form);
    			append_dev(form, h1);
    			append_dev(form, t1);
    			append_dev(form, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, button);
    			append_dev(div1, t7);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(form, "submit", /*handleSubmit*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const dispatch = createEventDispatcher();
    	let email = '';
    	let password = '';

    	const loginUser = async () => {
    		try {
    			const response = await fetch(`${config.base_url}/login`, {
    				method: 'POST',
    				headers: { 'Content-Type': 'application/json' },
    				body: JSON.stringify({ email, password })
    			});

    			const data = await response.json();
    			return data;
    		} catch(error) {
    			console.error('Error logging in:', error);
    			return null;
    		}
    	};

    	const handleSubmit = async e => {
    		// jwtToken.set('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    		e.preventDefault();

    		const token = await loginUser();

    		if (token) {
    			console.log(token);
    			jwtToken$1.set(token); // Save JWT token in the store
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		config,
    		jwtToken: jwtToken$1,
    		dispatch,
    		email,
    		password,
    		loginUser,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, password, handleSubmit, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* svelte-app\src\ManagerTimetable.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$2, console: console_1$3 } = globals;
    const file$c = "svelte-app\\src\\ManagerTimetable.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    // (159:0) {:else}
    function create_else_block$2(ctx) {
    	let main;
    	let div3;
    	let div2;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let t4_value = (/*currentUser*/ ctx[17]?.name || 'Manager') + "";
    	let t4;
    	let t5;
    	let p1;
    	let t7;
    	let div1;
    	let button;
    	let svg;
    	let path;
    	let t8;

    	let t9_value = (/*showFilters*/ ctx[13]
    	? 'Hide Filters'
    	: 'Show Filters') + "";

    	let t9;
    	let t10;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*loading*/ ctx[10]) return create_if_block_1$3;
    		if (/*error*/ ctx[11]) return create_if_block_2$3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*currentDepartment*/ ctx[12]);
    			t1 = text(" Department Dashboard");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("Welcome, ");
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Manage and track employee work locations";
    			t7 = space();
    			div1 = element("div");
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			if_block.c();
    			attr_dev(h1, "class", "svelte-fdm2zy");
    			add_location(h1, file$c, 163, 20, 4952);
    			attr_dev(p0, "class", "svelte-fdm2zy");
    			add_location(p0, file$c, 164, 20, 5022);
    			attr_dev(p1, "class", "subtitle svelte-fdm2zy");
    			add_location(p1, file$c, 165, 20, 5091);
    			attr_dev(div0, "class", "header-text svelte-fdm2zy");
    			add_location(div0, file$c, 162, 16, 4906);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4");
    			add_location(path, file$c, 170, 28, 5391);
    			attr_dev(svg, "class", "icon svelte-fdm2zy");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$c, 169, 24, 5324);
    			attr_dev(button, "class", "filter-toggle svelte-fdm2zy");
    			add_location(button, file$c, 168, 20, 5244);
    			attr_dev(div1, "class", "header-actions svelte-fdm2zy");
    			add_location(div1, file$c, 167, 16, 5195);
    			attr_dev(div2, "class", "header svelte-fdm2zy");
    			add_location(div2, file$c, 161, 12, 4869);
    			attr_dev(div3, "class", "container svelte-fdm2zy");
    			add_location(div3, file$c, 160, 8, 4833);
    			attr_dev(main, "class", "dashboard svelte-fdm2zy");
    			add_location(main, file$c, 159, 4, 4800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(button, t8);
    			append_dev(button, t9);
    			append_dev(div3, t10);
    			if_block.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleFilters*/ ctx[19], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentDepartment*/ 4096) set_data_dev(t0, /*currentDepartment*/ ctx[12]);
    			if (dirty[0] & /*currentUser*/ 131072 && t4_value !== (t4_value = (/*currentUser*/ ctx[17]?.name || 'Manager') + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*showFilters*/ 8192 && t9_value !== (t9_value = (/*showFilters*/ ctx[13]
    			? 'Hide Filters'
    			: 'Show Filters') + "")) set_data_dev(t9, t9_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(159:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (157:0) {#if !isAuthenticated}
    function create_if_block$5(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(157:0) {#if !isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (190:12) {:else}
    function create_else_block_1(ctx) {
    	let t0;
    	let div9;
    	let div2;
    	let div0;
    	let p0;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let div1;
    	let svg0;
    	let path0;
    	let t5;
    	let div5;
    	let div3;
    	let p2;
    	let t7;
    	let p3;
    	let t8_value = /*officeEmployees*/ ctx[6].length + "";
    	let t8;
    	let t9;
    	let p4;
    	let t10;
    	let t11;
    	let t12;
    	let div4;
    	let svg1;
    	let path1;
    	let t13;
    	let div8;
    	let div6;
    	let p5;
    	let t15;
    	let p6;
    	let t16_value = /*remoteEmployees*/ ctx[5].length + "";
    	let t16;
    	let t17;
    	let p7;
    	let t18;
    	let t19;
    	let t20;
    	let div7;
    	let svg2;
    	let path2;
    	let t21;
    	let div10;
    	let button0;
    	let t22;
    	let button0_class_value;
    	let t23;
    	let button1;
    	let t24;
    	let button1_class_value;
    	let t25;
    	let button2;
    	let t26;
    	let button2_class_value;
    	let t27;
    	let div11;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let if_block = /*showFilters*/ ctx[13] && create_if_block_3$3(ctx);

    	let each_value = /*activeTab*/ ctx[14] === 'all'
    	? /*filteredEmployees*/ ctx[7]
    	: /*activeTab*/ ctx[14] === 'office'
    		? /*officeEmployees*/ ctx[6]
    		: /*remoteEmployees*/ ctx[5];

    	validate_each_argument(each_value);
    	const get_key = ctx => /*employee*/ ctx[38].id;
    	validate_each_keys(ctx, each_value, get_each_context$a, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$a(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$a(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Total Staff";
    			t2 = space();
    			p1 = element("p");
    			t3 = text(/*totalEmployees*/ ctx[4]);
    			t4 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p2 = element("p");
    			p2.textContent = "In Office";
    			t7 = space();
    			p3 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			p4 = element("p");
    			t10 = text(/*officePercentage*/ ctx[16]);
    			t11 = text("% of total");
    			t12 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t13 = space();
    			div8 = element("div");
    			div6 = element("div");
    			p5 = element("p");
    			p5.textContent = "Remote";
    			t15 = space();
    			p6 = element("p");
    			t16 = text(t16_value);
    			t17 = space();
    			p7 = element("p");
    			t18 = text(/*remotePercentage*/ ctx[15]);
    			t19 = text("% of total");
    			t20 = space();
    			div7 = element("div");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t21 = space();
    			div10 = element("div");
    			button0 = element("button");
    			t22 = text("All Staff");
    			t23 = space();
    			button1 = element("button");
    			t24 = text("In Office");
    			t25 = space();
    			button2 = element("button");
    			t26 = text("Remote");
    			t27 = space();
    			div11 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "stat-label");
    			add_location(p0, file$c, 244, 28, 9220);
    			attr_dev(p1, "class", "stat-value");
    			add_location(p1, file$c, 245, 28, 9286);
    			add_location(div0, file$c, 243, 24, 9186);
    			attr_dev(path0, "d", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z");
    			add_location(path0, file$c, 249, 32, 9494);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$c, 248, 28, 9436);
    			attr_dev(div1, "class", "stat-icon");
    			add_location(div1, file$c, 247, 24, 9384);
    			attr_dev(div2, "class", "stat-card");
    			add_location(div2, file$c, 242, 20, 9138);
    			attr_dev(p2, "class", "stat-label");
    			add_location(p2, file$c, 256, 28, 9966);
    			attr_dev(p3, "class", "stat-value office");
    			add_location(p3, file$c, 257, 28, 10030);
    			attr_dev(p4, "class", "stat-percentage");
    			add_location(p4, file$c, 258, 28, 10116);
    			add_location(div3, file$c, 255, 24, 9932);
    			attr_dev(path1, "d", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4");
    			add_location(path1, file$c, 262, 32, 10348);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$c, 261, 28, 10290);
    			attr_dev(div4, "class", "stat-icon office");
    			add_location(div4, file$c, 260, 24, 10231);
    			attr_dev(div5, "class", "stat-card");
    			add_location(div5, file$c, 254, 20, 9884);
    			attr_dev(p5, "class", "stat-label");
    			add_location(p5, file$c, 269, 28, 10695);
    			attr_dev(p6, "class", "stat-value remote");
    			add_location(p6, file$c, 270, 28, 10756);
    			attr_dev(p7, "class", "stat-percentage");
    			add_location(p7, file$c, 271, 28, 10842);
    			add_location(div6, file$c, 268, 24, 10661);
    			attr_dev(path2, "d", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6");
    			add_location(path2, file$c, 275, 32, 11074);
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$c, 274, 28, 11016);
    			attr_dev(div7, "class", "stat-icon remote");
    			add_location(div7, file$c, 273, 24, 10957);
    			attr_dev(div8, "class", "stat-card");
    			add_location(div8, file$c, 267, 20, 10613);
    			attr_dev(div9, "class", "stats svelte-fdm2zy");
    			add_location(div9, file$c, 241, 16, 9098);
    			attr_dev(button0, "class", button0_class_value = "tab " + (/*activeTab*/ ctx[14] === 'all' ? 'active' : '') + " svelte-fdm2zy");
    			add_location(button0, file$c, 282, 20, 11404);
    			attr_dev(button1, "class", button1_class_value = "tab " + (/*activeTab*/ ctx[14] === 'office' ? 'active' : '') + " svelte-fdm2zy");
    			add_location(button1, file$c, 288, 20, 11652);
    			attr_dev(button2, "class", button2_class_value = "tab " + (/*activeTab*/ ctx[14] === 'remote' ? 'active' : '') + " svelte-fdm2zy");
    			add_location(button2, file$c, 294, 20, 11906);
    			attr_dev(div10, "class", "tabs svelte-fdm2zy");
    			add_location(div10, file$c, 281, 16, 11365);
    			attr_dev(div11, "class", "employee-grid svelte-fdm2zy");
    			add_location(div11, file$c, 302, 16, 12177);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(div9, t5);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p2);
    			append_dev(div3, t7);
    			append_dev(div3, p3);
    			append_dev(p3, t8);
    			append_dev(div3, t9);
    			append_dev(div3, p4);
    			append_dev(p4, t10);
    			append_dev(p4, t11);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, svg1);
    			append_dev(svg1, path1);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, p5);
    			append_dev(div6, t15);
    			append_dev(div6, p6);
    			append_dev(p6, t16);
    			append_dev(div6, t17);
    			append_dev(div6, p7);
    			append_dev(p7, t18);
    			append_dev(p7, t19);
    			append_dev(div8, t20);
    			append_dev(div8, div7);
    			append_dev(div7, svg2);
    			append_dev(svg2, path2);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, button0);
    			append_dev(button0, t22);
    			append_dev(div10, t23);
    			append_dev(div10, button1);
    			append_dev(button1, t24);
    			append_dev(div10, t25);
    			append_dev(div10, button2);
    			append_dev(button2, t26);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, div11, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div11, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[28], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[29], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[30], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*showFilters*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$3(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*totalEmployees*/ 16) set_data_dev(t3, /*totalEmployees*/ ctx[4]);
    			if (dirty[0] & /*officeEmployees*/ 64 && t8_value !== (t8_value = /*officeEmployees*/ ctx[6].length + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*officePercentage*/ 65536) set_data_dev(t10, /*officePercentage*/ ctx[16]);
    			if (dirty[0] & /*remoteEmployees*/ 32 && t16_value !== (t16_value = /*remoteEmployees*/ ctx[5].length + "")) set_data_dev(t16, t16_value);
    			if (dirty[0] & /*remotePercentage*/ 32768) set_data_dev(t18, /*remotePercentage*/ ctx[15]);

    			if (dirty[0] & /*activeTab*/ 16384 && button0_class_value !== (button0_class_value = "tab " + (/*activeTab*/ ctx[14] === 'all' ? 'active' : '') + " svelte-fdm2zy")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty[0] & /*activeTab*/ 16384 && button1_class_value !== (button1_class_value = "tab " + (/*activeTab*/ ctx[14] === 'office' ? 'active' : '') + " svelte-fdm2zy")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty[0] & /*activeTab*/ 16384 && button2_class_value !== (button2_class_value = "tab " + (/*activeTab*/ ctx[14] === 'remote' ? 'active' : '') + " svelte-fdm2zy")) {
    				attr_dev(button2, "class", button2_class_value);
    			}

    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees, updateEmployeeStatus*/ 278752) {
    				each_value = /*activeTab*/ ctx[14] === 'all'
    				? /*filteredEmployees*/ ctx[7]
    				: /*activeTab*/ ctx[14] === 'office'
    					? /*officeEmployees*/ ctx[6]
    					: /*remoteEmployees*/ ctx[5];

    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$a, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div11, destroy_block, create_each_block$a, null, get_each_context$a);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(div11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(190:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (183:28) 
    function create_if_block_2$3(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let p;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*error*/ ctx[11]);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file$c, 185, 24, 6106);
    			attr_dev(svg, "class", "icon svelte-fdm2zy");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$c, 184, 20, 6043);
    			add_location(p, file$c, 187, 20, 6280);
    			attr_dev(div, "class", "error svelte-fdm2zy");
    			add_location(div, file$c, 183, 16, 6003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*error*/ 2048) set_data_dev(t1, /*error*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(183:28) ",
    		ctx
    	});

    	return block;
    }

    // (178:12) {#if loading}
    function create_if_block_1$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Loading data...";
    			attr_dev(div0, "class", "spinner svelte-fdm2zy");
    			add_location(div0, file$c, 179, 20, 5864);
    			add_location(p, file$c, 180, 20, 5912);
    			attr_dev(div1, "class", "loading svelte-fdm2zy");
    			add_location(div1, file$c, 178, 16, 5822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(178:12) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (191:16) {#if showFilters}
    function create_if_block_3$3(ctx) {
    	let div5;
    	let div4;
    	let div1;
    	let label0;
    	let t1;
    	let div0;
    	let input;
    	let t2;
    	let svg;
    	let path;
    	let t3;
    	let div2;
    	let label1;
    	let t5;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let t9;
    	let div3;
    	let label2;
    	let t11;
    	let select1;
    	let option3;
    	let option4;
    	let t14;
    	let mounted;
    	let dispose;
    	let if_block = /*selectedDateRange*/ ctx[1] === 'custom' && create_if_block_4$2(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Search Staff";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Status";
    			t5 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "All Statuses";
    			option1 = element("option");
    			option1.textContent = "In Office";
    			option2 = element("option");
    			option2.textContent = "Remote";
    			t9 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Date Range";
    			t11 = space();
    			select1 = element("select");
    			option3 = element("option");
    			option3.textContent = "Today";
    			option4 = element("option");
    			option4.textContent = "Custom Range";
    			t14 = space();
    			if (if_block) if_block.c();
    			attr_dev(label0, "for", "search-staff");
    			attr_dev(label0, "class", "svelte-fdm2zy");
    			add_location(label0, file$c, 194, 32, 6550);
    			attr_dev(input, "id", "search-staff");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search by name, email...");
    			attr_dev(input, "class", "svelte-fdm2zy");
    			add_location(input, file$c, 196, 36, 6692);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z");
    			add_location(path, file$c, 203, 40, 7107);
    			attr_dev(svg, "class", "icon svelte-fdm2zy");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$c, 202, 36, 7028);
    			attr_dev(div0, "class", "search-input svelte-fdm2zy");
    			add_location(div0, file$c, 195, 32, 6629);
    			attr_dev(div1, "class", "filter-item svelte-fdm2zy");
    			add_location(div1, file$c, 193, 28, 6492);
    			attr_dev(label1, "for", "status-filter");
    			attr_dev(label1, "class", "svelte-fdm2zy");
    			add_location(label1, file$c, 209, 32, 7432);
    			option0.__value = "All";
    			option0.value = option0.__value;
    			add_location(option0, file$c, 211, 36, 7598);
    			option1.__value = "office";
    			option1.value = option1.__value;
    			add_location(option1, file$c, 212, 36, 7676);
    			option2.__value = "remote";
    			option2.value = option2.__value;
    			add_location(option2, file$c, 213, 36, 7754);
    			attr_dev(select0, "id", "status-filter");
    			attr_dev(select0, "class", "svelte-fdm2zy");
    			if (/*selectedStatus*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[24].call(select0));
    			add_location(select0, file$c, 210, 32, 7506);
    			attr_dev(div2, "class", "filter-item svelte-fdm2zy");
    			add_location(div2, file$c, 208, 28, 7374);
    			attr_dev(label2, "for", "date-range-filter");
    			attr_dev(label2, "class", "svelte-fdm2zy");
    			add_location(label2, file$c, 218, 32, 7957);
    			option3.__value = "today";
    			option3.value = option3.__value;
    			add_location(option3, file$c, 220, 36, 8138);
    			option4.__value = "custom";
    			option4.value = option4.__value;
    			add_location(option4, file$c, 221, 36, 8211);
    			attr_dev(select1, "id", "date-range-filter");
    			attr_dev(select1, "class", "svelte-fdm2zy");
    			if (/*selectedDateRange*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[25].call(select1));
    			add_location(select1, file$c, 219, 32, 8039);
    			attr_dev(div3, "class", "filter-item svelte-fdm2zy");
    			add_location(div3, file$c, 217, 28, 7899);
    			attr_dev(div4, "class", "filter-grid svelte-fdm2zy");
    			add_location(div4, file$c, 192, 24, 6438);
    			attr_dev(div5, "class", "filters svelte-fdm2zy");
    			add_location(div5, file$c, 191, 20, 6392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*searchQuery*/ ctx[2]);
    			append_dev(div0, t2);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t5);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			select_option(select0, /*selectedStatus*/ ctx[0], true);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t11);
    			append_dev(div3, select1);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			select_option(select1, /*selectedDateRange*/ ctx[1], true);
    			append_dev(div3, t14);
    			if (if_block) if_block.m(div3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[23]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[24]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[25])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*searchQuery*/ 4 && input.value !== /*searchQuery*/ ctx[2]) {
    				set_input_value(input, /*searchQuery*/ ctx[2]);
    			}

    			if (dirty[0] & /*selectedStatus*/ 1) {
    				select_option(select0, /*selectedStatus*/ ctx[0]);
    			}

    			if (dirty[0] & /*selectedDateRange*/ 2) {
    				select_option(select1, /*selectedDateRange*/ ctx[1]);
    			}

    			if (/*selectedDateRange*/ ctx[1] === 'custom') {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$2(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(191:16) {#if showFilters}",
    		ctx
    	});

    	return block;
    }

    // (225:32) {#if selectedDateRange === 'custom'}
    function create_if_block_4$2(ctx) {
    	let div;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "class", "svelte-fdm2zy");
    			add_location(input0, file$c, 226, 40, 8501);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "class", "svelte-fdm2zy");
    			add_location(input1, file$c, 230, 40, 8714);
    			attr_dev(div, "class", "date-range svelte-fdm2zy");
    			add_location(div, file$c, 225, 36, 8436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*startDate*/ ctx[8]);
    			append_dev(div, t);
    			append_dev(div, input1);
    			set_input_value(input1, /*endDate*/ ctx[9]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[26]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[27])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*startDate*/ 256) {
    				set_input_value(input0, /*startDate*/ ctx[8]);
    			}

    			if (dirty[0] & /*endDate*/ 512) {
    				set_input_value(input1, /*endDate*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(225:32) {#if selectedDateRange === 'custom'}",
    		ctx
    	});

    	return block;
    }

    // (304:20) {#each activeTab === 'all' ? filteredEmployees :                             activeTab === 'office' ? officeEmployees :                             remoteEmployees as employee (employee.id)}
    function create_each_block$a(key_1, ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let p0;
    	let t0_value = /*employee*/ ctx[38].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*employee*/ ctx[38].team + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*employee*/ ctx[38].email + "";
    	let t4;
    	let t5;
    	let div1;
    	let span;
    	let t6_value = (/*employee*/ ctx[38].status || 'office') + "";
    	let t6;
    	let span_class_value;
    	let t7;
    	let div0;
    	let button0;
    	let t8;
    	let button0_class_value;
    	let t9;
    	let button1;
    	let t10;
    	let button1_class_value;
    	let t11;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[31](/*employee*/ ctx[38]);
    	}

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[32](/*employee*/ ctx[38]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			span = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			div0 = element("div");
    			button0 = element("button");
    			t8 = text("Office");
    			t9 = space();
    			button1 = element("button");
    			t10 = text("Remote");
    			t11 = space();
    			attr_dev(p0, "class", "employee-name svelte-fdm2zy");
    			add_location(p0, file$c, 309, 36, 12623);
    			attr_dev(p1, "class", "employee-dept svelte-fdm2zy");
    			add_location(p1, file$c, 310, 36, 12704);
    			attr_dev(p2, "class", "employee-email svelte-fdm2zy");
    			add_location(p2, file$c, 311, 36, 12785);
    			attr_dev(span, "class", span_class_value = "status-badge " + (/*employee*/ ctx[38].status || 'office') + " svelte-fdm2zy");
    			add_location(span, file$c, 313, 40, 12937);
    			attr_dev(button0, "class", button0_class_value = "status-button " + (/*employee*/ ctx[38].status === 'office' ? 'active' : '') + " svelte-fdm2zy");
    			add_location(button0, file$c, 317, 44, 13230);
    			attr_dev(button1, "class", button1_class_value = "status-button " + (/*employee*/ ctx[38].status === 'remote' ? 'active' : '') + " svelte-fdm2zy");
    			add_location(button1, file$c, 323, 44, 13664);
    			attr_dev(div0, "class", "status-actions svelte-fdm2zy");
    			add_location(div0, file$c, 316, 40, 13157);
    			attr_dev(div1, "class", "status-section svelte-fdm2zy");
    			add_location(div1, file$c, 312, 36, 12868);
    			attr_dev(div2, "class", "employee-details svelte-fdm2zy");
    			add_location(div2, file$c, 308, 32, 12556);
    			attr_dev(div3, "class", "employee-info svelte-fdm2zy");
    			add_location(div3, file$c, 307, 28, 12496);
    			attr_dev(div4, "class", "employee-card svelte-fdm2zy");
    			add_location(div4, file$c, 306, 24, 12440);
    			this.first = div4;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, p1);
    			append_dev(p1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, p2);
    			append_dev(p2, t4);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			append_dev(span, t6);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t8);
    			append_dev(div0, t9);
    			append_dev(div0, button1);
    			append_dev(button1, t10);
    			append_dev(div4, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_3, false, false, false, false),
    					listen_dev(button1, "click", click_handler_4, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && t0_value !== (t0_value = /*employee*/ ctx[38].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && t2_value !== (t2_value = /*employee*/ ctx[38].team + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && t4_value !== (t4_value = /*employee*/ ctx[38].email + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && t6_value !== (t6_value = (/*employee*/ ctx[38].status || 'office') + "")) set_data_dev(t6, t6_value);

    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && span_class_value !== (span_class_value = "status-badge " + (/*employee*/ ctx[38].status || 'office') + " svelte-fdm2zy")) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && button0_class_value !== (button0_class_value = "status-button " + (/*employee*/ ctx[38].status === 'office' ? 'active' : '') + " svelte-fdm2zy")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty[0] & /*activeTab, filteredEmployees, officeEmployees, remoteEmployees*/ 16608 && button1_class_value !== (button1_class_value = "status-button " + (/*employee*/ ctx[38].status === 'remote' ? 'active' : '') + " svelte-fdm2zy")) {
    				attr_dev(button1, "class", button1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(304:20) {#each activeTab === 'all' ? filteredEmployees :                             activeTab === 'office' ? officeEmployees :                             remoteEmployees as employee (employee.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*isAuthenticated*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API_BASE_URL = 'http://localhost:5000';

    function instance$e($$self, $$props, $$invalidate) {
    	let isAuthenticated;
    	let currentUser;
    	let filteredEmployees;
    	let officeEmployees;
    	let remoteEmployees;
    	let totalEmployees;
    	let officePercentage;
    	let remotePercentage;
    	let $jwtToken;
    	let $userClaims;
    	validate_store(jwtToken$1, 'jwtToken');
    	component_subscribe($$self, jwtToken$1, $$value => $$invalidate(21, $jwtToken = $$value));
    	validate_store(userClaims$1, 'userClaims');
    	component_subscribe($$self, userClaims$1, $$value => $$invalidate(22, $userClaims = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ManagerTimetable', slots, []);
    	let selectedStatus = 'All';
    	let selectedDateRange = 'today';
    	let startDate = '';
    	let endDate = '';
    	let employees = [];
    	let loading = true;
    	let error = null;
    	let isRequestInProgress = false;
    	let currentDepartment = '';
    	let showFilters = true;
    	let activeTab = 'all';
    	let searchQuery = '';

    	function getFilterState() {
    		return {
    			status: selectedStatus,
    			search: searchQuery,
    			dateRange: selectedDateRange,
    			startDate,
    			endDate
    		};
    	}

    	async function fetchEmployees(filters = {}) {
    		if (isRequestInProgress || !isAuthenticated) return;

    		try {
    			isRequestInProgress = true;
    			$$invalidate(10, loading = true);
    			const params = new URLSearchParams();

    			if (filters.status && filters.status !== 'All') {
    				params.append('status', filters.status.toLowerCase());
    			}

    			if (filters.search) {
    				params.append('search', filters.search);
    			}

    			const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
    				headers: { 'Authorization': `Bearer ${$jwtToken}` }
    			});

    			if (!response.ok) {
    				const errorData = await response.json();
    				throw new Error(errorData.error || 'Failed to fetch employees');
    			}

    			const data = await response.json();
    			$$invalidate(20, employees = data.employees);

    			// Set the department name from the first employee (they're all in the same department)
    			if (employees.length > 0) {
    				$$invalidate(12, currentDepartment = employees[0].department);
    			}

    			$$invalidate(11, error = null);
    		} catch(err) {
    			console.error('Error fetching employees:', err);
    			$$invalidate(11, error = err.message || 'Failed to load employee data');
    			$$invalidate(20, employees = []);
    		} finally {
    			$$invalidate(10, loading = false);
    			isRequestInProgress = false;
    		}
    	}

    	async function updateEmployeeStatus(employeeId, newStatus) {
    		if (!isAuthenticated) return;

    		try {
    			const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/status`, {
    				method: 'PUT',
    				headers: {
    					'Authorization': `Bearer ${$jwtToken}`,
    					'Content-Type': 'application/json'
    				},
    				body: JSON.stringify({ status: newStatus })
    			});

    			if (!response.ok) {
    				const errorData = await response.json();
    				throw new Error(errorData.error || 'Failed to update status');
    			}

    			// Refresh employee list after successful update
    			await fetchEmployees(getFilterState());
    		} catch(err) {
    			console.error('Error updating status:', err);
    			$$invalidate(11, error = err.message);
    		}
    	}

    	function toggleFilters() {
    		$$invalidate(13, showFilters = !showFilters);
    	}

    	let filterTimeout;

    	function debouncedFetchEmployees() {
    		clearTimeout(filterTimeout);

    		filterTimeout = setTimeout(
    			() => {
    				if (!isRequestInProgress && isAuthenticated) {
    					fetchEmployees(getFilterState());
    				}
    			},
    			500
    		);
    	}

    	onMount(async () => {
    		if (isAuthenticated) {
    			try {
    				await fetchEmployees(getFilterState());
    			} catch(err) {
    				console.error('Error in initialization:', err);
    				$$invalidate(11, error = err.message);
    			}
    		}
    	});

    	onDestroy(() => {
    		clearTimeout(filterTimeout);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<ManagerTimetable> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchQuery = this.value;
    		$$invalidate(2, searchQuery);
    	}

    	function select0_change_handler() {
    		selectedStatus = select_value(this);
    		$$invalidate(0, selectedStatus);
    	}

    	function select1_change_handler() {
    		selectedDateRange = select_value(this);
    		$$invalidate(1, selectedDateRange);
    	}

    	function input0_input_handler() {
    		startDate = this.value;
    		$$invalidate(8, startDate);
    	}

    	function input1_input_handler() {
    		endDate = this.value;
    		$$invalidate(9, endDate);
    	}

    	const click_handler = () => $$invalidate(14, activeTab = 'all');
    	const click_handler_1 = () => $$invalidate(14, activeTab = 'office');
    	const click_handler_2 = () => $$invalidate(14, activeTab = 'remote');
    	const click_handler_3 = employee => updateEmployeeStatus(employee.id, 'office');
    	const click_handler_4 = employee => updateEmployeeStatus(employee.id, 'remote');

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		jwtToken: jwtToken$1,
    		userClaims: userClaims$1,
    		Login,
    		selectedStatus,
    		selectedDateRange,
    		startDate,
    		endDate,
    		employees,
    		loading,
    		error,
    		isRequestInProgress,
    		currentDepartment,
    		showFilters,
    		activeTab,
    		searchQuery,
    		API_BASE_URL,
    		getFilterState,
    		fetchEmployees,
    		updateEmployeeStatus,
    		toggleFilters,
    		filterTimeout,
    		debouncedFetchEmployees,
    		isAuthenticated,
    		totalEmployees,
    		remoteEmployees,
    		remotePercentage,
    		officeEmployees,
    		officePercentage,
    		filteredEmployees,
    		currentUser,
    		$jwtToken,
    		$userClaims
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedStatus' in $$props) $$invalidate(0, selectedStatus = $$props.selectedStatus);
    		if ('selectedDateRange' in $$props) $$invalidate(1, selectedDateRange = $$props.selectedDateRange);
    		if ('startDate' in $$props) $$invalidate(8, startDate = $$props.startDate);
    		if ('endDate' in $$props) $$invalidate(9, endDate = $$props.endDate);
    		if ('employees' in $$props) $$invalidate(20, employees = $$props.employees);
    		if ('loading' in $$props) $$invalidate(10, loading = $$props.loading);
    		if ('error' in $$props) $$invalidate(11, error = $$props.error);
    		if ('isRequestInProgress' in $$props) isRequestInProgress = $$props.isRequestInProgress;
    		if ('currentDepartment' in $$props) $$invalidate(12, currentDepartment = $$props.currentDepartment);
    		if ('showFilters' in $$props) $$invalidate(13, showFilters = $$props.showFilters);
    		if ('activeTab' in $$props) $$invalidate(14, activeTab = $$props.activeTab);
    		if ('searchQuery' in $$props) $$invalidate(2, searchQuery = $$props.searchQuery);
    		if ('filterTimeout' in $$props) filterTimeout = $$props.filterTimeout;
    		if ('isAuthenticated' in $$props) $$invalidate(3, isAuthenticated = $$props.isAuthenticated);
    		if ('totalEmployees' in $$props) $$invalidate(4, totalEmployees = $$props.totalEmployees);
    		if ('remoteEmployees' in $$props) $$invalidate(5, remoteEmployees = $$props.remoteEmployees);
    		if ('remotePercentage' in $$props) $$invalidate(15, remotePercentage = $$props.remotePercentage);
    		if ('officeEmployees' in $$props) $$invalidate(6, officeEmployees = $$props.officeEmployees);
    		if ('officePercentage' in $$props) $$invalidate(16, officePercentage = $$props.officePercentage);
    		if ('filteredEmployees' in $$props) $$invalidate(7, filteredEmployees = $$props.filteredEmployees);
    		if ('currentUser' in $$props) $$invalidate(17, currentUser = $$props.currentUser);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$jwtToken*/ 2097152) {
    			// Subscribe to auth store changes
    			$$invalidate(3, isAuthenticated = !!$jwtToken);
    		}

    		if ($$self.$$.dirty[0] & /*$userClaims*/ 4194304) {
    			$$invalidate(17, currentUser = $userClaims);
    		}

    		if ($$self.$$.dirty[0] & /*employees*/ 1048576) {
    			// Move the filtering logic to computed properties
    			$$invalidate(7, filteredEmployees = employees);
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 128) {
    			$$invalidate(6, officeEmployees = filteredEmployees.filter(emp => emp.status === 'office'));
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 128) {
    			$$invalidate(5, remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote'));
    		}

    		if ($$self.$$.dirty[0] & /*filteredEmployees*/ 128) {
    			$$invalidate(4, totalEmployees = filteredEmployees.length);
    		}

    		if ($$self.$$.dirty[0] & /*totalEmployees, officeEmployees*/ 80) {
    			$$invalidate(16, officePercentage = totalEmployees
    			? (officeEmployees.length / totalEmployees * 100).toFixed(1)
    			: 0);
    		}

    		if ($$self.$$.dirty[0] & /*totalEmployees, remoteEmployees*/ 48) {
    			$$invalidate(15, remotePercentage = totalEmployees
    			? (remoteEmployees.length / totalEmployees * 100).toFixed(1)
    			: 0);
    		}

    		if ($$self.$$.dirty[0] & /*searchQuery*/ 4) {
    			// Handle individual filter changes
    			if (searchQuery !== undefined) debouncedFetchEmployees();
    		}

    		if ($$self.$$.dirty[0] & /*selectedStatus*/ 1) {
    			if (selectedStatus !== undefined) debouncedFetchEmployees();
    		}

    		if ($$self.$$.dirty[0] & /*selectedDateRange*/ 2) {
    			if (selectedDateRange !== undefined) debouncedFetchEmployees();
    		}

    		if ($$self.$$.dirty[0] & /*isAuthenticated*/ 8) {
    			// Watch for auth changes and refetch data when authenticated
    			if (isAuthenticated) {
    				fetchEmployees(getFilterState());
    			}
    		}
    	};

    	return [
    		selectedStatus,
    		selectedDateRange,
    		searchQuery,
    		isAuthenticated,
    		totalEmployees,
    		remoteEmployees,
    		officeEmployees,
    		filteredEmployees,
    		startDate,
    		endDate,
    		loading,
    		error,
    		currentDepartment,
    		showFilters,
    		activeTab,
    		remotePercentage,
    		officePercentage,
    		currentUser,
    		updateEmployeeStatus,
    		toggleFilters,
    		employees,
    		$jwtToken,
    		$userClaims,
    		input_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class ManagerTimetable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ManagerTimetable",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    function keyEnter(fn) {
        return function (e) {
            return e.key === 'Enter' || e.key === ' ' && !e.preventDefault()  // prevent page scroll down
                ? fn.call(this, e)
                : undefined;
        };
    }

    function setContent(node, content) {
        let actions = {
            update(content) {
                if (typeof content == 'string') {
                    node.innerText = content;
                } else if (content?.domNodes) {
                    node.replaceChildren(...content.domNodes);
                } else if (content?.html) {
                    node.innerHTML = content.html;
                }
            }
        };
        actions.update(content);

        return actions;
    }

    /** Dispatch event occurred outside of node */
    function outsideEvent(node, type) {

        const handlePointerDown = jsEvent => {
            if (node && !node.contains(jsEvent.target)) {
                node.dispatchEvent(
                    new CustomEvent(type + 'outside', {detail: {jsEvent}})
                );
            }
        };

        document.addEventListener(type, handlePointerDown, true);

        return {
            destroy() {
                document.removeEventListener(type, handlePointerDown, true);
            }
        };
    }

    const DAY_IN_SECONDS = 86400;

    function createDate(input = undefined) {
        if (input !== undefined) {
            return input instanceof Date ? _fromLocalDate(input) : _fromISOString(input);
        }

        return _fromLocalDate(new Date());
    }

    function createDuration(input) {
        if (typeof input === 'number') {
            input = {seconds: input};
        } else if (typeof input === 'string') {
            // Expected format hh[:mm[:ss]]
            let seconds = 0, exp = 2;
            for (let part of input.split(':', 3)) {
                seconds += parseInt(part, 10) * Math.pow(60, exp--);
            }
            input = {seconds};
        } else if (input instanceof Date) {
            input = {hours: input.getUTCHours(), minutes: input.getUTCMinutes(), seconds: input.getUTCSeconds()};
        }

        let weeks = input.weeks || input.week || 0;

        return {
            years: input.years || input.year || 0,
            months: input.months || input.month || 0,
            days: weeks * 7 + (input.days || input.day || 0),
            seconds: (input.hours || input.hour || 0) * 60 * 60 +
                (input.minutes || input.minute || 0) * 60 +
                (input.seconds || input.second || 0),
            inWeeks: !!weeks
        };
    }

    function cloneDate(date) {
        return new Date(date.getTime());
    }

    function addDuration(date, duration, x = 1) {
        date.setUTCFullYear(date.getUTCFullYear() + x * duration.years);
        let month = date.getUTCMonth() + x * duration.months;
        date.setUTCMonth(month);
        month %= 12;
        if (month < 0) {
            month += 12;
        }
        while (date.getUTCMonth() !== month) {
            subtractDay(date);
        }
        date.setUTCDate(date.getUTCDate() + x * duration.days);
        date.setUTCSeconds(date.getUTCSeconds() + x * duration.seconds);

        return date;
    }

    function subtractDuration(date, duration, x = 1) {
        return addDuration(date, duration, -x);
    }

    function addDay(date, x = 1) {
        date.setUTCDate(date.getUTCDate() + x);

        return date;
    }

    function subtractDay(date, x = 1) {
        return addDay(date, -x);
    }

    function setMidnight(date) {
        date.setUTCHours(0, 0, 0, 0);

        return date;
    }

    function toLocalDate(date) {
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds()
        );
    }

    function toISOString(date, len = 19) {
        return date.toISOString().substring(0, len);
    }

    function datesEqual(date1, ...dates2) {
        return dates2.every(date2 => date1.getTime() === date2.getTime());
    }

    function nextClosestDay(date, day) {
        let diff = day - date.getUTCDay();
        date.setUTCDate(date.getUTCDate() + (diff >= 0 ? diff : diff + 7));
        return date;
    }

    function prevClosestDay(date, day) {
        let diff = day - date.getUTCDay();
        date.setUTCDate(date.getUTCDate() + (diff <= 0 ? diff : diff - 7));
        return date;
    }

    /**
     * Check whether given date is string which contains no time part
      */
    function noTimePart(date) {
        return typeof date === 'string' && date.length <= 10;
    }

    /**
     * Copy time from one date to another
     */
    function copyTime(toDate, fromDate) {
        toDate.setUTCHours(fromDate.getUTCHours(), fromDate.getUTCMinutes(), fromDate.getUTCSeconds(), 0);

        return toDate;
    }

    /**
     * Move the date forward (when pressing the next button)
     */
    function nextDate(date, duration) {
        addDuration(date, duration);
        return date;
    }

    /**
     * Move the date backward (when pressing the prev button)
     */
    function prevDate(date, duration, hiddenDays) {
        subtractDuration(date, duration);
        if (hiddenDays.length && hiddenDays.length < 7) {
            while (hiddenDays.includes(date.getUTCDay())) {
                subtractDay(date);
            }
        }
        return date;
    }

    /**
     * Private functions
     */

    function _fromLocalDate(date) {
        return new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        ));
    }

    function _fromISOString(str) {
        const parts = str.match(/\d+/g);
        return new Date(Date.UTC(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
            Number(parts[3] || 0),
            Number(parts[4] || 0),
            Number(parts[5] || 0)
        ));
    }

    function assign(...args) {
        return Object.assign(...args);
    }

    function keys(object) {
        return Object.keys(object);
    }

    function max(...args) {
        return Math.max(...args);
    }

    function symbol() {
        return Symbol('ec');
    }

    function isArray(value) {
        return Array.isArray(value);
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function run(fn) {
        return fn();
    }

    function runAll(fns) {
        fns.forEach(run);
    }

    const identity = (x) => x;

    function debounce(fn, handle, queueStore) {
        queueStore.update(queue => queue.set(handle, fn));
    }

    function flushDebounce(queue) {
        runAll(queue);
        queue.clear();
    }

    function task(fn, handle, tasks) {
        handle ??= fn;
        if (!tasks.has(handle)) {
            tasks.set(handle, setTimeout(() => {
                tasks.delete(handle);
                fn();
            }));
        }
    }

    function createElement(tag, className, content, attrs = []) {
        let el = document.createElement(tag);
        el.className = className;
        if (typeof content == 'string') {
            el.innerText = content;
        } else if (content.domNodes) {
            el.replaceChildren(...content.domNodes);
        } else if (content.html) {
            el.innerHTML = content.html;
        }
        for (let attr of attrs) {
            el.setAttribute(...attr);
        }
        return el;
    }

    function hasYScroll(el) {
        return el.scrollHeight > el.clientHeight;
    }

    function rect(el) {
        return el.getBoundingClientRect();
    }

    function ancestor(el, up) {
        while (up--) {
            el = el.parentElement;
        }
        return el;
    }

    function height(el) {
        return rect(el).height;
    }

    let payloadProp = symbol();
    function setPayload(el, payload) {
        el[payloadProp] = payload;
    }

    function hasPayload(el) {
        return !!el?.[payloadProp];
    }

    function getPayload(el) {
        return el[payloadProp];
    }

    function getElementWithPayload(x, y, root = document) {
        for (let el of root.elementsFromPoint(x, y)) {
            if (hasPayload(el)) {
                return el;
            }
            /** @see https://github.com/vkurko/calendar/issues/142 */
            if (el.shadowRoot) {
                let shadowEl = getElementWithPayload(x, y, el.shadowRoot);
                if (shadowEl) {
                    return shadowEl;
                }
            }
        }
        return null;
    }

    function createView(view, _viewTitle, _currentRange, _activeRange) {
        return {
            type: view,
            title: _viewTitle,
            currentStart: _currentRange.start,
            currentEnd: _currentRange.end,
            activeStart: _activeRange.start,
            activeEnd: _activeRange.end,
            calendar: undefined
        };
    }

    function toViewWithLocalDates(view) {
        view = assign({}, view);
        view.currentStart = toLocalDate(view.currentStart);
        view.currentEnd = toLocalDate(view.currentEnd);
        view.activeStart = toLocalDate(view.activeStart);
        view.activeEnd = toLocalDate(view.activeEnd);

        return view;
    }

    function listView(view) {
        return view.startsWith('list');
    }

    let eventId = 1;
    function createEvents(input) {
        return input.map(event => {
            let result = {
                id: 'id' in event ? String(event.id) : `{generated-${eventId++}}`,
                resourceIds: toArrayProp(event, 'resourceId').map(String),
                allDay: event.allDay ?? (noTimePart(event.start) && noTimePart(event.end)),
                start: createDate(event.start),
                end: createDate(event.end),
                title: event.title ?? '',
                editable: event.editable,
                startEditable: event.startEditable,
                durationEditable: event.durationEditable,
                display: event.display ?? 'auto',
                extendedProps: event.extendedProps ?? {},
                backgroundColor: event.backgroundColor ?? event.color,
                textColor: event.textColor,
                classNames: toArrayProp(event, 'className'),
                styles: toArrayProp(event, 'style')
            };

            if (result.allDay) {
                // Make sure all-day events start and end at midnight
                setMidnight(result.start);
                let end = cloneDate(result.end);
                setMidnight(result.end);
                if (
                    !datesEqual(result.end, end) ||
                    datesEqual(result.end, result.start)  /** @see https://github.com/vkurko/calendar/issues/50 */
                ) {
                    addDay(result.end);
                }
            }

            return result;
        });
    }

    function toArrayProp(input, propName) {
        let result = input[propName + 's'] ?? input[propName] ?? [];
        return isArray(result) ? result : [result];
    }

    function createEventSources(input) {
        return input.map(source => ({
            events: source.events,
            url: (source.url && source.url.trimEnd('&')) || '',
            method: (source.method && source.method.toUpperCase()) || 'GET',
            extraParams: source.extraParams || {}
        }));
    }

    function createEventChunk(event, start, end) {
        return {
            start: event.start > start ? event.start : start,
            end: event.end < end ? event.end : end,
            event
        };
    }

    function sortEventChunks(chunks) {
        // Sort by start date (all-day events always on top)
        chunks.sort((a, b) => a.start - b.start || b.event.allDay - a.event.allDay);
    }

    function createEventContent(chunk, displayEventEnd, eventContent, theme, _intlEventTime, _view) {
        let timeText = _intlEventTime.formatRange(
            chunk.start,
            displayEventEnd && chunk.event.display !== 'pointer'
                ? copyTime(cloneDate(chunk.start), chunk.end)  // make Intl.formatRange output only the time part
                : chunk.start
        );
        let content;

        if (eventContent) {
            content = isFunction(eventContent)
                ? eventContent({
                    event: toEventWithLocalDates(chunk.event),
                    timeText,
                    view: toViewWithLocalDates(_view)
                })
                : eventContent;
        }

        if (content === undefined) {
            let domNodes;
            switch (chunk.event.display) {
                case 'background':
                    domNodes = [];
                    break;
                case 'pointer':
                    domNodes = [createTimeElement(timeText, chunk, theme)];
                    break;
                default:
                    domNodes = [
                        ...chunk.event.allDay ? [] : [createTimeElement(timeText, chunk, theme)],
                        createElement('h4', theme.eventTitle, chunk.event.title)
                    ];
            }
            content = {domNodes};
        }

        return [timeText, content];
    }

    function createTimeElement(timeText, chunk, theme) {
        return createElement(
            'time',
            theme.eventTime,
            timeText,
            [['datetime', toISOString(chunk.start)]]
        );
    }

    function createEventClasses(eventClassNames, event, _view) {
        let result = event.classNames;
        if (eventClassNames) {
            if (isFunction(eventClassNames)) {
                eventClassNames = eventClassNames({
                    event: toEventWithLocalDates(event),
                    view: toViewWithLocalDates(_view)
                });
            }
            result = [
                ...isArray(eventClassNames) ? eventClassNames : [eventClassNames],
                ...result
            ];
        }
        return result;
    }

    function toEventWithLocalDates(event) {
        return _cloneEvent(event, toLocalDate);
    }

    function _cloneEvent(event, dateFn) {
        event = assign({}, event);
        event.start = dateFn(event.start);
        event.end = dateFn(event.end);

        return event;
    }

    /**
     * Prepare event chunks for month view and all-day slot in week view
     */
    function prepareEventChunks(chunks, hiddenDays) {
        let longChunks = {};

        if (chunks.length) {
            sortEventChunks(chunks);

            let prevChunk;
            for (let chunk of chunks) {
                let dates = [];
                let date = setMidnight(cloneDate(chunk.start));
                while (chunk.end > date) {
                    if (!hiddenDays.includes(date.getUTCDay())) {
                        dates.push(cloneDate(date));
                        if (dates.length > 1) {
                            let key = date.getTime();
                            if (longChunks[key]) {
                                longChunks[key].chunks.push(chunk);
                            } else {
                                longChunks[key] = {
                                    sorted: false,
                                    chunks: [chunk]
                                };
                            }
                        }
                    }
                    addDay(date);
                }
                if (dates.length) {
                    chunk.date = dates[0];
                    chunk.days = dates.length;
                    chunk.dates = dates;
                    // Adjust the start and end dates of the chunk if hidden days affected them
                    if (chunk.start < dates[0]) {
                        chunk.start = dates[0];
                    }
                    let maxEnd = addDay(cloneDate(dates.at(-1)));
                    if (chunk.end > maxEnd) {
                        chunk.end = maxEnd;
                    }
                } else {
                    chunk.date = setMidnight(cloneDate(chunk.start));
                    chunk.days = 1;
                    chunk.dates = [chunk.date];
                }

                if (prevChunk && datesEqual(prevChunk.date, chunk.date)) {
                    chunk.prev = prevChunk;
                }
                prevChunk = chunk;
            }
        }

        return longChunks;
    }

    function repositionEvent(chunk, longChunks, height) {
        chunk.top = 0;
        if (chunk.prev) {
            chunk.top = chunk.prev.bottom + 1;
        }
        chunk.bottom = chunk.top + height;
        let margin = 1;
        let key = chunk.date.getTime();
        if (longChunks[key]) {
            if (!longChunks[key].sorted) {
                longChunks[key].chunks.sort((a, b) => a.top - b.top);
                longChunks[key].sorted = true;
            }
            for (let longChunk of longChunks[key].chunks) {
                if (chunk.top < longChunk.bottom && chunk.bottom > longChunk.top) {
                    let offset = longChunk.bottom - chunk.top + 1;
                    margin += offset;
                    chunk.top += offset;
                    chunk.bottom += offset;
                }
            }
        }

        return margin;
    }

    function runReposition(refs, data) {
        refs.length = data.length;
        let result = [];
        for (let ref of refs) {
            result.push(ref?.reposition?.());
        }
        return result;
    }

    /**
     * Check whether the event intersects with the given date range and resources
     * @param event
     * @param start
     * @param end
     * @param resources
     * @return boolean
     */
    function eventIntersects(event, start, end, resources) {
        if (event.start < end && event.end > start) {
            if (resources) {
                if (!isArray(resources)) {
                    resources = [resources];
                }
                return resources.some(resource => event.resourceIds.includes(resource.id));
            }
            return true;
        }
        return false;
    }

    function helperEvent(display) {
        return previewEvent(display) || ghostEvent(display) || pointerEvent(display);
    }

    function bgEvent(display) {
        return display === 'background';
    }

    function previewEvent(display) {
        return display === 'preview';
    }

    function ghostEvent(display) {
        return display === 'ghost';
    }

    function pointerEvent(display) {
        return display === 'pointer';
    }

    function btnTextMonth(text) {
        return btnText(text, 'month');
    }

    function btnText(text, period) {
        return {
            ...text,
            next: 'Next ' + period,
            prev: 'Previous ' + period
        };
    }

    function themeView(view) {
        return theme => ({...theme, view});
    }

    function createResources(input) {
        return input.map(resource => ({
            id: String(resource.id),
            title: resource.title || '',
            eventBackgroundColor: resource.eventBackgroundColor,
            eventTextColor: resource.eventTextColor,
            extendedProps: resource.extendedProps ?? {}
        }));
    }

    function resourceBackgroundColor(event, resources) {
        return findResource(event, resources)?.eventBackgroundColor;
    }

    function resourceTextColor(event, resources) {
        return findResource(event, resources)?.eventTextColor;
    }

    function findResource(event, resources) {
        return resources.find(resource => event.resourceIds.includes(resource.id));
    }

    function intl(locale, format) {
        return derived([locale, format], ([$locale, $format]) => {
            let intl = isFunction($format)
                ? {format: $format}
                : new Intl.DateTimeFormat($locale, $format);
            return {
                format: date => intl.format(toLocalDate(date))
            };
        });
    }

    function intlRange(locale, format) {
        return derived([locale, format], ([$locale, $format]) => {
            let formatRange;
            if (isFunction($format)) {
                formatRange = $format;
            } else {
                let intl = new Intl.DateTimeFormat($locale, $format);
                formatRange = (start, end) => {
                    if (start <= end) {
                        return intl.formatRange(start, end);
                    } else {
                        // In iOS 16 and older, intl.formatRange() throws an exception if the start date is later than the end date.
                        // Therefore, we first swap the parameters, and then swap the resulting parts.
                        /** @see https://github.com/vkurko/calendar/issues/227 */
                        let parts = intl.formatRangeToParts(end, start);
                        let result = '';
                        let sources = ['startRange', 'endRange'];
                        let processed = [false, false];
                        for (let part of parts) {
                            let i = sources.indexOf(part.source);
                            if (i >= 0) {
                                if (!processed[i]) {
                                    result += _getParts(sources[1 - i], parts);
                                    processed[i] = true;
                                }
                            } else {
                                result += part.value;
                            }
                        }
                        return result;
                    }
                };
            }
            return {
                formatRange: (start, end) => formatRange(toLocalDate(start), toLocalDate(end))
            };
        });
    }

    function _getParts(source, parts) {
        let result = '';
        for (let part of parts) {
            if (part.source == source) {
                result += part.value;
            }
        }
        return result;
    }

    function createOptions(plugins) {
        let options = {
            allDayContent: undefined,
            allDaySlot: true,
            buttonText: {
                today: 'today',
            },
            customButtons: {},
            date: new Date(),
            datesSet: undefined,
            dayHeaderFormat: {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric'
            },
            dayHeaderAriaLabelFormat: {
                dateStyle: 'full'
            },
            displayEventEnd: true,
            duration: {weeks: 1},
            events: [],
            eventAllUpdated: undefined,
            eventBackgroundColor: undefined,
            eventTextColor: undefined,
            eventClassNames: undefined,
            eventClick: undefined,
            eventColor: undefined,
            eventContent: undefined,
            eventDidMount: undefined,
            eventMouseEnter: undefined,
            eventMouseLeave: undefined,
            eventSources: [],
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit'
            },
            filterEventsWithResources: false,
            filterResourcesWithEvents: false,
            firstDay: 0,
            flexibleSlotTimeLimits: false,  // ec option
            headerToolbar: {
                start: 'title',
                center: '',
                end: 'today prev,next'
            },
            height: undefined,
            hiddenDays: [],
            highlightedDates: [],  // ec option
            lazyFetching: true,
            loading: undefined,
            locale: undefined,
            nowIndicator: false,
            resourceLabelContent: undefined,
            resourceLabelDidMount: undefined,
            resources: [],
            selectable: false,
            scrollTime: '06:00:00',
            slotDuration: '00:30:00',
            slotEventOverlap: true,
            slotHeight: 24,  // ec option
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit'
            },
            slotMaxTime: '24:00:00',
            slotMinTime: '00:00:00',
            slotWidth: 72,
            theme: {
                allDay: 'ec-all-day',
                active: 'ec-active',
                bgEvent: 'ec-bg-event',
                bgEvents: 'ec-bg-events',
                body: 'ec-body',
                button: 'ec-button',
                buttonGroup: 'ec-button-group',
                calendar: 'ec',
                compact: 'ec-compact',
                content: 'ec-content',
                day: 'ec-day',
                dayHead: 'ec-day-head',
                days: 'ec-days',
                event: 'ec-event',
                eventBody: 'ec-event-body',
                eventTime: 'ec-event-time',
                eventTitle: 'ec-event-title',
                events: 'ec-events',
                extra: 'ec-extra',
                handle: 'ec-handle',
                header: 'ec-header',
                hiddenScroll: 'ec-hidden-scroll',
                highlight: 'ec-highlight',
                icon: 'ec-icon',
                line: 'ec-line',
                lines: 'ec-lines',
                nowIndicator: 'ec-now-indicator',
                otherMonth: 'ec-other-month',
                resource: 'ec-resource',
                sidebar: 'ec-sidebar',
                sidebarTitle: 'ec-sidebar-title',
                today: 'ec-today',
                time: 'ec-time',
                title: 'ec-title',
                toolbar: 'ec-toolbar',
                view: '',
                weekdays: ['ec-sun', 'ec-mon', 'ec-tue', 'ec-wed', 'ec-thu', 'ec-fri', 'ec-sat'],
                withScroll: 'ec-with-scroll'
            },
            titleFormat: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            view: undefined,
            viewDidMount: undefined,
            views: {}
        };

        for (let plugin of plugins) {
            plugin.createOptions?.(options);
        }

        return options;
    }

    function createParsers(plugins) {
        let parsers = {
            date: date => setMidnight(createDate(date)),
            duration: createDuration,
            events: createEvents,
            eventSources: createEventSources,
            hiddenDays: days => [...new Set(days)],
            highlightedDates: dates => dates.map(date => setMidnight(createDate(date))),
            resources: createResources,
            scrollTime: createDuration,
            slotDuration: createDuration,
            slotMaxTime: createDuration,
            slotMinTime: createDuration
        };

        for (let plugin of plugins) {
            plugin.createParsers?.(parsers);
        }

        return parsers;
    }

    function diff(options, prevOptions) {
        let diff = [];
        for (let key of keys(options)) {
            if (options[key] !== prevOptions[key]) {
                diff.push([key, options[key]]);
            }
        }
        assign(prevOptions, options);

        return diff;
    }

    function dayGrid(state) {
        return derived(state.view, $view => $view?.startsWith('dayGrid'));
    }

    function activeRange(state) {
        return derived(
            [state._currentRange, state.firstDay, state.slotMaxTime, state._dayGrid],
            ([$_currentRange, $firstDay, $slotMaxTime, $_dayGrid]) => {
                let start = cloneDate($_currentRange.start);
                let end = cloneDate($_currentRange.end);

                if ($_dayGrid) {
                    // First day of week
                    prevClosestDay(start, $firstDay);
                    nextClosestDay(end, $firstDay);
                } else if ($slotMaxTime.days || $slotMaxTime.seconds > DAY_IN_SECONDS) {
                    addDuration(subtractDay(end), $slotMaxTime);
                    let start2 = subtractDay(cloneDate(end));
                    if (start2 < start) {
                        start = start2;
                    }
                }

                return {start, end};
            }
        );
    }

    function currentRange(state) {
        return derived(
            [state.date, state.duration, state.firstDay],
            ([$date, $duration, $firstDay]) => {
                let start = cloneDate($date), end;
                if ($duration.months) {
                    start.setUTCDate(1);
                } else if ($duration.inWeeks) {
                    // First day of week
                    prevClosestDay(start, $firstDay);
                }
                end = addDuration(cloneDate(start), $duration);

                return {start, end};
            }
        );
    }

    function viewDates(state) {
        return derived([state._activeRange, state.hiddenDays], ([$_activeRange, $hiddenDays]) => {
            let dates = [];
            let date = setMidnight(cloneDate($_activeRange.start));
            let end = setMidnight(cloneDate($_activeRange.end));
            while (date < end) {
                if (!$hiddenDays.includes(date.getUTCDay())) {
                    dates.push(cloneDate(date));
                }
                addDay(date);
            }
            if (!dates.length && $hiddenDays.length && $hiddenDays.length < 7) {
                // Try to move the date
                state.date.update(date => {
                    while ($hiddenDays.includes(date.getUTCDay())) {
                        addDay(date);
                    }
                    return date;
                });
                dates = get_store_value(state._viewDates);
            }

            return dates;
        });
    }

    function viewTitle(state) {
        return derived(
            [state.date, state._activeRange, state._intlTitle, state._dayGrid],
            ([$date, $_activeRange, $_intlTitle, $_dayGrid]) => {
                return $_dayGrid
                    ? $_intlTitle.formatRange($date, $date)
                    : $_intlTitle.formatRange($_activeRange.start, subtractDay(cloneDate($_activeRange.end)));
            }
        );
    }

    function view(state) {
        return derived([state.view, state._viewTitle, state._currentRange, state._activeRange], args => createView(...args));
    }

    function events(state) {
        let _events = writable([]);
        let abortController;
        let fetching = 0;
        let debounceHandle = {};
        derived(
            [state.events, state.eventSources, state._activeRange, state._fetchedRange, state.lazyFetching, state.loading],
            (values, set) => debounce(() => {
                let [$events, $eventSources, $_activeRange, $_fetchedRange, $lazyFetching, $loading] = values;
                if (!$eventSources.length) {
                    set($events);
                    return;
                }
                // Do not fetch if new range is within the previous one
                if (!$_fetchedRange.start || $_fetchedRange.start > $_activeRange.start || $_fetchedRange.end < $_activeRange.end || !$lazyFetching) {
                    if (abortController) {
                        // Abort previous request
                        abortController.abort();
                    }
                    // Create new abort controller
                    abortController = new AbortController();
                    // Call loading hook
                    if (isFunction($loading) && !fetching) {
                        $loading(true);
                    }
                    let stopLoading = () => {
                        if (--fetching === 0 && isFunction($loading)) {
                            $loading(false);
                        }
                    };
                    let events = [];
                    // Prepare handlers
                    let failure = e => stopLoading();
                    let success = data => {
                        events = events.concat(createEvents(data));
                        set(events);
                        stopLoading();
                    };
                    // Prepare other stuff
                    let startStr = toISOString($_activeRange.start);
                    let endStr = toISOString($_activeRange.end);
                    // Loop over event sources
                    for (let source of $eventSources) {
                        if (isFunction(source.events)) {
                            // Events as a function
                            let result = source.events({
                                start: toLocalDate($_activeRange.start),
                                end: toLocalDate($_activeRange.end),
                                startStr,
                                endStr
                            }, success, failure);
                            if (result !== undefined) {
                                Promise.resolve(result).then(success, failure);
                            }
                        } else {
                            // Events as a JSON feed
                            // Prepare params
                            let params = isFunction(source.extraParams) ? source.extraParams() : assign({}, source.extraParams);
                            params.start = startStr;
                            params.end = endStr;
                            params = new URLSearchParams(params);
                            // Prepare fetch
                            let url = source.url, headers = {}, body;
                            if (['GET', 'HEAD'].includes(source.method)) {
                                url += (url.includes('?') ? '&' : '?') + params;
                            } else {
                                headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
                                body = String(params);  // Safari 10.1 doesn't convert to string automatically
                            }
                            // Do the fetch
                            fetch(url, {method: source.method, headers, body, signal: abortController.signal, credentials: 'same-origin'})
                                .then(response => response.json())
                                .then(success)
                                .catch(failure);
                        }
                        ++fetching;
                    }
                    // Save current range for future requests
                    $_fetchedRange.start = $_activeRange.start;
                    $_fetchedRange.end = $_activeRange.end;
                }
            }, debounceHandle, state._queue),
            []
        ).subscribe(_events.set);

        return _events;
    }

    function now() {
        return readable(createDate(), set => {
            let interval = setInterval(() => {
                set(createDate());
            }, 1000);

            return () => clearInterval(interval);
        });
    }

    function today(state) {
        return derived(state._now, $_now => setMidnight(cloneDate($_now)));
    }

    class State {
        constructor(plugins, input) {
            plugins = plugins || [];

            // Create options
            let options = createOptions(plugins);
            let parsers = createParsers(plugins);

            // Parse options
            options = parseOpts(options, parsers);
            input = parseOpts(input, parsers);

            // Create stores for options
            for (let [option, value] of Object.entries(options)) {
                this[option] = writable(value);
            }

            // Private stores
            this._queue = writable(new Map());  // debounce queue (beforeUpdate)
            this._queue2 = writable(new Map());  // debounce queue (afterUpdate)
            this._tasks = new Map();  // timeout IDs for tasks
            this._auxiliary = writable([]);  // auxiliary components
            this._dayGrid = dayGrid(this);
            this._currentRange = currentRange(this);
            this._activeRange = activeRange(this);
            this._fetchedRange = writable({start: undefined, end: undefined});
            this._events = events(this);
            this._now = now();
            this._today = today(this);
            this._intlEventTime = intlRange(this.locale, this.eventTimeFormat);
            this._intlSlotLabel = intl(this.locale, this.slotLabelFormat);
            this._intlDayHeader = intl(this.locale, this.dayHeaderFormat);
            this._intlDayHeaderAL = intl(this.locale, this.dayHeaderAriaLabelFormat);
            this._intlTitle = intlRange(this.locale, this.titleFormat);
            this._bodyEl = writable(undefined);
            this._scrollable = writable(false);
            this._viewTitle = viewTitle(this);
            this._viewDates = viewDates(this);
            this._view = view(this);
            this._viewComponent = writable(undefined);
            // Interaction
            this._interaction = writable({});
            this._iEvents = writable([null, null]);  // interaction events: [drag/resize, pointer]
            this._iClasses = writable(identity);  // interaction event css classes
            this._iClass = writable(undefined);  // interaction css class for entire calendar

            // Set & Get
            this._set = (key, value) => {
                if (validKey(key, this)) {
                    if (parsers[key]) {
                        value = parsers[key](value);
                    }
                    this[key].set(value);
                }
            };
            this._get = key => validKey(key, this) ? get_store_value(this[key]) : undefined;

            // Let plugins create their private stores
            for (let plugin of plugins) {
                plugin.createStores?.(this);
            }

            if (input.view) {
                // Set initial view based on input
                this.view.set(input.view);
            }

            // Set options for each view
            let views = new Set([...keys(options.views), ...keys(input.views ?? {})]);
            for (let view of views) {
                let defOpts = mergeOpts(options, options.views[view] ?? {});
                let opts = mergeOpts(defOpts, input, input.views?.[view] ?? {});
                let component = opts.component;
                // Make sure we deal with valid opts from now on
                filterOpts(opts, this);
                // Process options
                for (let key of keys(opts)) {
                    let {set, _set = set, ...rest} = this[key];

                    this[key] = {
                        // Set value in all views
                        set: ['buttonText', 'theme'].includes(key)
                            ? value => {
                                if (isFunction(value)) {
                                    let result = value(defOpts[key]);
                                    opts[key] = result;
                                    set(set === _set ? result : value);
                                } else {
                                    opts[key] = value;
                                    set(value);
                                }
                            }
                            : value => {
                                opts[key] = value;
                                set(value);
                            },
                        _set,
                        ...rest
                    };
                }
                // When view changes...
                this.view.subscribe(newView => {
                    if (newView === view) {
                        // switch view component
                        this._viewComponent.set(component);
                        if (isFunction(opts.viewDidMount)) {
                            tick().then(() => opts.viewDidMount(get_store_value(this._view)));
                        }
                        // update store values
                        for (let key of keys(opts)) {
                            this[key]._set(opts[key]);
                        }
                    }
                });
            }
        }
    }

    function parseOpts(opts, parsers) {
        let result = {...opts};
        for (let key of keys(parsers)) {
            if (key in result) {
                result[key] = parsers[key](result[key]);
            }
        }
        if (opts.views) {
            result.views = {};
            for (let view of keys(opts.views)) {
                result.views[view] = parseOpts(opts.views[view], parsers);
            }
        }
        return result;
    }

    function mergeOpts(...args) {
        let result = {};
        for (let opts of args) {
            let override = {};
            for (let key of ['buttonText', 'theme']) {
                if (isFunction(opts[key])) {
                    override[key] = opts[key](result[key]);
                }
            }
            result = {
                ...result,
                ...opts,
                ...override
            };
        }
        return result;
    }

    function filterOpts(opts, state) {
        keys(opts)
            .filter(key => !validKey(key, state) || key == 'view')
            .forEach(key => delete opts[key]);
    }

    function validKey(key, state) {
        return state.hasOwnProperty(key) && key[0] !== '_';
    }

    /* node_modules\@event-calendar\core\src\Buttons.svelte generated by Svelte v3.59.2 */

    const file$b = "node_modules\\@event-calendar\\core\\src\\Buttons.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (52:27) 
    function create_if_block_5$1(ctx) {
    	let button;
    	let t_value = /*$buttonText*/ ctx[5][/*button*/ ctx[25]] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[22](/*button*/ ctx[25]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);

    			attr_dev(button, "class", button_class_value = "" + (/*$theme*/ ctx[3].button + (/*$view*/ ctx[7] === /*button*/ ctx[25]
    			? ' ' + /*$theme*/ ctx[3].active
    			: '') + " ec-" + /*button*/ ctx[25]));

    			add_location(button, file$b, 52, 8, 1856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$buttonText, buttons*/ 33 && t_value !== (t_value = /*$buttonText*/ ctx[5][/*button*/ ctx[25]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$theme, $view, buttons*/ 137 && button_class_value !== (button_class_value = "" + (/*$theme*/ ctx[3].button + (/*$view*/ ctx[7] === /*button*/ ctx[25]
    			? ' ' + /*$theme*/ ctx[3].active
    			: '') + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(52:27) ",
    		ctx
    	});

    	return block;
    }

    // (46:37) 
    function create_if_block_4$1(ctx) {
    	let button;
    	let button_class_value;
    	let setContent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");

    			attr_dev(button, "class", button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25] + (/*$customButtons*/ ctx[6][/*button*/ ctx[25]].active
    			? ' ' + /*$theme*/ ctx[3].active
    			: '')));

    			add_location(button, file$b, 46, 8, 1578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*$customButtons*/ ctx[6][/*button*/ ctx[25]].click)) /*$customButtons*/ ctx[6][/*button*/ ctx[25]].click.apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					action_destroyer(setContent_action = setContent.call(null, button, /*$customButtons*/ ctx[6][/*button*/ ctx[25]].text))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$theme, buttons, $customButtons*/ 73 && button_class_value !== (button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25] + (/*$customButtons*/ ctx[6][/*button*/ ctx[25]].active
    			? ' ' + /*$theme*/ ctx[3].active
    			: '')))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty & /*$customButtons, buttons*/ 65) setContent_action.update.call(null, /*$customButtons*/ ctx[6][/*button*/ ctx[25]].text);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(46:37) ",
    		ctx
    	});

    	return block;
    }

    // (40:32) 
    function create_if_block_3$2(ctx) {
    	let button;
    	let t_value = /*$buttonText*/ ctx[5][/*button*/ ctx[25]] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]));
    			button.disabled = /*isToday*/ ctx[1];
    			add_location(button, file$b, 40, 8, 1351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[21], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$buttonText, buttons*/ 33 && t_value !== (t_value = /*$buttonText*/ ctx[5][/*button*/ ctx[25]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$theme, buttons*/ 9 && button_class_value !== (button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*isToday*/ 2) {
    				prop_dev(button, "disabled", /*isToday*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(40:32) ",
    		ctx
    	});

    	return block;
    }

    // (33:31) 
    function create_if_block_2$2(ctx) {
    	let button;
    	let i;
    	let i_class_value;
    	let button_class_value;
    	let button_aria_label_value;
    	let button_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (/*$theme*/ ctx[3].icon + " ec-" + /*button*/ ctx[25]));
    			add_location(i, file$b, 38, 9, 1259);
    			attr_dev(button, "class", button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]));
    			attr_dev(button, "aria-label", button_aria_label_value = /*$buttonText*/ ctx[5].next);
    			attr_dev(button, "title", button_title_value = /*$buttonText*/ ctx[5].next);
    			add_location(button, file$b, 33, 8, 1087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[19], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$theme, buttons*/ 9 && i_class_value !== (i_class_value = "" + (/*$theme*/ ctx[3].icon + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*$theme, buttons*/ 9 && button_class_value !== (button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*$buttonText*/ 32 && button_aria_label_value !== (button_aria_label_value = /*$buttonText*/ ctx[5].next)) {
    				attr_dev(button, "aria-label", button_aria_label_value);
    			}

    			if (dirty & /*$buttonText*/ 32 && button_title_value !== (button_title_value = /*$buttonText*/ ctx[5].next)) {
    				attr_dev(button, "title", button_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(33:31) ",
    		ctx
    	});

    	return block;
    }

    // (26:31) 
    function create_if_block_1$2(ctx) {
    	let button;
    	let i;
    	let i_class_value;
    	let button_class_value;
    	let button_aria_label_value;
    	let button_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (/*$theme*/ ctx[3].icon + " ec-" + /*button*/ ctx[25]));
    			add_location(i, file$b, 31, 9, 996);
    			attr_dev(button, "class", button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]));
    			attr_dev(button, "aria-label", button_aria_label_value = /*$buttonText*/ ctx[5].prev);
    			attr_dev(button, "title", button_title_value = /*$buttonText*/ ctx[5].prev);
    			add_location(button, file$b, 26, 8, 824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*prev*/ ctx[18], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$theme, buttons*/ 9 && i_class_value !== (i_class_value = "" + (/*$theme*/ ctx[3].icon + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*$theme, buttons*/ 9 && button_class_value !== (button_class_value = "" + (/*$theme*/ ctx[3].button + " ec-" + /*button*/ ctx[25]))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*$buttonText*/ 32 && button_aria_label_value !== (button_aria_label_value = /*$buttonText*/ ctx[5].prev)) {
    				attr_dev(button, "aria-label", button_aria_label_value);
    			}

    			if (dirty & /*$buttonText*/ 32 && button_title_value !== (button_title_value = /*$buttonText*/ ctx[5].prev)) {
    				attr_dev(button, "title", button_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(26:31) ",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if button == 'title'}
    function create_if_block$4(ctx) {
    	let h2;
    	let h2_class_value;
    	let setContent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			attr_dev(h2, "class", h2_class_value = /*$theme*/ ctx[3].title);
    			add_location(h2, file$b, 24, 8, 722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setContent_action = setContent.call(null, h2, /*$_viewTitle*/ ctx[4]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$theme*/ 8 && h2_class_value !== (h2_class_value = /*$theme*/ ctx[3].title)) {
    				attr_dev(h2, "class", h2_class_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty & /*$_viewTitle*/ 16) setContent_action.update.call(null, /*$_viewTitle*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(23:4) {#if button == 'title'}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#each buttons as button}
    function create_each_block$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[25] == 'title') return create_if_block$4;
    		if (/*button*/ ctx[25] == 'prev') return create_if_block_1$2;
    		if (/*button*/ ctx[25] == 'next') return create_if_block_2$2;
    		if (/*button*/ ctx[25] == 'today') return create_if_block_3$2;
    		if (/*$customButtons*/ ctx[6][/*button*/ ctx[25]]) return create_if_block_4$1;
    		if (/*button*/ ctx[25] != '') return create_if_block_5$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(22:0) {#each buttons as button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let each_1_anchor;
    	let each_value = /*buttons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$theme, $_viewTitle, buttons, $buttonText, prev, next, isToday, $date, cloneDate, today, $customButtons, $view*/ 917759) {
    				each_value = /*buttons*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $duration;
    	let $date;
    	let $hiddenDays;
    	let $_currentRange;
    	let $theme;
    	let $_viewTitle;
    	let $buttonText;
    	let $customButtons;
    	let $view;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Buttons', slots, []);
    	let { buttons } = $$props;
    	let { _currentRange, _viewTitle, buttonText, customButtons, date, duration, hiddenDays, theme, view } = getContext('state');
    	validate_store(_currentRange, '_currentRange');
    	component_subscribe($$self, _currentRange, value => $$invalidate(20, $_currentRange = value));
    	validate_store(_viewTitle, '_viewTitle');
    	component_subscribe($$self, _viewTitle, value => $$invalidate(4, $_viewTitle = value));
    	validate_store(buttonText, 'buttonText');
    	component_subscribe($$self, buttonText, value => $$invalidate(5, $buttonText = value));
    	validate_store(customButtons, 'customButtons');
    	component_subscribe($$self, customButtons, value => $$invalidate(6, $customButtons = value));
    	validate_store(date, 'date');
    	component_subscribe($$self, date, value => $$invalidate(2, $date = value));
    	validate_store(duration, 'duration');
    	component_subscribe($$self, duration, value => $$invalidate(23, $duration = value));
    	validate_store(hiddenDays, 'hiddenDays');
    	component_subscribe($$self, hiddenDays, value => $$invalidate(24, $hiddenDays = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(3, $theme = value));
    	validate_store(view, 'view');
    	component_subscribe($$self, view, value => $$invalidate(7, $view = value));
    	let today = setMidnight(createDate()), isToday;

    	function prev() {
    		set_store_value(date, $date = prevDate($date, $duration, $hiddenDays), $date);
    	}

    	function next() {
    		set_store_value(date, $date = nextDate($date, $duration), $date);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (buttons === undefined && !('buttons' in $$props || $$self.$$.bound[$$self.$$.props['buttons']])) {
    			console.warn("<Buttons> was created without expected prop 'buttons'");
    		}
    	});

    	const writable_props = ['buttons'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(date, $date = cloneDate(today), $date);
    	const click_handler_1 = button => set_store_value(view, $view = button, $view);

    	$$self.$$set = $$props => {
    		if ('buttons' in $$props) $$invalidate(0, buttons = $$props.buttons);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createDate,
    		cloneDate,
    		setContent,
    		setMidnight,
    		nextDate,
    		prevDate,
    		buttons,
    		_currentRange,
    		_viewTitle,
    		buttonText,
    		customButtons,
    		date,
    		duration,
    		hiddenDays,
    		theme,
    		view,
    		today,
    		isToday,
    		prev,
    		next,
    		$duration,
    		$date,
    		$hiddenDays,
    		$_currentRange,
    		$theme,
    		$_viewTitle,
    		$buttonText,
    		$customButtons,
    		$view
    	});

    	$$self.$inject_state = $$props => {
    		if ('buttons' in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ('_currentRange' in $$props) $$invalidate(8, _currentRange = $$props._currentRange);
    		if ('_viewTitle' in $$props) $$invalidate(9, _viewTitle = $$props._viewTitle);
    		if ('buttonText' in $$props) $$invalidate(10, buttonText = $$props.buttonText);
    		if ('customButtons' in $$props) $$invalidate(11, customButtons = $$props.customButtons);
    		if ('date' in $$props) $$invalidate(12, date = $$props.date);
    		if ('duration' in $$props) $$invalidate(13, duration = $$props.duration);
    		if ('hiddenDays' in $$props) $$invalidate(14, hiddenDays = $$props.hiddenDays);
    		if ('theme' in $$props) $$invalidate(15, theme = $$props.theme);
    		if ('view' in $$props) $$invalidate(16, view = $$props.view);
    		if ('today' in $$props) $$invalidate(17, today = $$props.today);
    		if ('isToday' in $$props) $$invalidate(1, isToday = $$props.isToday);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$_currentRange*/ 1048576) {
    			$$invalidate(1, isToday = today >= $_currentRange.start && today < $_currentRange.end || null);
    		}
    	};

    	return [
    		buttons,
    		isToday,
    		$date,
    		$theme,
    		$_viewTitle,
    		$buttonText,
    		$customButtons,
    		$view,
    		_currentRange,
    		_viewTitle,
    		buttonText,
    		customButtons,
    		date,
    		duration,
    		hiddenDays,
    		theme,
    		view,
    		today,
    		prev,
    		next,
    		$_currentRange,
    		click_handler,
    		click_handler_1
    	];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { buttons: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get buttons() {
    		throw new Error("<Buttons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttons(value) {
    		throw new Error("<Buttons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@event-calendar\core\src\Toolbar.svelte generated by Svelte v3.59.2 */
    const file$a = "node_modules\\@event-calendar\\core\\src\\Toolbar.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (29:16) {:else}
    function create_else_block$1(ctx) {
    	let buttons;
    	let current;

    	buttons = new Buttons({
    			props: { buttons: /*buttons*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(buttons.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttons, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttons_changes = {};
    			if (dirty & /*sections*/ 1) buttons_changes.buttons = /*buttons*/ ctx[8];
    			buttons.$set(buttons_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttons, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(29:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:16) {#if buttons.length > 1}
    function create_if_block$3(ctx) {
    	let div;
    	let buttons;
    	let div_class_value;
    	let current;

    	buttons = new Buttons({
    			props: { buttons: /*buttons*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(buttons.$$.fragment);
    			attr_dev(div, "class", div_class_value = /*$theme*/ ctx[1].buttonGroup);
    			add_location(div, file$a, 25, 20, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(buttons, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttons_changes = {};
    			if (dirty & /*sections*/ 1) buttons_changes.buttons = /*buttons*/ ctx[8];
    			buttons.$set(buttons_changes);

    			if (!current || dirty & /*$theme*/ 2 && div_class_value !== (div_class_value = /*$theme*/ ctx[1].buttonGroup)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(buttons);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:16) {#if buttons.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (24:12) {#each sections[key] as buttons}
    function create_each_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*buttons*/ ctx[8].length > 1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(24:12) {#each sections[key] as buttons}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#each keys(sections) as key}
    function create_each_block$8(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let each_value_1 = /*sections*/ ctx[0][/*key*/ ctx[5]];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", div_class_value = "ec-" + /*key*/ ctx[5]);
    			add_location(div, file$a, 22, 8, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$theme, sections, keys*/ 3) {
    				each_value_1 = /*sections*/ ctx[0][/*key*/ ctx[5]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*sections*/ 1 && div_class_value !== (div_class_value = "ec-" + /*key*/ ctx[5])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(22:4) {#each keys(sections) as key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let nav;
    	let nav_class_value;
    	let current;
    	let each_value = keys(/*sections*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(nav, "class", nav_class_value = /*$theme*/ ctx[1].toolbar);
    			add_location(nav, file$a, 20, 0, 436);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(nav, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*keys, sections, $theme*/ 3) {
    				each_value = keys(/*sections*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(nav, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$theme*/ 2 && nav_class_value !== (nav_class_value = /*$theme*/ ctx[1].toolbar)) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $headerToolbar;
    	let $theme;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toolbar', slots, []);
    	let { headerToolbar, theme } = getContext('state');
    	validate_store(headerToolbar, 'headerToolbar');
    	component_subscribe($$self, headerToolbar, value => $$invalidate(4, $headerToolbar = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(1, $theme = value));
    	let sections = { start: [], center: [], end: [] };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toolbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		keys,
    		Buttons,
    		headerToolbar,
    		theme,
    		sections,
    		$headerToolbar,
    		$theme
    	});

    	$$self.$inject_state = $$props => {
    		if ('headerToolbar' in $$props) $$invalidate(2, headerToolbar = $$props.headerToolbar);
    		if ('theme' in $$props) $$invalidate(3, theme = $$props.theme);
    		if ('sections' in $$props) $$invalidate(0, sections = $$props.sections);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sections, $headerToolbar*/ 17) {
    			{
    				for (let key of keys(sections)) {
    					$$invalidate(0, sections[key] = $headerToolbar[key].split(' ').map(group => group.split(',')), sections);
    				}
    			}
    		}
    	};

    	return [sections, $theme, headerToolbar, theme, $headerToolbar];
    }

    class Toolbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolbar",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules\@event-calendar\core\src\Auxiliary.svelte generated by Svelte v3.59.2 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (24:0) {#each $_auxiliary as component}
    function create_each_block$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[11];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_auxiliary*/ 1 && switch_value !== (switch_value = /*component*/ ctx[11])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(24:0) {#each $_auxiliary as component}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$_auxiliary*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_auxiliary*/ 1) {
    				each_value = /*$_auxiliary*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $_view;
    	let $datesSet;
    	let $_activeRange;
    	let $_auxiliary;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Auxiliary', slots, []);
    	let { datesSet, _auxiliary, _activeRange, _queue, _view } = getContext('state');
    	validate_store(datesSet, 'datesSet');
    	component_subscribe($$self, datesSet, value => $$invalidate(7, $datesSet = value));
    	validate_store(_auxiliary, '_auxiliary');
    	component_subscribe($$self, _auxiliary, value => $$invalidate(0, $_auxiliary = value));
    	validate_store(_activeRange, '_activeRange');
    	component_subscribe($$self, _activeRange, value => $$invalidate(5, $_activeRange = value));
    	validate_store(_view, '_view');
    	component_subscribe($$self, _view, value => $$invalidate(6, $_view = value));
    	let debounceHandle = {};

    	function runDatesSet(_activeRange) {
    		if (isFunction($datesSet)) {
    			debounce(
    				() => $datesSet({
    					start: toLocalDate(_activeRange.start),
    					end: toLocalDate(_activeRange.end),
    					startStr: toISOString(_activeRange.start),
    					endStr: toISOString(_activeRange.end),
    					view: toViewWithLocalDates($_view)
    				}),
    				debounceHandle,
    				_queue
    			);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Auxiliary> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		debounce,
    		toISOString,
    		toLocalDate,
    		toViewWithLocalDates,
    		isFunction,
    		datesSet,
    		_auxiliary,
    		_activeRange,
    		_queue,
    		_view,
    		debounceHandle,
    		runDatesSet,
    		$_view,
    		$datesSet,
    		$_activeRange,
    		$_auxiliary
    	});

    	$$self.$inject_state = $$props => {
    		if ('datesSet' in $$props) $$invalidate(1, datesSet = $$props.datesSet);
    		if ('_auxiliary' in $$props) $$invalidate(2, _auxiliary = $$props._auxiliary);
    		if ('_activeRange' in $$props) $$invalidate(3, _activeRange = $$props._activeRange);
    		if ('_queue' in $$props) _queue = $$props._queue;
    		if ('_view' in $$props) $$invalidate(4, _view = $$props._view);
    		if ('debounceHandle' in $$props) debounceHandle = $$props.debounceHandle;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$_activeRange*/ 32) {
    			// Set up datesSet callback
    			runDatesSet($_activeRange);
    		}
    	};

    	return [$_auxiliary, datesSet, _auxiliary, _activeRange, _view, $_activeRange];
    }

    class Auxiliary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auxiliary",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules\@event-calendar\core\src\Calendar.svelte generated by Svelte v3.59.2 */

    const file$9 = "node_modules\\@event-calendar\\core\\src\\Calendar.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let toolbar;
    	let t0;
    	let switch_instance;
    	let div_class_value;
    	let div_role_value;
    	let t1;
    	let auxiliary;
    	let current;
    	let mounted;
    	let dispose;
    	toolbar = new Toolbar({ $$inline: true });
    	var switch_value = /*$_viewComponent*/ ctx[5];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	auxiliary = new Auxiliary({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(toolbar.$$.fragment);
    			t0 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t1 = space();
    			create_component(auxiliary.$$.fragment);

    			attr_dev(div, "class", div_class_value = "" + (/*$theme*/ ctx[1].calendar + " " + /*$theme*/ ctx[1].view + (/*$_scrollable*/ ctx[0]
    			? ' ' + /*$theme*/ ctx[1].withScroll
    			: '') + (/*$_iClass*/ ctx[2]
    			? ' ' + /*$theme*/ ctx[1][/*$_iClass*/ ctx[2]]
    			: '')));

    			attr_dev(div, "role", div_role_value = listView(/*$view*/ ctx[4]) ? 'list' : 'table');
    			set_style(div, "height", /*$height*/ ctx[3]);
    			add_location(div, file$9, 139, 0, 3531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(toolbar, div, null);
    			append_dev(div, t0);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(auxiliary, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*recheckScrollable*/ ctx[20], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$_viewComponent*/ 32 && switch_value !== (switch_value = /*$_viewComponent*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty[0] & /*$theme, $_scrollable, $_iClass*/ 7 && div_class_value !== (div_class_value = "" + (/*$theme*/ ctx[1].calendar + " " + /*$theme*/ ctx[1].view + (/*$_scrollable*/ ctx[0]
    			? ' ' + /*$theme*/ ctx[1].withScroll
    			: '') + (/*$_iClass*/ ctx[2]
    			? ' ' + /*$theme*/ ctx[1][/*$_iClass*/ ctx[2]]
    			: '')))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*$view*/ 16 && div_role_value !== (div_role_value = listView(/*$view*/ ctx[4]) ? 'list' : 'table')) {
    				attr_dev(div, "role", div_role_value);
    			}

    			if (dirty[0] & /*$height*/ 8) {
    				set_style(div, "height", /*$height*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(auxiliary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbar.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(auxiliary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(toolbar);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching) detach_dev(t1);
    			destroy_component(auxiliary, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $_bodyEl;
    	let $_scrollable;
    	let $_queue2;
    	let $_queue;
    	let $hiddenDays;
    	let $duration;
    	let $date;
    	let $_interaction;
    	let $_events;
    	let $theme;
    	let $_iClass;
    	let $height;
    	let $view;
    	let $_viewComponent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calendar', slots, []);
    	let { plugins = [] } = $$props;
    	let { options = {} } = $$props;
    	let state = new State(plugins, options);
    	setContext('state', state);
    	let { _viewComponent, _bodyEl, _interaction, _iClass, _events, _queue, _queue2, _tasks, _scrollable, date, duration, hiddenDays, height, theme, view } = state;
    	validate_store(_viewComponent, '_viewComponent');
    	component_subscribe($$self, _viewComponent, value => $$invalidate(5, $_viewComponent = value));
    	validate_store(_bodyEl, '_bodyEl');
    	component_subscribe($$self, _bodyEl, value => $$invalidate(36, $_bodyEl = value));
    	validate_store(_interaction, '_interaction');
    	component_subscribe($$self, _interaction, value => $$invalidate(42, $_interaction = value));
    	validate_store(_iClass, '_iClass');
    	component_subscribe($$self, _iClass, value => $$invalidate(2, $_iClass = value));
    	validate_store(_events, '_events');
    	component_subscribe($$self, _events, value => $$invalidate(43, $_events = value));
    	validate_store(_queue, '_queue');
    	component_subscribe($$self, _queue, value => $$invalidate(38, $_queue = value));
    	validate_store(_queue2, '_queue2');
    	component_subscribe($$self, _queue2, value => $$invalidate(37, $_queue2 = value));
    	validate_store(_scrollable, '_scrollable');
    	component_subscribe($$self, _scrollable, value => $$invalidate(0, $_scrollable = value));
    	validate_store(date, 'date');
    	component_subscribe($$self, date, value => $$invalidate(41, $date = value));
    	validate_store(duration, 'duration');
    	component_subscribe($$self, duration, value => $$invalidate(40, $duration = value));
    	validate_store(hiddenDays, 'hiddenDays');
    	component_subscribe($$self, hiddenDays, value => $$invalidate(39, $hiddenDays = value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(3, $height = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(1, $theme = value));
    	validate_store(view, 'view');
    	component_subscribe($$self, view, value => $$invalidate(4, $view = value));

    	// Reactively update options that did change
    	let prevOptions = { ...options };

    	function setOption(name, value) {
    		state._set(name, value);
    		return this;
    	}

    	function getOption(name) {
    		let value = state._get(name);
    		return value instanceof Date ? toLocalDate(value) : value;
    	}

    	function refetchEvents() {
    		state._fetchedRange.set({ start: undefined, end: undefined });
    		return this;
    	}

    	function getEvents() {
    		return $_events.map(toEventWithLocalDates);
    	}

    	function getEventById(id) {
    		for (let event of $_events) {
    			if (event.id == id) {
    				return toEventWithLocalDates(event);
    			}
    		}

    		return null;
    	}

    	function addEvent(event) {
    		event = createEvents([event])[0];
    		$_events.push(event);
    		_events.set($_events);
    		return event;
    	}

    	function updateEvent(event) {
    		for (let e of $_events) {
    			if (e.id == event.id) {
    				event = createEvents([event])[0];
    				assign(e, event);
    				_events.set($_events);
    				return event;
    			}
    		}

    		return null;
    	}

    	function removeEventById(id) {
    		let idx = $_events.findIndex(event => event.id == id);

    		if (idx >= 0) {
    			$_events.splice(idx, 1);
    			_events.set($_events);
    		}

    		return this;
    	}

    	function getView() {
    		return toViewWithLocalDates(get_store_value(state._view));
    	}

    	function unselect() {
    		$_interaction.action?.unselect();
    		return this;
    	}

    	function dateFromPoint(x, y) {
    		let dayEl = getElementWithPayload(x, y);

    		if (dayEl) {
    			let info = getPayload(dayEl)(x, y);
    			info.date = toLocalDate(info.date);
    			return info;
    		}

    		return null;
    	}

    	function next() {
    		set_store_value(date, $date = nextDate($date, $duration), $date);
    		return this;
    	}

    	function prev() {
    		set_store_value(date, $date = prevDate($date, $duration, $hiddenDays), $date);
    		return this;
    	}

    	beforeUpdate(() => {
    		flushDebounce($_queue);
    	});

    	afterUpdate(() => {
    		flushDebounce($_queue2);
    		task(recheckScrollable, null, _tasks);
    	});

    	function recheckScrollable() {
    		if ($_bodyEl) {
    			set_store_value(_scrollable, $_scrollable = hasYScroll($_bodyEl), $_scrollable);
    		}
    	}

    	const writable_props = ['plugins', 'options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Calendar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('plugins' in $$props) $$invalidate(21, plugins = $$props.plugins);
    		if ('options' in $$props) $$invalidate(22, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		beforeUpdate,
    		afterUpdate,
    		get: get_store_value,
    		diff,
    		State,
    		Toolbar,
    		Auxiliary,
    		assign,
    		createEvents,
    		toEventWithLocalDates,
    		toViewWithLocalDates,
    		toLocalDate,
    		getElementWithPayload,
    		getPayload,
    		flushDebounce,
    		hasYScroll,
    		listView,
    		task,
    		prevDate,
    		nextDate,
    		plugins,
    		options,
    		state,
    		_viewComponent,
    		_bodyEl,
    		_interaction,
    		_iClass,
    		_events,
    		_queue,
    		_queue2,
    		_tasks,
    		_scrollable,
    		date,
    		duration,
    		hiddenDays,
    		height,
    		theme,
    		view,
    		prevOptions,
    		setOption,
    		getOption,
    		refetchEvents,
    		getEvents,
    		getEventById,
    		addEvent,
    		updateEvent,
    		removeEventById,
    		getView,
    		unselect,
    		dateFromPoint,
    		next,
    		prev,
    		recheckScrollable,
    		$_bodyEl,
    		$_scrollable,
    		$_queue2,
    		$_queue,
    		$hiddenDays,
    		$duration,
    		$date,
    		$_interaction,
    		$_events,
    		$theme,
    		$_iClass,
    		$height,
    		$view,
    		$_viewComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ('plugins' in $$props) $$invalidate(21, plugins = $$props.plugins);
    		if ('options' in $$props) $$invalidate(22, options = $$props.options);
    		if ('state' in $$props) state = $$props.state;
    		if ('_viewComponent' in $$props) $$invalidate(6, _viewComponent = $$props._viewComponent);
    		if ('_bodyEl' in $$props) $$invalidate(7, _bodyEl = $$props._bodyEl);
    		if ('_interaction' in $$props) $$invalidate(8, _interaction = $$props._interaction);
    		if ('_iClass' in $$props) $$invalidate(9, _iClass = $$props._iClass);
    		if ('_events' in $$props) $$invalidate(10, _events = $$props._events);
    		if ('_queue' in $$props) $$invalidate(11, _queue = $$props._queue);
    		if ('_queue2' in $$props) $$invalidate(12, _queue2 = $$props._queue2);
    		if ('_tasks' in $$props) _tasks = $$props._tasks;
    		if ('_scrollable' in $$props) $$invalidate(13, _scrollable = $$props._scrollable);
    		if ('date' in $$props) $$invalidate(14, date = $$props.date);
    		if ('duration' in $$props) $$invalidate(15, duration = $$props.duration);
    		if ('hiddenDays' in $$props) $$invalidate(16, hiddenDays = $$props.hiddenDays);
    		if ('height' in $$props) $$invalidate(17, height = $$props.height);
    		if ('theme' in $$props) $$invalidate(18, theme = $$props.theme);
    		if ('view' in $$props) $$invalidate(19, view = $$props.view);
    		if ('prevOptions' in $$props) $$invalidate(46, prevOptions = $$props.prevOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*options*/ 4194304) {
    			for (let [name, value] of diff(options, prevOptions)) {
    				setOption(name, value);
    			}
    		}
    	};

    	return [
    		$_scrollable,
    		$theme,
    		$_iClass,
    		$height,
    		$view,
    		$_viewComponent,
    		_viewComponent,
    		_bodyEl,
    		_interaction,
    		_iClass,
    		_events,
    		_queue,
    		_queue2,
    		_scrollable,
    		date,
    		duration,
    		hiddenDays,
    		height,
    		theme,
    		view,
    		recheckScrollable,
    		plugins,
    		options,
    		setOption,
    		getOption,
    		refetchEvents,
    		getEvents,
    		getEventById,
    		addEvent,
    		updateEvent,
    		removeEventById,
    		getView,
    		unselect,
    		dateFromPoint,
    		next,
    		prev
    	];
    }

    class Calendar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				plugins: 21,
    				options: 22,
    				setOption: 23,
    				getOption: 24,
    				refetchEvents: 25,
    				getEvents: 26,
    				getEventById: 27,
    				addEvent: 28,
    				updateEvent: 29,
    				removeEventById: 30,
    				getView: 31,
    				unselect: 32,
    				dateFromPoint: 33,
    				next: 34,
    				prev: 35
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calendar",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get plugins() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set plugins(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Calendar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOption() {
    		return this.$$.ctx[23];
    	}

    	set setOption(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOption() {
    		return this.$$.ctx[24];
    	}

    	set getOption(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get refetchEvents() {
    		return this.$$.ctx[25];
    	}

    	set refetchEvents(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getEvents() {
    		return this.$$.ctx[26];
    	}

    	set getEvents(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getEventById() {
    		return this.$$.ctx[27];
    	}

    	set getEventById(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addEvent() {
    		return this.$$.ctx[28];
    	}

    	set addEvent(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateEvent() {
    		return this.$$.ctx[29];
    	}

    	set updateEvent(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeEventById() {
    		return this.$$.ctx[30];
    	}

    	set removeEventById(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getView() {
    		return this.$$.ctx[31];
    	}

    	set getView(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unselect() {
    		return this.$$.ctx[32];
    	}

    	set unselect(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dateFromPoint() {
    		return this.$$.ctx[33];
    	}

    	set dateFromPoint(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[34];
    	}

    	set next(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		return this.$$.ctx[35];
    	}

    	set prev(value) {
    		throw new Error("<Calendar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function days(state) {
        return derived([state.date, state.firstDay, state.hiddenDays], ([$date, $firstDay, $hiddenDays]) => {
            let days = [];
            let day = cloneDate($date);
            let max = 7;
            // First day of week
            while (day.getUTCDay() !== $firstDay && max) {
                subtractDay(day);
                --max;
            }
            for (let i = 0; i < 7; ++i) {
                if (!$hiddenDays.includes(day.getUTCDay())) {
                    days.push(cloneDate(day));
                }
                addDay(day);
            }

            return days;
        });
    }

    /* node_modules\@event-calendar\day-grid\src\Header.svelte generated by Svelte v3.59.2 */
    const file$8 = "node_modules\\@event-calendar\\day-grid\\src\\Header.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (10:8) {#each $_days as day}
    function create_each_block$6(ctx) {
    	let div;
    	let span;
    	let span_aria_label_value;
    	let setContent_action;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = space();
    			attr_dev(span, "aria-label", span_aria_label_value = /*$_intlDayHeaderAL*/ ctx[2].format(/*day*/ ctx[8]));
    			add_location(span, file$8, 11, 16, 408);
    			attr_dev(div, "class", div_class_value = "" + (/*$theme*/ ctx[0].day + " " + /*$theme*/ ctx[0].weekdays?.[/*day*/ ctx[8].getUTCDay()]));
    			attr_dev(div, "role", "columnheader");
    			add_location(div, file$8, 10, 12, 308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = action_destroyer(setContent_action = setContent.call(null, span, /*$_intlDayHeader*/ ctx[3].format(/*day*/ ctx[8])));
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$_intlDayHeaderAL, $_days*/ 6 && span_aria_label_value !== (span_aria_label_value = /*$_intlDayHeaderAL*/ ctx[2].format(/*day*/ ctx[8]))) {
    				attr_dev(span, "aria-label", span_aria_label_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty & /*$_intlDayHeader, $_days*/ 10) setContent_action.update.call(null, /*$_intlDayHeader*/ ctx[3].format(/*day*/ ctx[8]));

    			if (dirty & /*$theme, $_days*/ 3 && div_class_value !== (div_class_value = "" + (/*$theme*/ ctx[0].day + " " + /*$theme*/ ctx[0].weekdays?.[/*day*/ ctx[8].getUTCDay()]))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(10:8) {#each $_days as day}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let div0_class_value;
    	let t;
    	let div1;
    	let div1_class_value;
    	let div2_class_value;
    	let each_value = /*$_days*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", div0_class_value = /*$theme*/ ctx[0].days);
    			attr_dev(div0, "role", "row");
    			add_location(div0, file$8, 8, 4, 227);
    			attr_dev(div1, "class", div1_class_value = /*$theme*/ ctx[0].hiddenScroll);
    			add_location(div1, file$8, 18, 4, 619);
    			attr_dev(div2, "class", div2_class_value = /*$theme*/ ctx[0].header);
    			add_location(div2, file$8, 7, 0, 193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$theme, $_days, $_intlDayHeaderAL, $_intlDayHeader*/ 15) {
    				each_value = /*$_days*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$theme*/ 1 && div0_class_value !== (div0_class_value = /*$theme*/ ctx[0].days)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$theme*/ 1 && div1_class_value !== (div1_class_value = /*$theme*/ ctx[0].hiddenScroll)) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$theme*/ 1 && div2_class_value !== (div2_class_value = /*$theme*/ ctx[0].header)) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $theme;
    	let $_days;
    	let $_intlDayHeaderAL;
    	let $_intlDayHeader;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { theme, _intlDayHeader, _intlDayHeaderAL, _days } = getContext('state');
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(0, $theme = value));
    	validate_store(_intlDayHeader, '_intlDayHeader');
    	component_subscribe($$self, _intlDayHeader, value => $$invalidate(3, $_intlDayHeader = value));
    	validate_store(_intlDayHeaderAL, '_intlDayHeaderAL');
    	component_subscribe($$self, _intlDayHeaderAL, value => $$invalidate(2, $_intlDayHeaderAL = value));
    	validate_store(_days, '_days');
    	component_subscribe($$self, _days, value => $$invalidate(1, $_days = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		setContent,
    		theme,
    		_intlDayHeader,
    		_intlDayHeaderAL,
    		_days,
    		$theme,
    		$_days,
    		$_intlDayHeaderAL,
    		$_intlDayHeader
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(4, theme = $$props.theme);
    		if ('_intlDayHeader' in $$props) $$invalidate(5, _intlDayHeader = $$props._intlDayHeader);
    		if ('_intlDayHeaderAL' in $$props) $$invalidate(6, _intlDayHeaderAL = $$props._intlDayHeaderAL);
    		if ('_days' in $$props) $$invalidate(7, _days = $$props._days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$theme,
    		$_days,
    		$_intlDayHeaderAL,
    		$_intlDayHeader,
    		theme,
    		_intlDayHeader,
    		_intlDayHeaderAL,
    		_days
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\Event.svelte generated by Svelte v3.59.2 */

    const file$7 = "node_modules\\@event-calendar\\day-grid\\src\\Event.svelte";

    function create_fragment$8(ctx) {
    	let article;
    	let div;
    	let div_class_value;
    	let setContent_action;
    	let t;
    	let switch_instance;
    	let article_role_value;
    	let article_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*$_interaction*/ ctx[8].resizer;

    	function switch_props(ctx) {
    		return {
    			props: { event: /*event*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));

    		switch_instance.$on("pointerdown", function () {
    			if (is_function(/*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8], 'x'))) /*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8], 'x').apply(this, arguments);
    		});
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", div_class_value = /*$theme*/ ctx[2].eventBody);
    			add_location(div, file$7, 188, 4, 5807);
    			attr_dev(article, "class", /*classes*/ ctx[4]);
    			attr_dev(article, "style", /*style*/ ctx[5]);
    			attr_dev(article, "role", article_role_value = /*onclick*/ ctx[7] ? 'button' : undefined);
    			attr_dev(article, "tabindex", article_tabindex_value = /*onclick*/ ctx[7] ? 0 : undefined);
    			add_location(article, file$7, 176, 0, 5371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(article, t);
    			if (switch_instance) mount_component(switch_instance, article, null);
    			/*article_binding*/ ctx[51](article);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(setContent_action = setContent.call(null, div, /*content*/ ctx[6])),
    					listen_dev(
    						article,
    						"click",
    						function () {
    							if (is_function(/*onclick*/ ctx[7] || undefined)) (/*onclick*/ ctx[7] || undefined).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						article,
    						"keydown",
    						function () {
    							if (is_function(/*onclick*/ ctx[7] && keyEnter(/*onclick*/ ctx[7]))) (/*onclick*/ ctx[7] && keyEnter(/*onclick*/ ctx[7])).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						article,
    						"mouseenter",
    						function () {
    							if (is_function(/*createHandler*/ ctx[31](/*$eventMouseEnter*/ ctx[9], /*display*/ ctx[1]))) /*createHandler*/ ctx[31](/*$eventMouseEnter*/ ctx[9], /*display*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						article,
    						"mouseleave",
    						function () {
    							if (is_function(/*createHandler*/ ctx[31](/*$eventMouseLeave*/ ctx[10], /*display*/ ctx[1]))) /*createHandler*/ ctx[31](/*$eventMouseLeave*/ ctx[10], /*display*/ ctx[1]).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						article,
    						"pointerdown",
    						function () {
    							if (is_function(!helperEvent(/*display*/ ctx[1]) && /*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8]))) (!helperEvent(/*display*/ ctx[1]) && /*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8])).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*$theme*/ 4 && div_class_value !== (div_class_value = /*$theme*/ ctx[2].eventBody)) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty[0] & /*content*/ 64) setContent_action.update.call(null, /*content*/ ctx[6]);
    			const switch_instance_changes = {};
    			if (dirty[0] & /*event*/ 1) switch_instance_changes.event = /*event*/ ctx[0];

    			if (dirty[0] & /*$_interaction*/ 256 && switch_value !== (switch_value = /*$_interaction*/ ctx[8].resizer)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));

    					switch_instance.$on("pointerdown", function () {
    						if (is_function(/*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8], 'x'))) /*createDragHandler*/ ctx[32](/*$_interaction*/ ctx[8], 'x').apply(this, arguments);
    					});

    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, article, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*classes*/ 16) {
    				attr_dev(article, "class", /*classes*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*style*/ 32) {
    				attr_dev(article, "style", /*style*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*onclick*/ 128 && article_role_value !== (article_role_value = /*onclick*/ ctx[7] ? 'button' : undefined)) {
    				attr_dev(article, "role", article_role_value);
    			}

    			if (!current || dirty[0] & /*onclick*/ 128 && article_tabindex_value !== (article_tabindex_value = /*onclick*/ ctx[7] ? 0 : undefined)) {
    				attr_dev(article, "tabindex", article_tabindex_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (switch_instance) destroy_component(switch_instance);
    			/*article_binding*/ ctx[51](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $eventClick;
    	let $_hiddenEvents;
    	let $dayMaxEvents;
    	let $_popupDate;
    	let $_interaction;
    	let $_view;
    	let $eventAllUpdated;
    	let $eventDidMount;
    	let $_intlEventTime;
    	let $theme;
    	let $eventContent;
    	let $displayEventEnd;
    	let $eventClassNames;
    	let $_iClasses;
    	let $eventTextColor;
    	let $resources;
    	let $eventColor;
    	let $eventBackgroundColor;
    	let $eventMouseEnter;
    	let $eventMouseLeave;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Event', slots, []);
    	let { chunk } = $$props;
    	let { longChunks = {} } = $$props;
    	let { inPopup = false } = $$props;
    	let { dates = [] } = $$props;
    	let { dayMaxEvents, displayEventEnd, eventAllUpdated, eventBackgroundColor, eventTextColor, eventClick, eventColor, eventContent, eventClassNames, eventDidMount, eventMouseEnter, eventMouseLeave, resources, theme, _view, _intlEventTime, _interaction, _iClasses, _hiddenEvents, _popupDate, _tasks } = getContext('state');
    	validate_store(dayMaxEvents, 'dayMaxEvents');
    	component_subscribe($$self, dayMaxEvents, value => $$invalidate(54, $dayMaxEvents = value));
    	validate_store(displayEventEnd, 'displayEventEnd');
    	component_subscribe($$self, displayEventEnd, value => $$invalidate(44, $displayEventEnd = value));
    	validate_store(eventAllUpdated, 'eventAllUpdated');
    	component_subscribe($$self, eventAllUpdated, value => $$invalidate(56, $eventAllUpdated = value));
    	validate_store(eventBackgroundColor, 'eventBackgroundColor');
    	component_subscribe($$self, eventBackgroundColor, value => $$invalidate(50, $eventBackgroundColor = value));
    	validate_store(eventTextColor, 'eventTextColor');
    	component_subscribe($$self, eventTextColor, value => $$invalidate(47, $eventTextColor = value));
    	validate_store(eventClick, 'eventClick');
    	component_subscribe($$self, eventClick, value => $$invalidate(40, $eventClick = value));
    	validate_store(eventColor, 'eventColor');
    	component_subscribe($$self, eventColor, value => $$invalidate(49, $eventColor = value));
    	validate_store(eventContent, 'eventContent');
    	component_subscribe($$self, eventContent, value => $$invalidate(43, $eventContent = value));
    	validate_store(eventClassNames, 'eventClassNames');
    	component_subscribe($$self, eventClassNames, value => $$invalidate(45, $eventClassNames = value));
    	validate_store(eventDidMount, 'eventDidMount');
    	component_subscribe($$self, eventDidMount, value => $$invalidate(57, $eventDidMount = value));
    	validate_store(eventMouseEnter, 'eventMouseEnter');
    	component_subscribe($$self, eventMouseEnter, value => $$invalidate(9, $eventMouseEnter = value));
    	validate_store(eventMouseLeave, 'eventMouseLeave');
    	component_subscribe($$self, eventMouseLeave, value => $$invalidate(10, $eventMouseLeave = value));
    	validate_store(resources, 'resources');
    	component_subscribe($$self, resources, value => $$invalidate(48, $resources = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(2, $theme = value));
    	validate_store(_view, '_view');
    	component_subscribe($$self, _view, value => $$invalidate(41, $_view = value));
    	validate_store(_intlEventTime, '_intlEventTime');
    	component_subscribe($$self, _intlEventTime, value => $$invalidate(42, $_intlEventTime = value));
    	validate_store(_interaction, '_interaction');
    	component_subscribe($$self, _interaction, value => $$invalidate(8, $_interaction = value));
    	validate_store(_iClasses, '_iClasses');
    	component_subscribe($$self, _iClasses, value => $$invalidate(46, $_iClasses = value));
    	validate_store(_hiddenEvents, '_hiddenEvents');
    	component_subscribe($$self, _hiddenEvents, value => $$invalidate(53, $_hiddenEvents = value));
    	validate_store(_popupDate, '_popupDate');
    	component_subscribe($$self, _popupDate, value => $$invalidate(55, $_popupDate = value));
    	let el;
    	let event;
    	let classes;
    	let style;
    	let content;
    	let timeText;
    	let margin = 1;
    	let hidden = false;
    	let display;
    	let onclick;

    	onMount(() => {
    		if (isFunction($eventDidMount)) {
    			$eventDidMount({
    				event: toEventWithLocalDates(event),
    				timeText,
    				el,
    				view: toViewWithLocalDates($_view)
    			});
    		}
    	});

    	afterUpdate(() => {
    		if (isFunction($eventAllUpdated) && !helperEvent(display)) {
    			task(() => $eventAllUpdated({ view: toViewWithLocalDates($_view) }), 'eau', _tasks);
    		}
    	});

    	function createHandler(fn, display) {
    		return !helperEvent(display) && isFunction(fn)
    		? jsEvent => fn({
    				event: toEventWithLocalDates(event),
    				el,
    				jsEvent,
    				view: toViewWithLocalDates($_view)
    			})
    		: undefined;
    	}

    	function createDragHandler(interaction, resize) {
    		return interaction.action
    		? jsEvent => $_interaction.action.drag(event, jsEvent, resize, inPopup ? $_popupDate : null, [rect(el).top - rect(ancestor(el, 1)).top, dates])
    		: undefined;
    	}

    	function reposition() {
    		if (!el) {
    			return;
    		}

    		$$invalidate(38, margin = repositionEvent(chunk, longChunks, height(el)));

    		if ($dayMaxEvents === true) {
    			hide();
    		} else {
    			$$invalidate(39, hidden = false);
    		}
    	}

    	function hide() {
    		let dayEl = ancestor(el, 2);
    		let h = height(dayEl) - height(dayEl.firstElementChild) - footHeight(dayEl);
    		$$invalidate(39, hidden = chunk.bottom > h);
    		let update = false;

    		// Hide or show the event throughout all days
    		for (let date of chunk.dates) {
    			let hiddenEvents = $_hiddenEvents[date.getTime()];

    			if (hiddenEvents) {
    				let size = hiddenEvents.size;

    				if (hidden) {
    					hiddenEvents.add(chunk.event);
    				} else {
    					hiddenEvents.delete(chunk.event);
    				}

    				if (size !== hiddenEvents.size) {
    					update = true;
    				}
    			}
    		}

    		if (update) {
    			_hiddenEvents.set($_hiddenEvents);
    		}
    	}

    	function footHeight(dayEl) {
    		let h = 0;

    		for (let i = 0; i < chunk.days; ++i) {
    			h = max(h, height(dayEl.lastElementChild));
    			dayEl = dayEl.nextElementSibling;

    			if (!dayEl) {
    				break;
    			}
    		}

    		return h;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (chunk === undefined && !('chunk' in $$props || $$self.$$.bound[$$self.$$.props['chunk']])) {
    			console.warn("<Event> was created without expected prop 'chunk'");
    		}
    	});

    	const writable_props = ['chunk', 'longChunks', 'inPopup', 'dates'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Event> was created with unknown prop '${key}'`);
    	});

    	function article_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(3, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('chunk' in $$props) $$invalidate(33, chunk = $$props.chunk);
    		if ('longChunks' in $$props) $$invalidate(34, longChunks = $$props.longChunks);
    		if ('inPopup' in $$props) $$invalidate(35, inPopup = $$props.inPopup);
    		if ('dates' in $$props) $$invalidate(36, dates = $$props.dates);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		getContext,
    		onMount,
    		ancestor,
    		createEventClasses,
    		createEventContent,
    		height,
    		max,
    		toEventWithLocalDates,
    		toViewWithLocalDates,
    		setContent,
    		repositionEvent,
    		resourceBackgroundColor,
    		resourceTextColor,
    		helperEvent,
    		keyEnter,
    		task,
    		rect,
    		bgEvent,
    		isFunction,
    		chunk,
    		longChunks,
    		inPopup,
    		dates,
    		dayMaxEvents,
    		displayEventEnd,
    		eventAllUpdated,
    		eventBackgroundColor,
    		eventTextColor,
    		eventClick,
    		eventColor,
    		eventContent,
    		eventClassNames,
    		eventDidMount,
    		eventMouseEnter,
    		eventMouseLeave,
    		resources,
    		theme,
    		_view,
    		_intlEventTime,
    		_interaction,
    		_iClasses,
    		_hiddenEvents,
    		_popupDate,
    		_tasks,
    		el,
    		event,
    		classes,
    		style,
    		content,
    		timeText,
    		margin,
    		hidden,
    		display,
    		onclick,
    		createHandler,
    		createDragHandler,
    		reposition,
    		hide,
    		footHeight,
    		$eventClick,
    		$_hiddenEvents,
    		$dayMaxEvents,
    		$_popupDate,
    		$_interaction,
    		$_view,
    		$eventAllUpdated,
    		$eventDidMount,
    		$_intlEventTime,
    		$theme,
    		$eventContent,
    		$displayEventEnd,
    		$eventClassNames,
    		$_iClasses,
    		$eventTextColor,
    		$resources,
    		$eventColor,
    		$eventBackgroundColor,
    		$eventMouseEnter,
    		$eventMouseLeave
    	});

    	$$self.$inject_state = $$props => {
    		if ('chunk' in $$props) $$invalidate(33, chunk = $$props.chunk);
    		if ('longChunks' in $$props) $$invalidate(34, longChunks = $$props.longChunks);
    		if ('inPopup' in $$props) $$invalidate(35, inPopup = $$props.inPopup);
    		if ('dates' in $$props) $$invalidate(36, dates = $$props.dates);
    		if ('dayMaxEvents' in $$props) $$invalidate(11, dayMaxEvents = $$props.dayMaxEvents);
    		if ('displayEventEnd' in $$props) $$invalidate(12, displayEventEnd = $$props.displayEventEnd);
    		if ('eventAllUpdated' in $$props) $$invalidate(13, eventAllUpdated = $$props.eventAllUpdated);
    		if ('eventBackgroundColor' in $$props) $$invalidate(14, eventBackgroundColor = $$props.eventBackgroundColor);
    		if ('eventTextColor' in $$props) $$invalidate(15, eventTextColor = $$props.eventTextColor);
    		if ('eventClick' in $$props) $$invalidate(16, eventClick = $$props.eventClick);
    		if ('eventColor' in $$props) $$invalidate(17, eventColor = $$props.eventColor);
    		if ('eventContent' in $$props) $$invalidate(18, eventContent = $$props.eventContent);
    		if ('eventClassNames' in $$props) $$invalidate(19, eventClassNames = $$props.eventClassNames);
    		if ('eventDidMount' in $$props) $$invalidate(20, eventDidMount = $$props.eventDidMount);
    		if ('eventMouseEnter' in $$props) $$invalidate(21, eventMouseEnter = $$props.eventMouseEnter);
    		if ('eventMouseLeave' in $$props) $$invalidate(22, eventMouseLeave = $$props.eventMouseLeave);
    		if ('resources' in $$props) $$invalidate(23, resources = $$props.resources);
    		if ('theme' in $$props) $$invalidate(24, theme = $$props.theme);
    		if ('_view' in $$props) $$invalidate(25, _view = $$props._view);
    		if ('_intlEventTime' in $$props) $$invalidate(26, _intlEventTime = $$props._intlEventTime);
    		if ('_interaction' in $$props) $$invalidate(27, _interaction = $$props._interaction);
    		if ('_iClasses' in $$props) $$invalidate(28, _iClasses = $$props._iClasses);
    		if ('_hiddenEvents' in $$props) $$invalidate(29, _hiddenEvents = $$props._hiddenEvents);
    		if ('_popupDate' in $$props) $$invalidate(30, _popupDate = $$props._popupDate);
    		if ('_tasks' in $$props) _tasks = $$props._tasks;
    		if ('el' in $$props) $$invalidate(3, el = $$props.el);
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    		if ('classes' in $$props) $$invalidate(4, classes = $$props.classes);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    		if ('content' in $$props) $$invalidate(6, content = $$props.content);
    		if ('timeText' in $$props) timeText = $$props.timeText;
    		if ('margin' in $$props) $$invalidate(38, margin = $$props.margin);
    		if ('hidden' in $$props) $$invalidate(39, hidden = $$props.hidden);
    		if ('display' in $$props) $$invalidate(1, display = $$props.display);
    		if ('onclick' in $$props) $$invalidate(7, onclick = $$props.onclick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*chunk*/ 4) {
    			$$invalidate(0, event = chunk.event);
    		}

    		if ($$self.$$.dirty[0] & /*event, display, style, $theme*/ 39 | $$self.$$.dirty[1] & /*$resources, $eventBackgroundColor, $eventColor, $eventTextColor, chunk, margin, hidden, $_iClasses, $eventClassNames, $_view*/ 1033604) {
    			{
    				$$invalidate(1, display = event.display);

    				// Class & Style
    				let bgColor = event.backgroundColor || resourceBackgroundColor(event, $resources) || $eventBackgroundColor || $eventColor;

    				let txtColor = event.textColor || resourceTextColor(event, $resources) || $eventTextColor;

    				if (bgEvent(display)) {
    					$$invalidate(5, style = `width:calc(${chunk.days * 100}% + ${chunk.days - 1}px);`);
    				} else {
    					let marginTop = margin;

    					if (event._margin) {
    						// Force margin for helper events
    						let [_margin, _dates] = event._margin;

    						if (chunk.date >= _dates[0] && chunk.date <= _dates.at(-1)) {
    							marginTop = _margin;
    						}
    					}

    					$$invalidate(5, style = `width:calc(${chunk.days * 100}% + ${(chunk.days - 1) * 7}px);` + `margin-top:${marginTop}px;`);
    				}

    				if (bgColor) {
    					$$invalidate(5, style += `background-color:${bgColor};`);
    				}

    				if (txtColor) {
    					$$invalidate(5, style += `color:${txtColor};`);
    				}

    				if (hidden) {
    					$$invalidate(5, style += 'visibility:hidden;');
    				}

    				$$invalidate(5, style += event.styles.join(';'));

    				$$invalidate(4, classes = [
    					bgEvent(display) ? $theme.bgEvent : $theme.event,
    					...$_iClasses([], event),
    					...createEventClasses($eventClassNames, event, $_view)
    				].join(' '));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$theme*/ 4 | $$self.$$.dirty[1] & /*chunk, $displayEventEnd, $eventContent, $_intlEventTime, $_view*/ 15364) {
    			// Content
    			$$invalidate(6, [timeText, content] = createEventContent(chunk, $displayEventEnd, $eventContent, $theme, $_intlEventTime, $_view), content);
    		}

    		if ($$self.$$.dirty[0] & /*display*/ 2 | $$self.$$.dirty[1] & /*$eventClick*/ 512) {
    			// Onclick handler
    			$$invalidate(7, onclick = createHandler($eventClick, display));
    		}
    	};

    	return [
    		event,
    		display,
    		$theme,
    		el,
    		classes,
    		style,
    		content,
    		onclick,
    		$_interaction,
    		$eventMouseEnter,
    		$eventMouseLeave,
    		dayMaxEvents,
    		displayEventEnd,
    		eventAllUpdated,
    		eventBackgroundColor,
    		eventTextColor,
    		eventClick,
    		eventColor,
    		eventContent,
    		eventClassNames,
    		eventDidMount,
    		eventMouseEnter,
    		eventMouseLeave,
    		resources,
    		theme,
    		_view,
    		_intlEventTime,
    		_interaction,
    		_iClasses,
    		_hiddenEvents,
    		_popupDate,
    		createHandler,
    		createDragHandler,
    		chunk,
    		longChunks,
    		inPopup,
    		dates,
    		reposition,
    		margin,
    		hidden,
    		$eventClick,
    		$_view,
    		$_intlEventTime,
    		$eventContent,
    		$displayEventEnd,
    		$eventClassNames,
    		$_iClasses,
    		$eventTextColor,
    		$resources,
    		$eventColor,
    		$eventBackgroundColor,
    		article_binding
    	];
    }

    class Event extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				chunk: 33,
    				longChunks: 34,
    				inPopup: 35,
    				dates: 36,
    				reposition: 37
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Event",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get chunk() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chunk(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get longChunks() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set longChunks(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inPopup() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inPopup(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dates() {
    		throw new Error("<Event>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dates(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reposition() {
    		return this.$$.ctx[37];
    	}

    	set reposition(value) {
    		throw new Error("<Event>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\Popup.svelte generated by Svelte v3.59.2 */
    const file$6 = "node_modules\\@event-calendar\\day-grid\\src\\Popup.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (100:8) {#each $_popupChunks as chunk (chunk.event)}
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let event;
    	let current;

    	event = new Event({
    			props: { chunk: /*chunk*/ ctx[20], inPopup: true },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(event.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(event, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const event_changes = {};
    			if (dirty & /*$_popupChunks*/ 1) event_changes.chunk = /*chunk*/ ctx[20];
    			event.$set(event_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(event, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(100:8) {#each $_popupChunks as chunk (chunk.event)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let time;
    	let time_datetime_value;
    	let setContent_action;
    	let t0;
    	let a;
    	let t1;
    	let a_aria_label_value;
    	let div0_class_value;
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_class_value;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$_popupChunks*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*chunk*/ ctx[20].event;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			time = element("time");
    			t0 = space();
    			a = element("a");
    			t1 = text("×");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(time, "datetime", time_datetime_value = toISOString(/*$_popupDate*/ ctx[3], 10));
    			add_location(time, file$6, 88, 8, 2732);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "tabindex", "0");
    			attr_dev(a, "aria-label", a_aria_label_value = /*$buttonText*/ ctx[6].close);
    			add_location(a, file$6, 90, 8, 2904);
    			attr_dev(div0, "class", div0_class_value = /*$theme*/ ctx[4].dayHead);
    			add_location(div0, file$6, 87, 4, 2693);
    			attr_dev(div1, "class", div1_class_value = /*$theme*/ ctx[4].events);
    			add_location(div1, file$6, 98, 4, 3123);
    			attr_dev(div2, "class", div2_class_value = /*$theme*/ ctx[4].popup);
    			attr_dev(div2, "style", /*style*/ ctx[2]);
    			add_location(div2, file$6, 79, 0, 2499);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, time);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    			append_dev(a, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			/*div2_binding*/ ctx[16](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(setContent_action = setContent.call(null, time, /*$_intlDayPopover*/ ctx[5].format(/*$_popupDate*/ ctx[3]))),
    					listen_dev(a, "click", stop_propagation(/*close*/ ctx[13]), false, false, true, false),
    					listen_dev(a, "keydown", keyEnter(/*close*/ ctx[13]), false, false, false, false),
    					action_destroyer(outsideEvent.call(null, div2, 'pointerdown')),
    					listen_dev(div2, "pointerdown", stop_propagation(/*pointerdown_handler*/ ctx[15]), false, false, true, false),
    					listen_dev(div2, "pointerdownoutside", /*handlePointerDownOutside*/ ctx[14], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$_popupDate*/ 8 && time_datetime_value !== (time_datetime_value = toISOString(/*$_popupDate*/ ctx[3], 10))) {
    				attr_dev(time, "datetime", time_datetime_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty & /*$_intlDayPopover, $_popupDate*/ 40) setContent_action.update.call(null, /*$_intlDayPopover*/ ctx[5].format(/*$_popupDate*/ ctx[3]));

    			if (!current || dirty & /*$buttonText*/ 64 && a_aria_label_value !== (a_aria_label_value = /*$buttonText*/ ctx[6].close)) {
    				attr_dev(a, "aria-label", a_aria_label_value);
    			}

    			if (!current || dirty & /*$theme*/ 16 && div0_class_value !== (div0_class_value = /*$theme*/ ctx[4].dayHead)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$_popupChunks*/ 1) {
    				each_value = /*$_popupChunks*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty & /*$theme*/ 16 && div1_class_value !== (div1_class_value = /*$theme*/ ctx[4].events)) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*$theme*/ 16 && div2_class_value !== (div2_class_value = /*$theme*/ ctx[4].popup)) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div2, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div2_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $_interaction;
    	let $_popupDate;
    	let $_popupChunks;
    	let $theme;
    	let $_intlDayPopover;
    	let $buttonText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, []);
    	let { buttonText, theme, _interaction, _intlDayPopover, _popupDate, _popupChunks } = getContext('state');
    	validate_store(buttonText, 'buttonText');
    	component_subscribe($$self, buttonText, value => $$invalidate(6, $buttonText = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(4, $theme = value));
    	validate_store(_interaction, '_interaction');
    	component_subscribe($$self, _interaction, value => $$invalidate(17, $_interaction = value));
    	validate_store(_intlDayPopover, '_intlDayPopover');
    	component_subscribe($$self, _intlDayPopover, value => $$invalidate(5, $_intlDayPopover = value));
    	validate_store(_popupDate, '_popupDate');
    	component_subscribe($$self, _popupDate, value => $$invalidate(3, $_popupDate = value));
    	validate_store(_popupChunks, '_popupChunks');
    	component_subscribe($$self, _popupChunks, value => $$invalidate(0, $_popupChunks = value));
    	let el;
    	let style = '';

    	function position() {
    		let dayEl = ancestor(el, 1);
    		let bodyEl = ancestor(dayEl, 3);
    		let popupRect = rect(el);
    		let dayRect = rect(dayEl);
    		let bodyRect = rect(bodyEl);
    		$$invalidate(2, style = '');
    		let left;

    		if (popupRect.width >= bodyRect.width) {
    			left = bodyRect.left - dayRect.left;
    			let right = dayRect.right - bodyRect.right;
    			$$invalidate(2, style += `right:${right}px;`);
    		} else {
    			left = (dayRect.width - popupRect.width) / 2;

    			if (dayRect.left + left < bodyRect.left) {
    				left = bodyRect.left - dayRect.left;
    			} else if (dayRect.left + left + popupRect.width > bodyRect.right) {
    				left = bodyRect.right - dayRect.left - popupRect.width;
    			}
    		}

    		$$invalidate(2, style += `left:${left}px;`);
    		let top;

    		if (popupRect.height >= bodyRect.height) {
    			top = bodyRect.top - dayRect.top;
    			let bottom = dayRect.bottom - bodyRect.bottom;
    			$$invalidate(2, style += `bottom:${bottom}px;`);
    		} else {
    			top = (dayRect.height - popupRect.height) / 2;

    			if (dayRect.top + top < bodyRect.top) {
    				top = bodyRect.top - dayRect.top;
    			} else if (dayRect.top + top + popupRect.height > bodyRect.bottom) {
    				top = bodyRect.bottom - dayRect.top - popupRect.height;
    			}
    		}

    		$$invalidate(2, style += `top:${top}px;`);
    	}

    	function reposition() {
    		// Skip the first call (el is not defined at this time)
    		if (el) {
    			$$invalidate(2, style = '');

    			// Let chunks to update/mount then position the popup
    			tick().then(() => {
    				if ($_popupChunks.length) {
    					position();
    				} else {
    					close();
    				}
    			});
    		}
    	}

    	function close(e) {
    		set_store_value(_popupDate, $_popupDate = null, $_popupDate);
    	}

    	function handlePointerDownOutside(e) {
    		close();
    		$_interaction.action?.noClick();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	function pointerdown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(1, el);
    		});
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		tick,
    		ancestor,
    		rect,
    		setContent,
    		outsideEvent,
    		keyEnter,
    		toISOString,
    		Event,
    		buttonText,
    		theme,
    		_interaction,
    		_intlDayPopover,
    		_popupDate,
    		_popupChunks,
    		el,
    		style,
    		position,
    		reposition,
    		close,
    		handlePointerDownOutside,
    		$_interaction,
    		$_popupDate,
    		$_popupChunks,
    		$theme,
    		$_intlDayPopover,
    		$buttonText
    	});

    	$$self.$inject_state = $$props => {
    		if ('buttonText' in $$props) $$invalidate(7, buttonText = $$props.buttonText);
    		if ('theme' in $$props) $$invalidate(8, theme = $$props.theme);
    		if ('_interaction' in $$props) $$invalidate(9, _interaction = $$props._interaction);
    		if ('_intlDayPopover' in $$props) $$invalidate(10, _intlDayPopover = $$props._intlDayPopover);
    		if ('_popupDate' in $$props) $$invalidate(11, _popupDate = $$props._popupDate);
    		if ('_popupChunks' in $$props) $$invalidate(12, _popupChunks = $$props._popupChunks);
    		if ('el' in $$props) $$invalidate(1, el = $$props.el);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$_popupChunks*/ 1) {
    			if ($_popupChunks) {
    				// Fire reposition only on popup chunks change
    				reposition();
    			}
    		}
    	};

    	return [
    		$_popupChunks,
    		el,
    		style,
    		$_popupDate,
    		$theme,
    		$_intlDayPopover,
    		$buttonText,
    		buttonText,
    		theme,
    		_interaction,
    		_intlDayPopover,
    		_popupDate,
    		_popupChunks,
    		close,
    		handlePointerDownOutside,
    		pointerdown_handler,
    		div2_binding
    	];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\Day.svelte generated by Svelte v3.59.2 */
    const file$5 = "node_modules\\@event-calendar\\day-grid\\src\\Day.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	child_ctx[45] = list;
    	child_ctx[46] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    // (104:8) {#each dayBgChunks as chunk (chunk.event)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let event;
    	let current;

    	event = new Event({
    			props: { chunk: /*chunk*/ ctx[44] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(event.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(event, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const event_changes = {};
    			if (dirty[0] & /*dayBgChunks*/ 256) event_changes.chunk = /*chunk*/ ctx[44];
    			event.$set(event_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(event, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(104:8) {#each dayBgChunks as chunk (chunk.event)}",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if iChunks[2] && datesEqual(iChunks[2].date, date)}
    function create_if_block_3$1(ctx) {
    	let div;
    	let event;
    	let div_class_value;
    	let current;

    	event = new Event({
    			props: { chunk: /*iChunks*/ ctx[2][2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(event.$$.fragment);
    			attr_dev(div, "class", div_class_value = /*$theme*/ ctx[14].events);
    			add_location(div, file$5, 109, 8, 3612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(event, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const event_changes = {};
    			if (dirty[0] & /*iChunks*/ 4) event_changes.chunk = /*iChunks*/ ctx[2][2];
    			event.$set(event_changes);

    			if (!current || dirty[0] & /*$theme*/ 16384 && div_class_value !== (div_class_value = /*$theme*/ ctx[14].events)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(event);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(109:4) {#if iChunks[2] && datesEqual(iChunks[2].date, date)}",
    		ctx
    	});

    	return block;
    }

    // (115:4) {#if iChunks[0] && datesEqual(iChunks[0].date, date)}
    function create_if_block_2$1(ctx) {
    	let div;
    	let event;
    	let div_class_value;
    	let current;

    	event = new Event({
    			props: { chunk: /*iChunks*/ ctx[2][0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(event.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (/*$theme*/ ctx[14].events + " " + /*$theme*/ ctx[14].preview));
    			add_location(div, file$5, 115, 8, 3800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(event, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const event_changes = {};
    			if (dirty[0] & /*iChunks*/ 4) event_changes.chunk = /*iChunks*/ ctx[2][0];
    			event.$set(event_changes);

    			if (!current || dirty[0] & /*$theme*/ 16384 && div_class_value !== (div_class_value = "" + (/*$theme*/ ctx[14].events + " " + /*$theme*/ ctx[14].preview))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(event);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(115:4) {#if iChunks[0] && datesEqual(iChunks[0].date, date)}",
    		ctx
    	});

    	return block;
    }

    // (121:8) {#each dayChunks as chunk, i (chunk.event)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let event;
    	let i = /*i*/ ctx[46];
    	let current;
    	const assign_event = () => /*event_binding*/ ctx[38](event, i);
    	const unassign_event = () => /*event_binding*/ ctx[38](null, i);

    	let event_props = {
    		chunk: /*chunk*/ ctx[44],
    		longChunks: /*longChunks*/ ctx[1],
    		dates: /*dates*/ ctx[3]
    	};

    	event = new Event({ props: event_props, $$inline: true });
    	assign_event();

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(event.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(event, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[46]) {
    				unassign_event();
    				i = /*i*/ ctx[46];
    				assign_event();
    			}

    			const event_changes = {};
    			if (dirty[0] & /*dayChunks*/ 32) event_changes.chunk = /*chunk*/ ctx[44];
    			if (dirty[0] & /*longChunks*/ 2) event_changes.longChunks = /*longChunks*/ ctx[1];
    			if (dirty[0] & /*dates*/ 8) event_changes.dates = /*dates*/ ctx[3];
    			event.$set(event_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(event.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(event.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			unassign_event();
    			destroy_component(event, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(121:8) {#each dayChunks as chunk, i (chunk.event)}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if showPopup}
    function create_if_block_1$1(ctx) {
    	let popup;
    	let current;
    	popup = new Popup({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(125:4) {#if showPopup}",
    		ctx
    	});

    	return block;
    }

    // (129:8) {#if hiddenEvents.size}
    function create_if_block$2(ctx) {
    	let a;
    	let setContent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "tabindex", "0");
    			attr_dev(a, "aria-haspopup", "true");
    			add_location(a, file$5, 131, 12, 4336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", stop_propagation(/*showMore*/ ctx[27]), false, false, true, false),
    					listen_dev(a, "keydown", keyEnter(/*showMore*/ ctx[27]), false, false, false, false),
    					listen_dev(a, "pointerdown", stop_propagation(/*pointerdown_handler*/ ctx[37]), false, false, true, false),
    					action_destroyer(setContent_action = setContent.call(null, a, /*moreLink*/ ctx[12]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (setContent_action && is_function(setContent_action.update) && dirty[0] & /*moreLink*/ 4096) setContent_action.update.call(null, /*moreLink*/ ctx[12]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(129:8) {#if hiddenEvents.size}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let time;
    	let time_class_value;
    	let time_datetime_value;
    	let setContent_action;
    	let t0;
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let div0_class_value;
    	let t1;
    	let show_if_1 = /*iChunks*/ ctx[2][2] && datesEqual(/*iChunks*/ ctx[2][2].date, /*date*/ ctx[0]);
    	let t2;
    	let show_if = /*iChunks*/ ctx[2][0] && datesEqual(/*iChunks*/ ctx[2][0].date, /*date*/ ctx[0]);
    	let t3;
    	let div1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let div1_class_value;
    	let t4;
    	let t5;
    	let div2;
    	let div2_class_value;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*dayBgChunks*/ ctx[8];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*chunk*/ ctx[44].event;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block0 = show_if_1 && create_if_block_3$1(ctx);
    	let if_block1 = show_if && create_if_block_2$1(ctx);
    	let each_value = /*dayChunks*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*chunk*/ ctx[44].event;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	let if_block2 = /*showPopup*/ ctx[7] && create_if_block_1$1(ctx);
    	let if_block3 = /*hiddenEvents*/ ctx[6].size && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			time = element("time");
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			div2 = element("div");
    			if (if_block3) if_block3.c();
    			attr_dev(time, "class", time_class_value = /*$theme*/ ctx[14].dayHead);
    			attr_dev(time, "datetime", time_datetime_value = toISOString(/*date*/ ctx[0], 10));
    			add_location(time, file$5, 97, 4, 3235);
    			attr_dev(div0, "class", div0_class_value = /*$theme*/ ctx[14].bgEvents);
    			add_location(div0, file$5, 102, 4, 3386);
    			attr_dev(div1, "class", div1_class_value = /*$theme*/ ctx[14].events);
    			add_location(div1, file$5, 119, 4, 3916);
    			attr_dev(div2, "class", div2_class_value = /*$theme*/ ctx[14].dayFoot);
    			add_location(div2, file$5, 127, 4, 4147);

    			attr_dev(div3, "class", div3_class_value = "" + (/*$theme*/ ctx[14].day + " " + /*$theme*/ ctx[14].weekdays?.[/*date*/ ctx[0].getUTCDay()] + (/*isToday*/ ctx[9] ? ' ' + /*$theme*/ ctx[14].today : '') + (/*otherMonth*/ ctx[10]
    			? ' ' + /*$theme*/ ctx[14].otherMonth
    			: '') + (/*highlight*/ ctx[11]
    			? ' ' + /*$theme*/ ctx[14].highlight
    			: '')));

    			attr_dev(div3, "role", "cell");
    			add_location(div3, file$5, 90, 0, 2906);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, time);
    			append_dev(div3, t0);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append_dev(div3, t1);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t2);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div3, t4);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			if (if_block3) if_block3.m(div2, null);
    			/*div3_binding*/ ctx[39](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(setContent_action = setContent.call(null, time, /*$_intlDayCell*/ ctx[16].format(/*date*/ ctx[0]))),
    					listen_dev(
    						div3,
    						"pointerleave",
    						function () {
    							if (is_function(/*$_interaction*/ ctx[15].pointer?.leave)) /*$_interaction*/ ctx[15].pointer?.leave.apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div3,
    						"pointerdown",
    						function () {
    							if (is_function(/*$_interaction*/ ctx[15].action?.select)) /*$_interaction*/ ctx[15].action?.select.apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*$theme*/ 16384 && time_class_value !== (time_class_value = /*$theme*/ ctx[14].dayHead)) {
    				attr_dev(time, "class", time_class_value);
    			}

    			if (!current || dirty[0] & /*date*/ 1 && time_datetime_value !== (time_datetime_value = toISOString(/*date*/ ctx[0], 10))) {
    				attr_dev(time, "datetime", time_datetime_value);
    			}

    			if (setContent_action && is_function(setContent_action.update) && dirty[0] & /*$_intlDayCell, date*/ 65537) setContent_action.update.call(null, /*$_intlDayCell*/ ctx[16].format(/*date*/ ctx[0]));

    			if (dirty[0] & /*dayBgChunks*/ 256) {
    				each_value_1 = /*dayBgChunks*/ ctx[8];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*$theme*/ 16384 && div0_class_value !== (div0_class_value = /*$theme*/ ctx[14].bgEvents)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty[0] & /*iChunks, date*/ 5) show_if_1 = /*iChunks*/ ctx[2][2] && datesEqual(/*iChunks*/ ctx[2][2].date, /*date*/ ctx[0]);

    			if (show_if_1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*iChunks, date*/ 5) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*iChunks, date*/ 5) show_if = /*iChunks*/ ctx[2][0] && datesEqual(/*iChunks*/ ctx[2][0].date, /*date*/ ctx[0]);

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*iChunks, date*/ 5) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*dayChunks, longChunks, dates, refs*/ 8234) {
    				each_value = /*dayChunks*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div1, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*$theme*/ 16384 && div1_class_value !== (div1_class_value = /*$theme*/ ctx[14].events)) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*showPopup*/ ctx[7]) {
    				if (if_block2) {
    					if (dirty[0] & /*showPopup*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div3, t5);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*hiddenEvents*/ ctx[6].size) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!current || dirty[0] & /*$theme*/ 16384 && div2_class_value !== (div2_class_value = /*$theme*/ ctx[14].dayFoot)) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty[0] & /*$theme, date, isToday, otherMonth, highlight*/ 19969 && div3_class_value !== (div3_class_value = "" + (/*$theme*/ ctx[14].day + " " + /*$theme*/ ctx[14].weekdays?.[/*date*/ ctx[0].getUTCDay()] + (/*isToday*/ ctx[9] ? ' ' + /*$theme*/ ctx[14].today : '') + (/*otherMonth*/ ctx[10]
    			? ' ' + /*$theme*/ ctx[14].otherMonth
    			: '') + (/*highlight*/ ctx[11]
    			? ' ' + /*$theme*/ ctx[14].highlight
    			: '')))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(if_block0);
    			transition_out(if_block1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			/*div3_binding*/ ctx[39](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $_popupChunks;
    	let $_popupDate;
    	let $moreLinkContent;
    	let $_hiddenEvents;
    	let $highlightedDates;
    	let $currentDate;
    	let $_today;
    	let $theme;
    	let $_interaction;
    	let $_intlDayCell;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Day', slots, []);
    	let { date } = $$props;
    	let { chunks } = $$props;
    	let { bgChunks } = $$props;
    	let { longChunks } = $$props;
    	let { iChunks = [] } = $$props;
    	let { dates } = $$props;
    	let { date: currentDate, dayMaxEvents, highlightedDates, moreLinkContent, theme, _hiddenEvents, _intlDayCell, _popupDate, _popupChunks, _today, _interaction, _queue } = getContext('state');
    	validate_store(currentDate, 'currentDate');
    	component_subscribe($$self, currentDate, value => $$invalidate(35, $currentDate = value));
    	validate_store(highlightedDates, 'highlightedDates');
    	component_subscribe($$self, highlightedDates, value => $$invalidate(34, $highlightedDates = value));
    	validate_store(moreLinkContent, 'moreLinkContent');
    	component_subscribe($$self, moreLinkContent, value => $$invalidate(32, $moreLinkContent = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(14, $theme = value));
    	validate_store(_hiddenEvents, '_hiddenEvents');
    	component_subscribe($$self, _hiddenEvents, value => $$invalidate(33, $_hiddenEvents = value));
    	validate_store(_intlDayCell, '_intlDayCell');
    	component_subscribe($$self, _intlDayCell, value => $$invalidate(16, $_intlDayCell = value));
    	validate_store(_popupDate, '_popupDate');
    	component_subscribe($$self, _popupDate, value => $$invalidate(31, $_popupDate = value));
    	validate_store(_popupChunks, '_popupChunks');
    	component_subscribe($$self, _popupChunks, value => $$invalidate(40, $_popupChunks = value));
    	validate_store(_today, '_today');
    	component_subscribe($$self, _today, value => $$invalidate(36, $_today = value));
    	validate_store(_interaction, '_interaction');
    	component_subscribe($$self, _interaction, value => $$invalidate(15, $_interaction = value));
    	let el;
    	let dayChunks, dayBgChunks;
    	let isToday;
    	let otherMonth;
    	let highlight;
    	let hiddenEvents = new Set(); // hidden events of this day
    	let moreLink = '';
    	let showPopup;
    	let refs = [];

    	function showMore() {
    		set_store_value(_popupDate, $_popupDate = date, $_popupDate);
    	}

    	function setPopupChunks() {
    		let nextDay = addDay(cloneDate(date));
    		let chunks = dayChunks.concat(longChunks[date.getTime()]?.chunks || []);
    		set_store_value(_popupChunks, $_popupChunks = chunks.map(chunk => assign({}, chunk, createEventChunk(chunk.event, date, nextDay), { days: 1, dates: [date] })).sort((a, b) => a.top - b.top), $_popupChunks);
    	}

    	function reposition() {
    		runReposition(refs, dayChunks);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (date === undefined && !('date' in $$props || $$self.$$.bound[$$self.$$.props['date']])) {
    			console.warn("<Day> was created without expected prop 'date'");
    		}

    		if (chunks === undefined && !('chunks' in $$props || $$self.$$.bound[$$self.$$.props['chunks']])) {
    			console.warn("<Day> was created without expected prop 'chunks'");
    		}

    		if (bgChunks === undefined && !('bgChunks' in $$props || $$self.$$.bound[$$self.$$.props['bgChunks']])) {
    			console.warn("<Day> was created without expected prop 'bgChunks'");
    		}

    		if (longChunks === undefined && !('longChunks' in $$props || $$self.$$.bound[$$self.$$.props['longChunks']])) {
    			console.warn("<Day> was created without expected prop 'longChunks'");
    		}

    		if (dates === undefined && !('dates' in $$props || $$self.$$.bound[$$self.$$.props['dates']])) {
    			console.warn("<Day> was created without expected prop 'dates'");
    		}
    	});

    	const writable_props = ['date', 'chunks', 'bgChunks', 'longChunks', 'iChunks', 'dates'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Day> was created with unknown prop '${key}'`);
    	});

    	function pointerdown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function event_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refs[i] = $$value;
    			$$invalidate(13, refs);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(4, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    		if ('chunks' in $$props) $$invalidate(28, chunks = $$props.chunks);
    		if ('bgChunks' in $$props) $$invalidate(29, bgChunks = $$props.bgChunks);
    		if ('longChunks' in $$props) $$invalidate(1, longChunks = $$props.longChunks);
    		if ('iChunks' in $$props) $$invalidate(2, iChunks = $$props.iChunks);
    		if ('dates' in $$props) $$invalidate(3, dates = $$props.dates);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		tick,
    		datesEqual,
    		setContent,
    		createEventChunk,
    		addDay,
    		cloneDate,
    		assign,
    		setPayload,
    		toISOString,
    		keyEnter,
    		runReposition,
    		isFunction,
    		Event,
    		Popup,
    		date,
    		chunks,
    		bgChunks,
    		longChunks,
    		iChunks,
    		dates,
    		currentDate,
    		dayMaxEvents,
    		highlightedDates,
    		moreLinkContent,
    		theme,
    		_hiddenEvents,
    		_intlDayCell,
    		_popupDate,
    		_popupChunks,
    		_today,
    		_interaction,
    		_queue,
    		el,
    		dayChunks,
    		dayBgChunks,
    		isToday,
    		otherMonth,
    		highlight,
    		hiddenEvents,
    		moreLink,
    		showPopup,
    		refs,
    		showMore,
    		setPopupChunks,
    		reposition,
    		$_popupChunks,
    		$_popupDate,
    		$moreLinkContent,
    		$_hiddenEvents,
    		$highlightedDates,
    		$currentDate,
    		$_today,
    		$theme,
    		$_interaction,
    		$_intlDayCell
    	});

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    		if ('chunks' in $$props) $$invalidate(28, chunks = $$props.chunks);
    		if ('bgChunks' in $$props) $$invalidate(29, bgChunks = $$props.bgChunks);
    		if ('longChunks' in $$props) $$invalidate(1, longChunks = $$props.longChunks);
    		if ('iChunks' in $$props) $$invalidate(2, iChunks = $$props.iChunks);
    		if ('dates' in $$props) $$invalidate(3, dates = $$props.dates);
    		if ('currentDate' in $$props) $$invalidate(17, currentDate = $$props.currentDate);
    		if ('dayMaxEvents' in $$props) dayMaxEvents = $$props.dayMaxEvents;
    		if ('highlightedDates' in $$props) $$invalidate(18, highlightedDates = $$props.highlightedDates);
    		if ('moreLinkContent' in $$props) $$invalidate(19, moreLinkContent = $$props.moreLinkContent);
    		if ('theme' in $$props) $$invalidate(20, theme = $$props.theme);
    		if ('_hiddenEvents' in $$props) $$invalidate(21, _hiddenEvents = $$props._hiddenEvents);
    		if ('_intlDayCell' in $$props) $$invalidate(22, _intlDayCell = $$props._intlDayCell);
    		if ('_popupDate' in $$props) $$invalidate(23, _popupDate = $$props._popupDate);
    		if ('_popupChunks' in $$props) $$invalidate(24, _popupChunks = $$props._popupChunks);
    		if ('_today' in $$props) $$invalidate(25, _today = $$props._today);
    		if ('_interaction' in $$props) $$invalidate(26, _interaction = $$props._interaction);
    		if ('_queue' in $$props) _queue = $$props._queue;
    		if ('el' in $$props) $$invalidate(4, el = $$props.el);
    		if ('dayChunks' in $$props) $$invalidate(5, dayChunks = $$props.dayChunks);
    		if ('dayBgChunks' in $$props) $$invalidate(8, dayBgChunks = $$props.dayBgChunks);
    		if ('isToday' in $$props) $$invalidate(9, isToday = $$props.isToday);
    		if ('otherMonth' in $$props) $$invalidate(10, otherMonth = $$props.otherMonth);
    		if ('highlight' in $$props) $$invalidate(11, highlight = $$props.highlight);
    		if ('hiddenEvents' in $$props) $$invalidate(6, hiddenEvents = $$props.hiddenEvents);
    		if ('moreLink' in $$props) $$invalidate(12, moreLink = $$props.moreLink);
    		if ('showPopup' in $$props) $$invalidate(7, showPopup = $$props.showPopup);
    		if ('refs' in $$props) $$invalidate(13, refs = $$props.refs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*bgChunks, date, hiddenEvents, chunks, dayChunks*/ 805306465) {
    			{
    				$$invalidate(5, dayChunks = []);
    				$$invalidate(8, dayBgChunks = bgChunks.filter(bgChunk => datesEqual(bgChunk.date, date)));
    				hiddenEvents.clear();
    				(((($$invalidate(6, hiddenEvents), $$invalidate(29, bgChunks)), $$invalidate(0, date)), $$invalidate(28, chunks)), $$invalidate(5, dayChunks));

    				for (let chunk of chunks) {
    					if (datesEqual(chunk.date, date)) {
    						dayChunks.push(chunk);
    					} // if ($dayMaxEvents !== false && dayChunks.length > $dayMaxEvents) {
    					// 	chunk.hidden = true;
    				} // }
    			}
    		}

    		if ($$self.$$.dirty[0] & /*date, hiddenEvents*/ 65) {
    			set_store_value(_hiddenEvents, $_hiddenEvents[date.getTime()] = hiddenEvents, $_hiddenEvents);
    		}

    		if ($$self.$$.dirty[0] & /*date*/ 1 | $$self.$$.dirty[1] & /*$_today*/ 32) {
    			$$invalidate(9, isToday = datesEqual(date, $_today));
    		}

    		if ($$self.$$.dirty[0] & /*date*/ 1 | $$self.$$.dirty[1] & /*$currentDate, $highlightedDates*/ 24) {
    			{
    				$$invalidate(10, otherMonth = date.getUTCMonth() !== $currentDate.getUTCMonth());
    				$$invalidate(11, highlight = $highlightedDates.some(d => datesEqual(d, date)));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*hiddenEvents*/ 64 | $$self.$$.dirty[1] & /*$_hiddenEvents, $moreLinkContent*/ 6) {
    			if ($_hiddenEvents && hiddenEvents.size) {
    				// make Svelte update this block on $_hiddenEvents update
    				let text = '+' + hiddenEvents.size + ' more';

    				if ($moreLinkContent) {
    					$$invalidate(12, moreLink = isFunction($moreLinkContent)
    					? $moreLinkContent({ num: hiddenEvents.size, text })
    					: $moreLinkContent);
    				} else {
    					$$invalidate(12, moreLink = text);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*date*/ 1 | $$self.$$.dirty[1] & /*$_popupDate*/ 1) {
    			$$invalidate(7, showPopup = $_popupDate && datesEqual(date, $_popupDate));
    		}

    		if ($$self.$$.dirty[0] & /*showPopup, longChunks, dayChunks*/ 162) {
    			if (showPopup && longChunks && dayChunks) {
    				// Let chunks to reposition then set popup chunks
    				tick().then(setPopupChunks);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*el, date*/ 17) {
    			// dateFromPoint
    			if (el) {
    				setPayload(el, () => ({
    					allDay: true,
    					date,
    					resource: undefined,
    					dayEl: el
    				}));
    			}
    		}
    	};

    	return [
    		date,
    		longChunks,
    		iChunks,
    		dates,
    		el,
    		dayChunks,
    		hiddenEvents,
    		showPopup,
    		dayBgChunks,
    		isToday,
    		otherMonth,
    		highlight,
    		moreLink,
    		refs,
    		$theme,
    		$_interaction,
    		$_intlDayCell,
    		currentDate,
    		highlightedDates,
    		moreLinkContent,
    		theme,
    		_hiddenEvents,
    		_intlDayCell,
    		_popupDate,
    		_popupChunks,
    		_today,
    		_interaction,
    		showMore,
    		chunks,
    		bgChunks,
    		reposition,
    		$_popupDate,
    		$moreLinkContent,
    		$_hiddenEvents,
    		$highlightedDates,
    		$currentDate,
    		$_today,
    		pointerdown_handler,
    		event_binding,
    		div3_binding
    	];
    }

    class Day extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				date: 0,
    				chunks: 28,
    				bgChunks: 29,
    				longChunks: 1,
    				iChunks: 2,
    				dates: 3,
    				reposition: 30
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Day",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get date() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chunks() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chunks(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgChunks() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgChunks(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get longChunks() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set longChunks(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iChunks() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iChunks(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dates() {
    		throw new Error("<Day>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dates(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reposition() {
    		return this.$$.ctx[30];
    	}

    	set reposition(value) {
    		throw new Error("<Day>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\Week.svelte generated by Svelte v3.59.2 */
    const file$4 = "node_modules\\@event-calendar\\day-grid\\src\\Week.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[27] = list;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (67:4) {#each dates as date, i}
    function create_each_block$3(ctx) {
    	let day;
    	let i = /*i*/ ctx[28];
    	let current;
    	const assign_day = () => /*day_binding*/ ctx[23](day, i);
    	const unassign_day = () => /*day_binding*/ ctx[23](null, i);

    	let day_props = {
    		date: /*date*/ ctx[26],
    		chunks: /*chunks*/ ctx[1],
    		bgChunks: /*bgChunks*/ ctx[2],
    		longChunks: /*longChunks*/ ctx[3],
    		iChunks: /*iChunks*/ ctx[4],
    		dates: /*dates*/ ctx[0]
    	};

    	day = new Day({ props: day_props, $$inline: true });
    	assign_day();

    	const block = {
    		c: function create() {
    			create_component(day.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(day, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[28]) {
    				unassign_day();
    				i = /*i*/ ctx[28];
    				assign_day();
    			}

    			const day_changes = {};
    			if (dirty & /*dates*/ 1) day_changes.date = /*date*/ ctx[26];
    			if (dirty & /*chunks*/ 2) day_changes.chunks = /*chunks*/ ctx[1];
    			if (dirty & /*bgChunks*/ 4) day_changes.bgChunks = /*bgChunks*/ ctx[2];
    			if (dirty & /*longChunks*/ 8) day_changes.longChunks = /*longChunks*/ ctx[3];
    			if (dirty & /*iChunks*/ 16) day_changes.iChunks = /*iChunks*/ ctx[4];
    			if (dirty & /*dates*/ 1) day_changes.dates = /*dates*/ ctx[0];
    			day.$set(day_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(day.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(day.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_day();
    			destroy_component(day, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(67:4) {#each dates as date, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*dates*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", div_class_value = /*$theme*/ ctx[6].days);
    			attr_dev(div, "role", "row");
    			add_location(div, file$4, 65, 0, 1908);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "resize", /*reposition*/ ctx[14], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dates, chunks, bgChunks, longChunks, iChunks, refs*/ 63) {
    				each_value = /*dates*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$theme*/ 64 && div_class_value !== (div_class_value = /*$theme*/ ctx[6].days)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $_hiddenEvents;
    	let $hiddenDays;
    	let $_iEvents;
    	let $resources;
    	let $filterEventsWithResources;
    	let $_events;
    	let $theme;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Week', slots, []);
    	let { dates } = $$props;
    	let { _events, _iEvents, _queue2, _hiddenEvents, resources, filterEventsWithResources, hiddenDays, theme } = getContext('state');
    	validate_store(_events, '_events');
    	component_subscribe($$self, _events, value => $$invalidate(22, $_events = value));
    	validate_store(_iEvents, '_iEvents');
    	component_subscribe($$self, _iEvents, value => $$invalidate(19, $_iEvents = value));
    	validate_store(_hiddenEvents, '_hiddenEvents');
    	component_subscribe($$self, _hiddenEvents, value => $$invalidate(17, $_hiddenEvents = value));
    	validate_store(resources, 'resources');
    	component_subscribe($$self, resources, value => $$invalidate(20, $resources = value));
    	validate_store(filterEventsWithResources, 'filterEventsWithResources');
    	component_subscribe($$self, filterEventsWithResources, value => $$invalidate(21, $filterEventsWithResources = value));
    	validate_store(hiddenDays, 'hiddenDays');
    	component_subscribe($$self, hiddenDays, value => $$invalidate(18, $hiddenDays = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(6, $theme = value));
    	let chunks, bgChunks, longChunks, iChunks = [];
    	let start;
    	let end;
    	let refs = [];
    	let debounceHandle = {};

    	function reposition() {
    		debounce(() => runReposition(refs, dates), debounceHandle, _queue2);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (dates === undefined && !('dates' in $$props || $$self.$$.bound[$$self.$$.props['dates']])) {
    			console.warn("<Week> was created without expected prop 'dates'");
    		}
    	});

    	const writable_props = ['dates'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Week> was created with unknown prop '${key}'`);
    	});

    	function day_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refs[i] = $$value;
    			$$invalidate(5, refs);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('dates' in $$props) $$invalidate(0, dates = $$props.dates);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		tick,
    		cloneDate,
    		addDay,
    		eventIntersects,
    		bgEvent,
    		createEventChunk,
    		prepareEventChunks,
    		runReposition,
    		debounce,
    		Day,
    		dates,
    		_events,
    		_iEvents,
    		_queue2,
    		_hiddenEvents,
    		resources,
    		filterEventsWithResources,
    		hiddenDays,
    		theme,
    		chunks,
    		bgChunks,
    		longChunks,
    		iChunks,
    		start,
    		end,
    		refs,
    		debounceHandle,
    		reposition,
    		$_hiddenEvents,
    		$hiddenDays,
    		$_iEvents,
    		$resources,
    		$filterEventsWithResources,
    		$_events,
    		$theme
    	});

    	$$self.$inject_state = $$props => {
    		if ('dates' in $$props) $$invalidate(0, dates = $$props.dates);
    		if ('_events' in $$props) $$invalidate(7, _events = $$props._events);
    		if ('_iEvents' in $$props) $$invalidate(8, _iEvents = $$props._iEvents);
    		if ('_queue2' in $$props) _queue2 = $$props._queue2;
    		if ('_hiddenEvents' in $$props) $$invalidate(9, _hiddenEvents = $$props._hiddenEvents);
    		if ('resources' in $$props) $$invalidate(10, resources = $$props.resources);
    		if ('filterEventsWithResources' in $$props) $$invalidate(11, filterEventsWithResources = $$props.filterEventsWithResources);
    		if ('hiddenDays' in $$props) $$invalidate(12, hiddenDays = $$props.hiddenDays);
    		if ('theme' in $$props) $$invalidate(13, theme = $$props.theme);
    		if ('chunks' in $$props) $$invalidate(1, chunks = $$props.chunks);
    		if ('bgChunks' in $$props) $$invalidate(2, bgChunks = $$props.bgChunks);
    		if ('longChunks' in $$props) $$invalidate(3, longChunks = $$props.longChunks);
    		if ('iChunks' in $$props) $$invalidate(4, iChunks = $$props.iChunks);
    		if ('start' in $$props) $$invalidate(15, start = $$props.start);
    		if ('end' in $$props) $$invalidate(16, end = $$props.end);
    		if ('refs' in $$props) $$invalidate(5, refs = $$props.refs);
    		if ('debounceHandle' in $$props) debounceHandle = $$props.debounceHandle;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dates*/ 1) {
    			{
    				$$invalidate(15, start = dates[0]);
    				$$invalidate(16, end = addDay(cloneDate(dates.at(-1))));
    			}
    		}

    		if ($$self.$$.dirty & /*$_events, start, end, $filterEventsWithResources, $resources, bgChunks, chunks, $hiddenDays*/ 7700486) {
    			{
    				$$invalidate(1, chunks = []);
    				$$invalidate(2, bgChunks = []);

    				for (let event of $_events) {
    					if (eventIntersects(event, start, end, $filterEventsWithResources ? $resources : undefined)) {
    						let chunk = createEventChunk(event, start, end);

    						if (bgEvent(event.display)) {
    							if (event.allDay) {
    								bgChunks.push(chunk);
    							}
    						} else {
    							chunks.push(chunk);
    						}
    					}
    				}

    				prepareEventChunks(bgChunks, $hiddenDays);
    				$$invalidate(3, longChunks = prepareEventChunks(chunks, $hiddenDays));

    				// Run reposition only when events get changed
    				reposition();
    			}
    		}

    		if ($$self.$$.dirty & /*$_iEvents, start, end, $hiddenDays*/ 884736) {
    			$$invalidate(4, iChunks = $_iEvents.map(event => {
    				let chunk;

    				if (event && eventIntersects(event, start, end)) {
    					chunk = createEventChunk(event, start, end);
    					prepareEventChunks([chunk], $hiddenDays);
    				} else {
    					chunk = null;
    				}

    				return chunk;
    			}));
    		}

    		if ($$self.$$.dirty & /*$_hiddenEvents*/ 131072) {
    			if ($_hiddenEvents) {
    				// Schedule reposition during next update
    				tick().then(reposition);
    			}
    		}
    	};

    	return [
    		dates,
    		chunks,
    		bgChunks,
    		longChunks,
    		iChunks,
    		refs,
    		$theme,
    		_events,
    		_iEvents,
    		_hiddenEvents,
    		resources,
    		filterEventsWithResources,
    		hiddenDays,
    		theme,
    		reposition,
    		start,
    		end,
    		$_hiddenEvents,
    		$hiddenDays,
    		$_iEvents,
    		$resources,
    		$filterEventsWithResources,
    		$_events,
    		day_binding
    	];
    }

    class Week extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { dates: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Week",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get dates() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dates(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\Body.svelte generated by Svelte v3.59.2 */
    const file$3 = "node_modules\\@event-calendar\\day-grid\\src\\Body.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (30:8) {#each weeks as dates}
    function create_each_block$2(ctx) {
    	let week;
    	let current;

    	week = new Week({
    			props: { dates: /*dates*/ ctx[15] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(week.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(week, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const week_changes = {};
    			if (dirty & /*weeks*/ 1) week_changes.dates = /*dates*/ ctx[15];
    			week.$set(week_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(week.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(week.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(week, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(30:8) {#each weeks as dates}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	let each_value = /*weeks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", div0_class_value = /*$theme*/ ctx[2].content);
    			add_location(div0, file$3, 28, 4, 715);

    			attr_dev(div1, "class", div1_class_value = "" + (/*$theme*/ ctx[2].body + (/*$dayMaxEvents*/ ctx[1] === true
    			? ' ' + /*$theme*/ ctx[2].uniform
    			: '')));

    			add_location(div1, file$3, 24, 0, 601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			/*div1_binding*/ ctx[13](div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*weeks*/ 1) {
    				each_value = /*weeks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*$theme*/ 4 && div0_class_value !== (div0_class_value = /*$theme*/ ctx[2].content)) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*$theme, $dayMaxEvents*/ 6 && div1_class_value !== (div1_class_value = "" + (/*$theme*/ ctx[2].body + (/*$dayMaxEvents*/ ctx[1] === true
    			? ' ' + /*$theme*/ ctx[2].uniform
    			: '')))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[13](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $_viewDates;
    	let $dayMaxEvents;
    	let $_hiddenEvents;
    	let $hiddenDays;
    	let $theme;
    	let $_bodyEl;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Body', slots, []);
    	let { _bodyEl, _viewDates, _hiddenEvents, dayMaxEvents, hiddenDays, theme } = getContext('state');
    	validate_store(_bodyEl, '_bodyEl');
    	component_subscribe($$self, _bodyEl, value => $$invalidate(3, $_bodyEl = value));
    	validate_store(_viewDates, '_viewDates');
    	component_subscribe($$self, _viewDates, value => $$invalidate(11, $_viewDates = value));
    	validate_store(_hiddenEvents, '_hiddenEvents');
    	component_subscribe($$self, _hiddenEvents, value => $$invalidate(14, $_hiddenEvents = value));
    	validate_store(dayMaxEvents, 'dayMaxEvents');
    	component_subscribe($$self, dayMaxEvents, value => $$invalidate(1, $dayMaxEvents = value));
    	validate_store(hiddenDays, 'hiddenDays');
    	component_subscribe($$self, hiddenDays, value => $$invalidate(12, $hiddenDays = value));
    	validate_store(theme, 'theme');
    	component_subscribe($$self, theme, value => $$invalidate(2, $theme = value));
    	let weeks;
    	let days;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Body> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$_bodyEl = $$value;
    			_bodyEl.set($_bodyEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		getContext,
    		Week,
    		_bodyEl,
    		_viewDates,
    		_hiddenEvents,
    		dayMaxEvents,
    		hiddenDays,
    		theme,
    		weeks,
    		days,
    		$_viewDates,
    		$dayMaxEvents,
    		$_hiddenEvents,
    		$hiddenDays,
    		$theme,
    		$_bodyEl
    	});

    	$$self.$inject_state = $$props => {
    		if ('_bodyEl' in $$props) $$invalidate(4, _bodyEl = $$props._bodyEl);
    		if ('_viewDates' in $$props) $$invalidate(5, _viewDates = $$props._viewDates);
    		if ('_hiddenEvents' in $$props) $$invalidate(6, _hiddenEvents = $$props._hiddenEvents);
    		if ('dayMaxEvents' in $$props) $$invalidate(7, dayMaxEvents = $$props.dayMaxEvents);
    		if ('hiddenDays' in $$props) $$invalidate(8, hiddenDays = $$props.hiddenDays);
    		if ('theme' in $$props) $$invalidate(9, theme = $$props.theme);
    		if ('weeks' in $$props) $$invalidate(0, weeks = $$props.weeks);
    		if ('days' in $$props) $$invalidate(10, days = $$props.days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$hiddenDays, $dayMaxEvents, $_viewDates, days, weeks*/ 7171) {
    			{
    				$$invalidate(0, weeks = []);
    				$$invalidate(10, days = 7 - $hiddenDays.length);
    				set_store_value(_hiddenEvents, $_hiddenEvents = {}, $_hiddenEvents);

    				for (let i = 0; i < $_viewDates.length / days; ++i) {
    					let dates = [];

    					for (let j = 0; j < days; ++j) {
    						dates.push($_viewDates[i * days + j]);
    					}

    					weeks.push(dates);
    				}
    			}
    		}
    	};

    	return [
    		weeks,
    		$dayMaxEvents,
    		$theme,
    		$_bodyEl,
    		_bodyEl,
    		_viewDates,
    		_hiddenEvents,
    		dayMaxEvents,
    		hiddenDays,
    		theme,
    		days,
    		$_viewDates,
    		$hiddenDays,
    		div1_binding
    	];
    }

    class Body extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Body",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules\@event-calendar\day-grid\src\View.svelte generated by Svelte v3.59.2 */

    function create_fragment$3(ctx) {
    	let header;
    	let t;
    	let body;
    	let current;
    	header = new Header({ $$inline: true });
    	body = new Body({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(body.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(body, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(body, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('View', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<View> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Body });
    	return [];
    }

    class View extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "View",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var DayGrid = {
    	createOptions(options) {
    		options.dayMaxEvents = false;
    		options.dayCellFormat = {day: 'numeric'};
    		options.dayPopoverFormat = {month: 'long', day: 'numeric', year: 'numeric'};
    		options.moreLinkContent = undefined;
    		// Common options
    		options.buttonText.dayGridMonth = 'month';
    		options.buttonText.close = 'Close';
    		options.theme.uniform = 'ec-uniform';
    		options.theme.dayFoot = 'ec-day-foot';
    		options.theme.popup = 'ec-popup';
    		options.view = 'dayGridMonth';
    		options.views.dayGridMonth = {
    			buttonText: btnTextMonth,
    			component: View,
    			dayHeaderFormat: {weekday: 'short'},
    			dayHeaderAriaLabelFormat: {weekday: 'long'},
    			displayEventEnd: false,
    			duration: {months: 1},
    			theme: themeView('ec-day-grid ec-month-view'),
    			titleFormat: {year: 'numeric', month: 'long'}
    		};
    	},

    	createStores(state) {
    		state._days = days(state);
    		state._intlDayCell = intl(state.locale, state.dayCellFormat);
    		state._intlDayPopover = intl(state.locale, state.dayPopoverFormat);
    		state._hiddenEvents = writable({});
    		state._popupDate = writable(null);
    		state._popupChunks = writable([]);
    	}
    };

    /* svelte-app\src\EmployeeTimetable.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1$1, console: console_1$2 } = globals;
    const file$2 = "svelte-app\\src\\EmployeeTimetable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (96:2) {#each arrangementsArray as arrangement}
    function create_each_block$1(ctx) {
    	let li;
    	let b;
    	let t0_value = formatDate(/*arrangement*/ ctx[9].date) + "";
    	let t0;
    	let br;
    	let t1;
    	let t2_value = /*arrangement*/ ctx[9].employee_id + "";
    	let t2;
    	let t3;
    	let t4_value = /*arrangement*/ ctx[9].shift.toUpperCase() + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			li = element("li");
    			b = element("b");
    			t0 = text(t0_value);
    			br = element("br");
    			t1 = text("\n\t\t\t\tEmployee No. ");
    			t2 = text(t2_value);
    			t3 = text(": ");
    			t4 = text(t4_value);
    			t5 = text(" WFH\n\t\t\t");
    			add_location(b, file$2, 97, 4, 2996);
    			add_location(br, file$2, 97, 41, 3033);
    			attr_dev(li, "class", "svelte-abrv17");
    			add_location(li, file$2, 96, 3, 2987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, b);
    			append_dev(b, t0);
    			append_dev(li, br);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			append_dev(li, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*arrangementsArray*/ 4 && t0_value !== (t0_value = formatDate(/*arrangement*/ ctx[9].date) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*arrangementsArray*/ 4 && t2_value !== (t2_value = /*arrangement*/ ctx[9].employee_id + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*arrangementsArray*/ 4 && t4_value !== (t4_value = /*arrangement*/ ctx[9].shift.toUpperCase() + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(96:2) {#each arrangementsArray as arrangement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div2;
    	let div0;
    	let t2;
    	let div0_class_value;
    	let t3;
    	let div1;
    	let t4;
    	let div1_class_value;
    	let t5;
    	let calendar;
    	let t6;
    	let ul;
    	let t7;
    	let div4;
    	let div3;
    	let span0;
    	let t9;
    	let h2;
    	let span1;
    	let t10;
    	let p;
    	let current;
    	let mounted;
    	let dispose;

    	calendar = new Calendar({
    			props: {
    				plugins: /*plugins*/ ctx[3],
    				options: /*options*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let each_value = /*arrangementsArray*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Your Timetable";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t2 = text("Self");
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Team");
    			t5 = space();
    			create_component(calendar.$$.fragment);
    			t6 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div4 = element("div");
    			div3 = element("div");
    			span0 = element("span");
    			span0.textContent = "×";
    			t9 = space();
    			h2 = element("h2");
    			span1 = element("span");
    			t10 = space();
    			p = element("p");
    			attr_dev(h1, "class", "svelte-abrv17");
    			add_location(h1, file$2, 88, 1, 2587);
    			attr_dev(div0, "class", div0_class_value = "current-view-box " + (/*current_view*/ ctx[0] === 'self' ? 'active' : '') + " svelte-abrv17");
    			add_location(div0, file$2, 90, 2, 2651);
    			attr_dev(div1, "class", div1_class_value = "current-view-box " + (/*current_view*/ ctx[0] === 'team' ? 'active' : '') + " svelte-abrv17");
    			add_location(div1, file$2, 91, 2, 2772);
    			attr_dev(div2, "class", "current-view-container svelte-abrv17");
    			add_location(div2, file$2, 89, 1, 2612);
    			add_location(ul, file$2, 94, 1, 2936);
    			attr_dev(span0, "class", "close-button svelte-abrv17");
    			add_location(span0, file$2, 104, 3, 3238);
    			attr_dev(span1, "id", "modalEventTitle");
    			add_location(span1, file$2, 105, 7, 3311);
    			add_location(h2, file$2, 105, 3, 3307);
    			attr_dev(p, "id", "modalEventDetails");
    			add_location(p, file$2, 106, 3, 3354);
    			attr_dev(div3, "class", "modal-content svelte-abrv17");
    			add_location(div3, file$2, 103, 2, 3207);
    			attr_dev(div4, "id", "eventModal");
    			attr_dev(div4, "class", "modal svelte-abrv17");
    			set_style(div4, "display", "none");
    			add_location(div4, file$2, 102, 1, 3147);
    			attr_dev(main, "class", "svelte-abrv17");
    			add_location(main, file$2, 87, 0, 2579);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, t4);
    			append_dev(main, t5);
    			mount_component(calendar, main, null);
    			append_dev(main, t6);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			append_dev(main, t7);
    			append_dev(main, div4);
    			append_dev(div4, div3);
    			append_dev(div3, span0);
    			append_dev(div3, t9);
    			append_dev(div3, h2);
    			append_dev(h2, span1);
    			append_dev(div3, t10);
    			append_dev(div3, p);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[6], false, false, false, false),
    					listen_dev(span0, "click", closeModal, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*current_view*/ 1 && div0_class_value !== (div0_class_value = "current-view-box " + (/*current_view*/ ctx[0] === 'self' ? 'active' : '') + " svelte-abrv17")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*current_view*/ 1 && div1_class_value !== (div1_class_value = "current-view-box " + (/*current_view*/ ctx[0] === 'team' ? 'active' : '') + " svelte-abrv17")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			const calendar_changes = {};
    			if (dirty & /*options*/ 2) calendar_changes.options = /*options*/ ctx[1];
    			calendar.$set(calendar_changes);

    			if (dirty & /*arrangementsArray, formatDate*/ 4) {
    				each_value = /*arrangementsArray*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(calendar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(calendar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(calendar);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function closeModal() {
    	document.getElementById('eventModal').style = 'display:none;';
    }

    function formatDate(date) {
    	let dateObj = new Date(Date.parse(date));
    	let day = dateObj.getDate(); // Gets the day of the month (1-31)
    	let month = dateObj.getMonth() + 1; // Gets the month (0-11) and add 1 to make it (1-12)
    	let year = dateObj.getFullYear(); // Gets the full year (e.g., 2024)

    	// Format day and month to ensure two digits (e.g., "05" instead of "5")
    	if (day < 10) {
    		day = '0' + day;
    	}

    	if (month < 10) {
    		month = '0' + month;
    	}

    	// Return formatted date string
    	return `${day}/${month}/${year}`;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EmployeeTimetable', slots, []);
    	let current_user = '130002';
    	let current_view = 'self';
    	let plugins = [DayGrid];

    	let options = {
    		events: [],
    		eventClick(info) {
    			// Populate modal with event details
    			document.getElementById('modalEventTitle').innerText = formatDate(info.event.start);

    			document.getElementById('modalEventDetails').innerText = info.event.title.slice(-6) + " for employee no. " + info.event.title.slice(0, 6);

    			// Display the modal
    			document.getElementById('eventModal').style.display = 'block';
    		}
    	};

    	function updateView(view) {
    		$$invalidate(0, current_view = view);
    		fetchArrangements();
    	}

    	let arrangementsArray = [];

    	async function fetchArrangements() {
    		const endpoint = current_view === 'self'
    		? `${config.base_url}/employee_view_own_ttbl?eid=${current_user}`
    		: `${config.base_url}/employee_view_team_ttbl?eid=${current_user}`;

    		try {
    			const response = await fetch(endpoint);

    			if (!response.ok) {
    				throw new Error('Failed to fetch data');
    			}

    			const data = await response.json();

    			// Reset arrays before pushing new data
    			$$invalidate(2, arrangementsArray = []);

    			$$invalidate(1, options.events = [], options);
    			arrangementsArray.push(...data.arrangements);

    			for (let a of arrangementsArray) {
    				let arrangementDate = new Date(Date.parse(a.date));

    				options.events.push({
    					title: a.employee_id + ": " + a.shift.toUpperCase() + " WFH",
    					start: arrangementDate,
    					end: arrangementDate,
    					allDay: true
    				});
    			}

    			$$invalidate(2, arrangementsArray = [...arrangementsArray]);
    			arrangementsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    			$$invalidate(1, options.events = [...options.events], options);
    		} catch(error) {
    			console.error('Error fetching data:', error);
    		}
    	}

    	onMount(() => {
    		fetchArrangements();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<EmployeeTimetable> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => updateView('self');
    	const click_handler_1 = () => updateView('team');

    	$$self.$capture_state = () => ({
    		onMount,
    		Calendar,
    		DayGrid,
    		config,
    		current_user,
    		current_view,
    		plugins,
    		options,
    		updateView,
    		closeModal,
    		arrangementsArray,
    		fetchArrangements,
    		formatDate
    	});

    	$$self.$inject_state = $$props => {
    		if ('current_user' in $$props) current_user = $$props.current_user;
    		if ('current_view' in $$props) $$invalidate(0, current_view = $$props.current_view);
    		if ('plugins' in $$props) $$invalidate(3, plugins = $$props.plugins);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('arrangementsArray' in $$props) $$invalidate(2, arrangementsArray = $$props.arrangementsArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		current_view,
    		options,
    		arrangementsArray,
    		plugins,
    		updateView,
    		click_handler,
    		click_handler_1
    	];
    }

    class EmployeeTimetable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EmployeeTimetable",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* svelte-app\src\CancelRequest.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, console: console_1$1 } = globals;
    const file$1 = "svelte-app\\src\\CancelRequest.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (80:12) {#each tableData as person}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*person*/ ctx[10].arrangementId + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*person*/ ctx[10].created_at + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*person*/ ctx[10].date + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*person*/ ctx[10].employee_id + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*person*/ ctx[10].notes + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*person*/ ctx[10].shift + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*person*/ ctx[10].status + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*person*/ ctx[10].supervisors + "";
    	let t14;
    	let t15;
    	let td8;
    	let button0;
    	let t17;
    	let button1;
    	let t19;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*person*/ ctx[10]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[6](/*person*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			button0 = element("button");
    			button0.textContent = "Edit";
    			t17 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			t19 = space();
    			attr_dev(td0, "class", "svelte-edfnmy");
    			add_location(td0, file$1, 82, 20, 2307);
    			attr_dev(td1, "class", "svelte-edfnmy");
    			add_location(td1, file$1, 83, 20, 2359);
    			attr_dev(td2, "class", "svelte-edfnmy");
    			add_location(td2, file$1, 84, 20, 2408);
    			attr_dev(td3, "class", "svelte-edfnmy");
    			add_location(td3, file$1, 85, 20, 2451);
    			attr_dev(td4, "class", "svelte-edfnmy");
    			add_location(td4, file$1, 86, 20, 2501);
    			attr_dev(td5, "class", "svelte-edfnmy");
    			add_location(td5, file$1, 87, 20, 2545);
    			attr_dev(td6, "class", "svelte-edfnmy");
    			add_location(td6, file$1, 88, 20, 2589);
    			attr_dev(td7, "class", "svelte-edfnmy");
    			add_location(td7, file$1, 89, 20, 2634);
    			attr_dev(button0, "class", "svelte-edfnmy");
    			add_location(button0, file$1, 91, 24, 2713);
    			attr_dev(button1, "class", "svelte-edfnmy");
    			add_location(button1, file$1, 92, 24, 2793);
    			attr_dev(td8, "class", "svelte-edfnmy");
    			add_location(td8, file$1, 90, 20, 2684);
    			add_location(tr, file$1, 80, 16, 2279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			append_dev(td7, t14);
    			append_dev(tr, t15);
    			append_dev(tr, td8);
    			append_dev(td8, button0);
    			append_dev(td8, t17);
    			append_dev(td8, button1);
    			append_dev(tr, t19);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tableData*/ 1 && t0_value !== (t0_value = /*person*/ ctx[10].arrangementId + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*tableData*/ 1 && t2_value !== (t2_value = /*person*/ ctx[10].created_at + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*tableData*/ 1 && t4_value !== (t4_value = /*person*/ ctx[10].date + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*tableData*/ 1 && t6_value !== (t6_value = /*person*/ ctx[10].employee_id + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*tableData*/ 1 && t8_value !== (t8_value = /*person*/ ctx[10].notes + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*tableData*/ 1 && t10_value !== (t10_value = /*person*/ ctx[10].shift + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*tableData*/ 1 && t12_value !== (t12_value = /*person*/ ctx[10].status + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*tableData*/ 1 && t14_value !== (t14_value = /*person*/ ctx[10].supervisors + "")) set_data_dev(t14, t14_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:12) {#each tableData as person}",
    		ctx
    	});

    	return block;
    }

    // (101:4) {#if showModal}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Are you sure you want to cancel this request?";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Yes";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Back";
    			add_location(p, file$1, 103, 16, 3080);
    			attr_dev(button0, "class", "svelte-edfnmy");
    			add_location(button0, file$1, 104, 16, 3149);
    			attr_dev(button1, "class", "svelte-edfnmy");
    			add_location(button1, file$1, 105, 16, 3211);
    			attr_dev(div0, "class", "modal-content svelte-edfnmy");
    			add_location(div0, file$1, 102, 12, 3036);
    			attr_dev(div1, "class", "overlay svelte-edfnmy");
    			add_location(div1, file$1, 101, 8, 3002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t1);
    			append_dev(div0, button0);
    			append_dev(div0, t3);
    			append_dev(div0, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*cancelRequest*/ ctx[2], false, false, false, false),
    					listen_dev(button1, "click", /*closeModal*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(101:4) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t11;
    	let th5;
    	let t13;
    	let th6;
    	let t15;
    	let th7;
    	let t17;
    	let th8;
    	let t19;
    	let tbody;
    	let t20;
    	let each_value = /*tableData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*showModal*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Pending Arrangements";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Arrangement ID";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Date Created";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Date of Shift";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Employee ID";
    			t9 = space();
    			th4 = element("th");
    			th4.textContent = "Notes";
    			t11 = space();
    			th5 = element("th");
    			th5.textContent = "Shift";
    			t13 = space();
    			th6 = element("th");
    			th6.textContent = "Status";
    			t15 = space();
    			th7 = element("th");
    			th7.textContent = "Supervisors";
    			t17 = space();
    			th8 = element("th");
    			th8.textContent = "Action";
    			t19 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-edfnmy");
    			add_location(h1, file$1, 61, 4, 1735);
    			attr_dev(th0, "class", "svelte-edfnmy");
    			add_location(th0, file$1, 67, 16, 1871);
    			attr_dev(th1, "class", "svelte-edfnmy");
    			add_location(th1, file$1, 68, 16, 1911);
    			attr_dev(th2, "class", "svelte-edfnmy");
    			add_location(th2, file$1, 69, 16, 1949);
    			attr_dev(th3, "class", "svelte-edfnmy");
    			add_location(th3, file$1, 70, 16, 1988);
    			attr_dev(th4, "class", "svelte-edfnmy");
    			add_location(th4, file$1, 71, 16, 2025);
    			attr_dev(th5, "class", "svelte-edfnmy");
    			add_location(th5, file$1, 72, 16, 2056);
    			attr_dev(th6, "class", "svelte-edfnmy");
    			add_location(th6, file$1, 73, 16, 2087);
    			attr_dev(th7, "class", "svelte-edfnmy");
    			add_location(th7, file$1, 74, 16, 2119);
    			attr_dev(th8, "class", "svelte-edfnmy");
    			add_location(th8, file$1, 75, 16, 2156);
    			add_location(tr, file$1, 66, 12, 1850);
    			add_location(thead, file$1, 65, 8, 1830);
    			add_location(tbody, file$1, 78, 8, 2215);
    			attr_dev(table, "class", "svelte-edfnmy");
    			add_location(table, file$1, 64, 4, 1814);
    			add_location(main, file$1, 60, 2, 1724);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t3);
    			append_dev(tr, th1);
    			append_dev(tr, t5);
    			append_dev(tr, th2);
    			append_dev(tr, t7);
    			append_dev(tr, th3);
    			append_dev(tr, t9);
    			append_dev(tr, th4);
    			append_dev(tr, t11);
    			append_dev(tr, th5);
    			append_dev(tr, t13);
    			append_dev(tr, th6);
    			append_dev(tr, t15);
    			append_dev(tr, th7);
    			append_dev(tr, t17);
    			append_dev(tr, th8);
    			append_dev(table, t19);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			append_dev(main, t20);
    			if (if_block) if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cancelAlert, tableData, editPage*/ 9) {
    				each_value = /*tableData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function editPage(person) {
    	alert(`Editing shift!`);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CancelRequest', slots, []);
    	let tableData = []; // Data array for the table
    	let showModal = false;
    	let selectedRow = null;
    	let current_user = '130002';

    	// Function to fetch table data from the API
    	async function fetchTableData() {
    		try {
    			const response = await fetch(`http://127.0.0.1:5000/pending-arrangements?eid=${current_user}`); // Update the URL as needed

    			if (!response.ok) {
    				throw new Error('Network response was not ok');
    			}

    			$$invalidate(0, tableData = await response.json()); // Parse the JSON response
    		} catch(error) {
    			console.error('Error fetching table data:', error);
    		}
    	}

    	async function cancelRequest() {
    		try {
    			const response = await fetch(`http://127.0.0.1:5000/arrangements/cancel?aID=${selectedRow.arrangementId}`, { method: 'POST' });
    			if (!response.ok) throw new Error("Failed to cancel request");

    			// Refresh the table data after rejecting
    			await fetchTableData();

    			$$invalidate(0, tableData = tableData.filter(person => person.status == "pending"));
    			$$invalidate(1, showModal = false);
    			selectedRow = null;
    		} catch(error) {
    			console.error("Error updating status:", error);
    		}
    	}

    	// Call fetchTableData when the component is first loaded
    	onMount(fetchTableData);

    	function cancelAlert(person) {
    		selectedRow = person;
    		$$invalidate(1, showModal = true);
    	}

    	function closeModal() {
    		$$invalidate(1, showModal = false);
    		selectedRow = null;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<CancelRequest> was created with unknown prop '${key}'`);
    	});

    	const click_handler = person => editPage();
    	const click_handler_1 = person => cancelAlert(person);

    	$$self.$capture_state = () => ({
    		onMount,
    		tableData,
    		showModal,
    		selectedRow,
    		current_user,
    		fetchTableData,
    		cancelRequest,
    		editPage,
    		cancelAlert,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('tableData' in $$props) $$invalidate(0, tableData = $$props.tableData);
    		if ('showModal' in $$props) $$invalidate(1, showModal = $$props.showModal);
    		if ('selectedRow' in $$props) selectedRow = $$props.selectedRow;
    		if ('current_user' in $$props) current_user = $$props.current_user;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tableData,
    		showModal,
    		cancelRequest,
    		cancelAlert,
    		closeModal,
    		click_handler,
    		click_handler_1
    	];
    }

    class CancelRequest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CancelRequest",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const jwtToken = writable(localStorage.getItem('jwt') || '');
    const userClaims = writable({});

    // Function to decode the JWT and extract claims
    function decodeJWT(token) {
        if (!token) return {};

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    }

    // Initialize claims if token exists
    userClaims.set(decodeJWT(localStorage.getItem('jwt')) || {});

    // Subscribe to jwtToken updates to store it and update claims
    jwtToken.subscribe((token) => {
        if (token) {
            localStorage.setItem('jwt', token);
            userClaims.set(decodeJWT(token)); // Update claims
            console.log("Token added");
            console.log(userClaims);
        } else {
            localStorage.removeItem('jwt');
            userClaims.set({});
            console.log("Token removed");
        }
    });

    /* svelte-app\src\App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "svelte-app\\src\\App.svelte";

    // (141:0) {:else}
    function create_else_block(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(141:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:0) {#if isLoggedIn}
    function create_if_block(ctx) {
    	let main;
    	let nav0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t4;
    	let button2;
    	let t6;
    	let t7;
    	let nav1;
    	let button3;
    	let t9;
    	let button4;
    	let t11;
    	let button5;
    	let t13;
    	let button6;
    	let t15;
    	let button7;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$currentRoute*/ ctx[2] === '/withdrawal-request') return 0;
    		if (/*$currentRoute*/ ctx[2] === '/apply') return 1;
    		if (/*$currentRoute*/ ctx[2] === '/employee-timetable') return 2;
    		if (/*$currentRoute*/ ctx[2] === '/hr-view-timetable') return 3;
    		if (/*$currentRoute*/ ctx[2] === '/manager-timetable') return 4;
    		if (/*$currentRoute*/ ctx[2] === '/cancel-request') return 5;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*showModal*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav0 = element("nav");
    			button0 = element("button");
    			button0.textContent = "Withdrawals";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Apply";
    			t3 = space();
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			button2 = element("button");
    			button2.textContent = "Apply";
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			nav1 = element("nav");
    			button3 = element("button");
    			button3.textContent = "View Own Schedule";
    			t9 = space();
    			button4 = element("button");
    			button4.textContent = "Withdrawal Request";
    			t11 = space();
    			button5 = element("button");
    			button5.textContent = "HR Timetable";
    			t13 = space();
    			button6 = element("button");
    			button6.textContent = "Cancel Request";
    			t15 = space();
    			button7 = element("button");
    			button7.textContent = "Manager Timetable";
    			attr_dev(button0, "class", "nav-link svelte-plq71i");
    			toggle_class(button0, "active", /*$currentRoute*/ ctx[2] === '/withdrawal-request');
    			add_location(button0, file, 64, 8, 1904);
    			attr_dev(button1, "class", "nav-link svelte-plq71i");
    			toggle_class(button1, "active", /*$currentRoute*/ ctx[2] === '/apply');
    			add_location(button1, file, 71, 8, 2133);
    			attr_dev(nav0, "class", "top-nav svelte-plq71i");
    			add_location(nav0, file, 63, 4, 1874);
    			attr_dev(div, "class", "content svelte-plq71i");
    			toggle_class(div, "transitioning", /*$isRouteTransitioning*/ ctx[3]);
    			add_location(div, file, 81, 4, 2385);
    			attr_dev(button2, "class", "apply-button svelte-plq71i");
    			add_location(button2, file, 98, 4, 3063);
    			attr_dev(button3, "class", "svelte-plq71i");
    			toggle_class(button3, "active", /*$currentRoute*/ ctx[2] === '/employee-timetable');
    			add_location(button3, file, 107, 8, 3327);
    			attr_dev(button4, "class", "svelte-plq71i");
    			toggle_class(button4, "active", /*$currentRoute*/ ctx[2] === '/withdrawal-request');
    			add_location(button4, file, 114, 8, 3537);
    			attr_dev(button5, "class", "svelte-plq71i");
    			toggle_class(button5, "active", /*$currentRoute*/ ctx[2] === '/hr-view-timetable');
    			add_location(button5, file, 120, 8, 3743);
    			attr_dev(button6, "class", "svelte-plq71i");
    			toggle_class(button6, "active", /*$currentRoute*/ ctx[2] === '/cancel-request');
    			add_location(button6, file, 126, 8, 3941);
    			attr_dev(button7, "class", "svelte-plq71i");
    			toggle_class(button7, "active", /*$currentRoute*/ ctx[2] === '/manager-timetable');
    			add_location(button7, file, 132, 8, 4135);
    			attr_dev(nav1, "class", "function-nav svelte-plq71i");
    			add_location(nav1, file, 106, 4, 3292);
    			attr_dev(main, "class", "svelte-plq71i");
    			add_location(main, file, 61, 0, 1835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav0);
    			append_dev(nav0, button0);
    			append_dev(nav0, t1);
    			append_dev(nav0, button1);
    			append_dev(main, t3);
    			append_dev(main, div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(main, t4);
    			append_dev(main, button2);
    			append_dev(main, t6);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t7);
    			append_dev(main, nav1);
    			append_dev(nav1, button3);
    			append_dev(nav1, t9);
    			append_dev(nav1, button4);
    			append_dev(nav1, t11);
    			append_dev(nav1, button5);
    			append_dev(nav1, t13);
    			append_dev(nav1, button6);
    			append_dev(nav1, t15);
    			append_dev(nav1, button7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false, false),
    					listen_dev(button2, "click", /*openModal*/ ctx[6], false, false, false, false),
    					listen_dev(button3, "click", /*click_handler_2*/ ctx[12], false, false, false, false),
    					listen_dev(button4, "click", /*click_handler_3*/ ctx[13], false, false, false, false),
    					listen_dev(button5, "click", /*click_handler_4*/ ctx[14], false, false, false, false),
    					listen_dev(button6, "click", /*click_handler_5*/ ctx[15], false, false, false, false),
    					listen_dev(button7, "click", /*click_handler_6*/ ctx[16], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button0, "active", /*$currentRoute*/ ctx[2] === '/withdrawal-request');
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button1, "active", /*$currentRoute*/ ctx[2] === '/apply');
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (!current || dirty & /*$isRouteTransitioning*/ 8) {
    				toggle_class(div, "transitioning", /*$isRouteTransitioning*/ ctx[3]);
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showModal*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t7);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button3, "active", /*$currentRoute*/ ctx[2] === '/employee-timetable');
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button4, "active", /*$currentRoute*/ ctx[2] === '/withdrawal-request');
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button5, "active", /*$currentRoute*/ ctx[2] === '/hr-view-timetable');
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button6, "active", /*$currentRoute*/ ctx[2] === '/cancel-request');
    			}

    			if (!current || dirty & /*$currentRoute*/ 4) {
    				toggle_class(button7, "active", /*$currentRoute*/ ctx[2] === '/manager-timetable');
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(61:0) {#if isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (93:54) 
    function create_if_block_7(ctx) {
    	let cancelrequest;
    	let current;
    	cancelrequest = new CancelRequest({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cancelrequest.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cancelrequest, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cancelrequest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cancelrequest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cancelrequest, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(93:54) ",
    		ctx
    	});

    	return block;
    }

    // (91:57) 
    function create_if_block_6(ctx) {
    	let managertimetable;
    	let current;
    	managertimetable = new ManagerTimetable({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(managertimetable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(managertimetable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(managertimetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(managertimetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(managertimetable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(91:57) ",
    		ctx
    	});

    	return block;
    }

    // (89:57) 
    function create_if_block_5(ctx) {
    	let hrviewtimetable;
    	let current;
    	hrviewtimetable = new HRViewTimetable({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(hrviewtimetable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hrviewtimetable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hrviewtimetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hrviewtimetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hrviewtimetable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(89:57) ",
    		ctx
    	});

    	return block;
    }

    // (87:58) 
    function create_if_block_4(ctx) {
    	let employeetimetable;
    	let current;
    	employeetimetable = new EmployeeTimetable({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(employeetimetable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(employeetimetable, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(employeetimetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(employeetimetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(employeetimetable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(87:58) ",
    		ctx
    	});

    	return block;
    }

    // (85:45) 
    function create_if_block_3(ctx) {
    	let applymodal;
    	let current;
    	applymodal = new Apply({ $$inline: true });
    	applymodal.$on("close", /*closeModal*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(applymodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(applymodal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(applymodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(applymodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(applymodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(85:45) ",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#if $currentRoute === '/withdrawal-request'}
    function create_if_block_2(ctx) {
    	let withdrawalrequest;
    	let current;
    	withdrawalrequest = new WithdrawalRequest({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(withdrawalrequest.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(withdrawalrequest, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(withdrawalrequest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(withdrawalrequest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(withdrawalrequest, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(83:8) {#if $currentRoute === '/withdrawal-request'}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#if showModal}
    function create_if_block_1(ctx) {
    	let applymodal;
    	let current;
    	applymodal = new Apply({ $$inline: true });
    	applymodal.$on("close", /*closeModal*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(applymodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(applymodal, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(applymodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(applymodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(applymodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(102:4) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoggedIn*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currentRoute;
    	let $userClaims;
    	let $jwtToken;
    	let $isRouteTransitioning;
    	validate_store(userClaims, 'userClaims');
    	component_subscribe($$self, userClaims, $$value => $$invalidate(17, $userClaims = $$value));
    	validate_store(jwtToken, 'jwtToken');
    	component_subscribe($$self, jwtToken, $$value => $$invalidate(9, $jwtToken = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let isLoggedIn = $jwtToken !== '';

    	// Claims access
    	const userId = $userClaims.sub;

    	const role = $userClaims.role;
    	const firstName = $userClaims.first_name;
    	const lastName = $userClaims.last_name;

    	// Create stores for route management
    	const currentRoute = writable('/');

    	validate_store(currentRoute, 'currentRoute');
    	component_subscribe($$self, currentRoute, value => $$invalidate(2, $currentRoute = value));
    	const isRouteTransitioning = writable(false);
    	validate_store(isRouteTransitioning, 'isRouteTransitioning');
    	component_subscribe($$self, isRouteTransitioning, value => $$invalidate(3, $isRouteTransitioning = value));

    	// Modal state
    	let showModal = false;

    	// Modal handlers
    	const openModal = () => {
    		$$invalidate(1, showModal = true);
    		console.log("Modal opened");
    	};

    	const closeModal = () => {
    		$$invalidate(1, showModal = false);
    		console.log("Modal closed");
    	};

    	// Enhanced navigation function with transition handling
    	const navigateTo = async path => {
    		if ($currentRoute === path) return;
    		isRouteTransitioning.set(true);
    		await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for transition
    		currentRoute.set(path);
    		isRouteTransitioning.set(false);
    	};

    	// Handle browser back/forward buttons
    	if (typeof window !== 'undefined') {
    		window.onpopstate = event => {
    			if (event.state?.path) {
    				navigateTo(event.state.path);
    			}
    		};
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => navigateTo('/withdrawal-request');
    	const click_handler_1 = () => navigateTo('/apply');
    	const click_handler_2 = () => navigateTo('/employee-timetable');
    	const click_handler_3 = () => navigateTo('/withdrawal-request');
    	const click_handler_4 = () => navigateTo('/hr-view-timetable');
    	const click_handler_5 = () => navigateTo('/cancel-request');
    	const click_handler_6 = () => navigateTo('/manager-timetable');

    	$$self.$capture_state = () => ({
    		writable,
    		ApplyModal: Apply,
    		WithdrawalRequest,
    		HRViewTimetable,
    		ManagerTimetable,
    		EmployeeTimetable,
    		CancelRequest,
    		jwtToken,
    		userClaims,
    		Login,
    		isLoggedIn,
    		userId,
    		role,
    		firstName,
    		lastName,
    		currentRoute,
    		isRouteTransitioning,
    		showModal,
    		openModal,
    		closeModal,
    		navigateTo,
    		$currentRoute,
    		$userClaims,
    		$jwtToken,
    		$isRouteTransitioning
    	});

    	$$self.$inject_state = $$props => {
    		if ('isLoggedIn' in $$props) $$invalidate(0, isLoggedIn = $$props.isLoggedIn);
    		if ('showModal' in $$props) $$invalidate(1, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$jwtToken*/ 512) {
    			$$invalidate(0, isLoggedIn = $jwtToken !== '');
    		}
    	};

    	return [
    		isLoggedIn,
    		showModal,
    		$currentRoute,
    		$isRouteTransitioning,
    		currentRoute,
    		isRouteTransitioning,
    		openModal,
    		closeModal,
    		navigateTo,
    		$jwtToken,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
