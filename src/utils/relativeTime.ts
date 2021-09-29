
export const relativeTime = (current: Date, previous: Date) => {
    
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
    
    var elapsed = current.getTime() - previous.getTime();
    if(elapsed < 0) {
    	return null;
    } else if (elapsed < msPerMinute) {
         return { value: Math.floor(elapsed/1000), unit: 'second' };   
    } else if (elapsed < msPerHour) {
         return { value: Math.floor(elapsed/msPerMinute), unit: 'minute' };
    } else if (elapsed < msPerDay ) {
         return { value: Math.floor(elapsed/msPerHour), unit: 'hour' };
    } else if (elapsed < msPerMonth) {
         return { value: Math.floor(elapsed/msPerDay), unit: 'day' };
    } else if (elapsed < msPerYear) {
         return { value: Math.floor(elapsed/msPerMonth), unit: 'month' };
    } else {
         return { value: Math.floor(elapsed/msPerYear), unit: 'year' }; 
    }
}

export const formatRelativeTimeToString = (current: Date, previous: Date) => {
    const result = relativeTime(current, previous);
    if(result === null) {
        return null;
    }
    
    return result.value + ' ' + result.unit + (result.value === 1 ? '' : 's') + ' ago';
}
