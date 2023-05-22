import { Lottery } from "@prisma/client";



class KenoQueueLottery {
    private lotteriesQueue = new Map();

    pushLotteryToQueue(lotteries: Lottery[]) {
        console.log('push lotteries to queue')
        for (const lottery of lotteries) {
            const { drawCode } = lottery;
            const queue = this.lotteriesQueue.get(drawCode);

            if (!queue) {
                this.lotteriesQueue.set(drawCode, [lottery]);
            } else {
                queue.push(lottery);
            }
        }
    }

    getLotteryByDrawCode(drawCode: number): Lottery {
        const queue = this.lotteriesQueue.get(drawCode)
        if (!queue) return null;
        return queue.shift();
    }
}

export default (new KenoQueueLottery());