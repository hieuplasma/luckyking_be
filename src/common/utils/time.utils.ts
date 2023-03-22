export function getTimeToday(hour: number, minute: number) {
    const now = new Date();
    const today6am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    return today6am
}

export function getNearestTimeDay(day: number, hour: number, minute: number) {
    let currentDate = new Date();

    // Get the day of the week (0-6), where 0 = Sunday, 1 = Monday, etc.
    let currentDay = currentDate.getDay();
    // Calculate the difference between the current day and 'day'
    let diff = day - currentDay;

    if (diff < 0) {
        // If the difference is negative, add 7 to get the next Wednesday
        diff += 7;
    }

    // Set the date to the next 'day' at 'hour':'minute'
    let nextWednesday = new Date(currentDate.getTime() + (diff * 24 * 60 * 60 * 1000));
    nextWednesday.setHours(hour, minute, 0, 0);
    return nextWednesday
}