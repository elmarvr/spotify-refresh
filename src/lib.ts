import { type Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { type KVNamespace } from '@cloudflare/workers-types';
import { Hono } from 'hono';

export type Env = {
	CREDENTIALS: KVNamespace;
	SPOTIFY_REDIRECT_URI: string;
};

export function createRouter() {
	return new Hono<{ Bindings: Env }>();
}

export function redirectError(c: Context, opts: { code: keyof typeof errors; status?: number }): never {
	throw new HTTPException(opts.status ?? 400, { res: c.redirect(`/?error=${opts.code}`) });
}

export const errors = {
	invalid_code: 'Something went wrong. Please try again.',
	invalid_state: 'Something went wrong. Please try again.',
	invalid_session: 'Invalid session. Please try again.',
	invalid_credentials: 'Invalid credentials. Please try again.',
	at_least_scope: 'You must select at least one scope.',
};

export const scopes = [
	'ugc-image-upload',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'app-remote-control',
	'streaming',
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-private',
	'playlist-modify-public',
	'user-follow-modify',
	'user-follow-read',
	'user-read-playback-position',
	'user-top-read',
	'user-read-recently-played',
	'user-library-modify',
	'user-library-read',
	'user-read-email',
	'user-read-private',
	'user-soa-link',
	'user-soa-unlink',
	'user-manage-entitlements',
	'user-manage-partner',
	'user-create-partner',
];

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'iconify-icon': Hono.HTMLAttributes & {
				icon: string;
				width?: string | number;
				height?: string | number;
				flip?: 'horizontal' | 'vertical' | 'horizontal,vertical';
				rotate?: `${number}deg`;
				inline?: boolean;
				mode?: 'svg' | 'style' | 'bg' | 'mask';
			};
		}
	}
}
