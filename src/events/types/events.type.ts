import { eventEnum } from "../enums/event-type.enum";

export type EventType = eventEnum.create | eventEnum.delete | eventEnum.update | eventEnum.sync;
