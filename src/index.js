import { Task } from './task';

function mapIndices(outputs) {
    var i = 0, j = 0;

    return outputs.map(type =>
        ({
            type,
            index: type === 'option' ? i++ : j++
        }));
}

export function install(editor) {
        
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
            
            mapIndices(component.task.outputs).map(({ type, index }, i) => {
                outputs[i] = task[type](index);
            });
        }

    });
}