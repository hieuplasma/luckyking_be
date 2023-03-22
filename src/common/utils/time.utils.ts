export function getTimeToday(hour: number, minute: number) {
    const now = new Date();
    const today6am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    // if (now.getTime() > today6am.getTime()) {
    //     today6am.setDate(today6am.getDate() + 1);
    // }
    return today6am
}