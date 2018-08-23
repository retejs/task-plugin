export class Task {

    constructor(inputs, component, action) {
        this.inputs = inputs;
        this.component = component;
        this.action = action;
        this.next = [];
        this.outputData = null;
        this.closed = [];

        this.getOptions().forEach(key => {
            this.inputs[key].forEach(con => {
                con.task.next.push({key: con.key, task: this});
            })
        });
    }

    getOptions() {
        return Object.keys(this.inputs).filter(key => this.inputs[key][0] && this.inputs[key][0].task)
    }

    getOutputs() {
        return Object.keys(this.inputs).filter(key => this.inputs[key][0] && this.inputs[key][0].get);
    }

    reset() {
        this.outputData = null;
    }

    async run(data, needReset = true, garbage = [], propagate = true) {
        garbage.push(this);
        
        var inputs = {};
        
        await Promise.all(this.getOutputs().map(async key => {
            inputs[key] = await Promise.all(this.inputs[key].map(async con => {
                if (con) {
                    await con.run(data, false, garbage, false);
                    return con.get();
                }
            }));
        }));

        if (!this.outputData) {
            this.outputData = await this.action(inputs, data);

            if (propagate)
                await Promise.all(
                    this.next
                        .filter(f => !this.closed.includes(f.key))
                        .map(async f => 
                            await f.task.run(data, false, garbage)
                        )
                );
        }
        
        if (needReset)
            garbage.map(t => t.reset());
    }

    option(key) {
        var task = this;

        return {task, key}
    }

    output(key) {
        var task = this;

        return {
            run: task.run.bind(task),
            get() {
                return task.outputData[key];
            }
        }
    }
}