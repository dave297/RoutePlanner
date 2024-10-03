export const GetDistance = async (originId, destId, mode, units = 'metric') => {
    console.log("Fetching distance...");

    try {
        const response = await fetch('https://maps.googleapis.com/maps/api/distancematrix/json'
            + `?destinations=place_id:${destId}`
            + `&origins=place_id:${originId}`
            + `&units=${units}`
            + `&mode=${mode}`
            + '&key=AIzaSyBpR0baoqOI31NjyVlRUck1zq8imN_7z9A');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;  // Return data from the function
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;  // Rethrow the error
    }
};