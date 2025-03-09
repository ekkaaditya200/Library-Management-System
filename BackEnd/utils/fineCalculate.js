export const fineCalculate = (dueDate) => {
    const finePerHour = 0.1; //10Cent
    const today = new Date();
    if(today > dueDate){
        const lateHours = Math.ceil((today - dueDate) / (60 * 60 * 1000))
        const fine = lateHours * finePerHour;
        return fine;
    }

    return 0;
}