import { ICalEventBusyStatus } from 'ical-generator';
import type { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

export default {
	filter: {
		and: [
			{ property: 'Category', select: { does_not_equal: 'X' } },
			{ property: 'Category', select: { does_not_equal: 'Y' } }
		]
	},
	dateProperty: 'Next event',
	titleProperty: 'Name',
	busy: ICalEventBusyStatus.FREE
} as {
	//filter: Readonly<QueryDatabaseParameters['filter']>;
	dateProperty: Readonly<string>;
	titleProperty: Readonly<string>;
	busy: Readonly<ICalEventBusyStatus>;
};
