import { Task } from './task';

function install(editor) {
        
    editor.on('componentregister', component => {
        if (!component.task)
            throw 'Task plugin requires a task property in component';
        if (component.task.outputs.constructor !== Object)
            throw 'The "outputs" field must be an object whose keys correspond to the Output\'s keys';
        
        const taskWorker = component.worker;
        const init = component.task.init || function() { };
        const types = component.task.outputs;

        component.worker = (node, inputs, outputs) => {
            const task = new Task(inputs, component, (inps, data) => {
                return taskWorker.call(task, node, inps, data);
            });

            init(task, node);
            
            Object.keys(types).map(key => {
                outputs[key] = { type: types[key], key, task }
            });
        }

    });
}

export default {
    install
}