import ical from 'ical-generator';
import { Client } from '@notionhq/client';
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import nodemailer from 'nodemailer';

import config from '$lib/config';
import { ACCESS_KEY, NOTION_TOKEN, EMAIL_USER, EMAIL_PASS, EMAIL_TO } from '$env/static/private';
import type { RequestHandler } from './$types';

export const trailingSlash = 'never';

const notion = new Client({ auth: NOTION_TOKEN });

const sendErrorEmail = async (error: Error) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.forwardemail.net',
		port: 465,
		secure: true,
		auth: {
			user: EMAIL_USER,
			pass: EMAIL_PASS
		}
	});

	const mailOptions = {
		from: EMAIL_USER,
		to: EMAIL_TO,
		subject: 'Error in Notion ICS Server',
		text: `An error occurred: ${error.message}\n\nStack trace:\n${error.stack}`
	};

	await transporter.sendMail(mailOptions);
};

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const secret = url.searchParams.get('secret');
		if (secret !== ACCESS_KEY) {
			return new Response('Forbidden', { status: 403 });
		}

		const { id } = params;

		const databaseMetadata = await notion.databases.retrieve({ database_id: id });

		const databaseEntries = [];
		let query: QueryDatabaseResponse | { has_more: true; next_cursor: undefined } = {
			has_more: true,
			next_cursor: undefined
		};
		while (query.has_more) {
			query = await notion.databases.query({
				database_id: id,
				page_size: 100,
				start_cursor: query.next_cursor,
				filter: config.filter
			});
			databaseEntries.push(...query.results);
		}

		const filtered: {
			title: string;
			date: { start: string; end: string | null; time_zone: string | null };
		}[] = databaseEntries.flatMap((object) => {
			const dateProperty = object.properties[config.dateProperty]?.date;
			if (!dateProperty || !dateProperty.start) {
				return [];
			}
			return [
				{
					title: object.properties[config.titleProperty]?.title[0]?.text?.content || 'Untitled Event',
					date: dateProperty
				}
			];
		});
		
		const calendar = ical({
			name: databaseMetadata.title[0].text.content,
			prodId: { company: 'Michal Ferber', language: 'EN', product: 'notion-ics' }
		});
		filtered.forEach((event) => {
			calendar.createEvent({
				start: new Date(event.date.start),
				end: new Date(Date.parse(event.date.end ?? event.date.start) + 86400000), // end date is exclusive, so add 1 day
				allDay: true,
				summary: event.title,
				busystatus: config.busy
			});
		});

		return new Response(calendar.toString(), {
			status: 200,
			headers: {
				'content-type': 'text/calendar'
			}
		});
	} catch (error) {
		await sendErrorEmail(error as Error);
		return new Response('Internal Server Error', { status: 500 });
	}
};