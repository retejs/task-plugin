import { Task } from './task';

function install(editor) {
        
    editor.on('componentregister', component => {
        if (!component.task)
            throw 'Task plugin requires a task property in component';
        
        const taskWorker = component.worker;
        const init = component.task.init || function() { };

        component.worker = (node, inputs, outputs) => {
            const task = new Task(inputs, (inps, data) => {
                return taskWorker.call(task, node, inps, data);
            });

            init(task, node);
            
            Object.keys(component.task.outputs).map(key => {
                const type = component.task.outputs[key];

                if (type === 'option')
                    outputs[key] = task.option(key);
                else if (type === 'output')
                    outputs[key] = task.output(key);
            });
            console.log(inputs, outputs)
        }

    });
}

export default {
    install
}