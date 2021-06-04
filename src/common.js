import store from './store/index';

const eventTypes = store.getters["assessment/events/types"];

export const colors = [
    '#025557', '#36AFB3', '#DB793B', '#632905', '#67898A'
];

export const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export const accountTypes = [
    {
        id: 1,
        name: "Taiga",
    },
    {
        id: 2,
        name: "Github",
    },
    {
        id: 3,
        name: "Mattermost",
    },
];

export const eventTypeColor = (type) => colors[eventTypes.findIndex((eventType) => eventType === type)];
