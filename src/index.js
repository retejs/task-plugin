import { Task } from './task';

function install(editor) {
        
    editor.on('componentregister', component => {
        if (!component.task)
            throw 'Task plugin requires a task property in component';
        if (component.task.outputs.constructor !== Object)
            throw 'The "outputs" field must be an object whose keys correspond to the Output\'s keys';
        
        const taskWorker = component.worker;
        const taskOptions = component.task;

        component.worker = (node, inputs, outputs) => {
            const task = new Task(inputs, component, (ctx, inps, data) => {
                return taskWorker.call(ctx, node, inps, data);
            });

            if (taskOptions.init) taskOptions.init(task, node);
            
            Object.keys(taskOptions.outputs).map(key => {
                outputs[key] = { type: taskOptions.outputs[key], key, task }
            });
        }

    });
}

export default {
    install
}