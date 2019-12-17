// import { Partition } from './partition';

export class SortingService {
    partitions = [];

    createQueue(currentPartition, queue, first) {
        queue.push(currentPartition);

        if (currentPartition.isSingleItemList()) {
            return;
        }

        let left = currentPartition.getLeftHalf();
        let right = currentPartition.getRightHalf();

        this.createQueue(left, queue, null);
        this.createQueue(right, queue, null);

        if (first) {
            queue.sort((a, b) => {
                let x = a.items.length;
                let y = b.items.length;

                if (x === 1 && queue[this.findWithAttr(queue, 'id', a.parentId)].items.length % 2 === 1) {
                    x += 1;
                }

                if (y === 1 && queue[this.findWithAttr(queue, 'id', b.parentId)].items.length % 2 === 1) {
                    y += 1;
                }

                return x - y;
            })
            return queue;
        }
    }

    findWithAttr(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }
}
