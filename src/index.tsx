import { jsxRenderer } from 'hono/jsx-renderer';
import { serveStatic } from 'hono/cloudflare-workers';
import { getCookie, setCookie } from 'hono/cookie';
import { type Context } from 'hono';

import { Button, Checkbox, ErrorMessage, Field, Input, Label, Link, Strong, Subtitle, Title } from './ui';
import { createRouter, redirectError, scopes } from './lib';

const app = createRouter();

app.use('/public/*', serveStatic({ root: './' }));

app.use(
	'/*',
	jsxRenderer(
		({ children }) => (
			<html>
				<head>
					<link rel="stylesheet" href="/public/tailwind.css" />
					<script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js" />
					<script src="/public/copy.js" />
				</head>
				<body class="h-screen w-full bg-neutral-50 text-neutral-900">
					<main class="w-full h-full flex items-center justify-center">{children}</main>
				</body>
			</html>
		),
		{
			docType: true,
		}
	)
);

app.get('/', async (c) => {
	return c.render(
		<>
			<div class="flex flex-col items-center">
				<Title>Spotify Refresh Token Generator</Title>
				<Subtitle>
					Open the{' '}
					<Link color="spotify" target="_blank" href="https://developer.spotify.com/dashboard">
						Spotify dashboard
					</Link>{' '}
					and create a new app. Copy your <Strong>Client ID</Strong>, <Strong>Client Secret</Strong> and set the Redirect URI to{' '}
					<Strong>{c.env.SPOTIFY_REDIRECT_URI}</Strong>.
				</Subtitle>

				<form action="/api/spotify/sign-in" method="POST" class="flex flex-col w-full gap-6">
					<Field>
						<Label>Client ID</Label>
						<Input name="clientId" type="text" />
					</Field>

					<Field>
						<Label>Client Secret</Label>
						<Input name="clientSecret" type="password" />
					</Field>

					<div>
						<Label class="block mb-2">Scopes</Label>
						<div class="grid grid-cols-3 justify-between gap-y-2 gap-x-6">
							{scopes.map((scope) => (
								<Label class="flex items-center  font-normal leading-none">
									<Checkbox name="scope" value={scope} class="mr-3" />
									{scope}
								</Label>
							))}
						</div>
					</div>

					<div class="mt-4 flex justify-center">
						<Button class="min-w-[320px]" type="submit">
							Generate refresh token
						</Button>
					</div>
				</form>
			</div>
			<ErrorMessage />
		</>
	);
});

app.get('/refresh', async (c) => {
	const refreshToken = getCookie(c, 'refresh-token');

	if (!refreshToken) {
		return c.redirect('/');
	}

	return c.render(
		<div class="flex flex-col items-center">
			<Title>Refresh token generated successfully</Title>
			<Subtitle>
				Store this token in a secure place and use it generate new access tokens. You can revoke this token at any time in the{' '}
				<Link color="spotify" target="_blank" href="https://developer.spotify.com/dashboard">
					Spotify dashboard
				</Link>
			</Subtitle>

			<Input class="w-full max-w-3xl" data-copy-text disabled value={refreshToken} />

			<div class="mt-10 flex flex-col items-center gap-4">
				<Button data-copy class="min-w-[320px]" type="submit">
					Copy refresh token
				</Button>

				<Link href="/">Go back</Link>
			</div>
		</div>
	);
});

app.post('/api/spotify/sign-in', async (c) => {
	const formData = await c.req.formData();

	const sessionId = crypto.randomUUID();

	setCookie(c, 'session-id', sessionId);
	console.log(formData.getAll('scope'));

	const { clientId, clientSecret, scope } = await parse(c, formData);

	const expiresIn = 1000 * 60 * 30;

	await c.env.CREDENTIALS.put(`${sessionId}:clientId`, clientId, {
		expirationTtl: expiresIn,
	});

	await c.env.CREDENTIALS.put(`${sessionId}:clientSecret`, clientSecret, {
		expirationTtl: expiresIn,
	});

	const state = crypto.randomUUID();
	await c.env.CREDENTIALS.put(`${sessionId}:state`, state);

	const params = new URLSearchParams({
		client_id: clientId,
		response_type: 'code',
		redirect_uri: c.env.SPOTIFY_REDIRECT_URI,
		state,
		scope: scope.join(' '),
		show_dialog: 'true',
	});

	return c.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/api/spotify/callback', async (c) => {
	const { code, state } = c.req.query();
	const sessionId = getCookie(c, 'session-id');

	if (!code) {
		redirectError(c, { code: 'invalid_code' });
	}

	if (!sessionId) {
		redirectError(c, { code: 'invalid_session' });
	}

	const compare = await c.env.CREDENTIALS.get(`${sessionId}:state`, 'text');

	if (state !== compare) {
		redirectError(c, { code: 'invalid_state' });
	}

	const clientId = await c.env.CREDENTIALS.get(`${sessionId}:clientId`);
	const clientSecret = await c.env.CREDENTIALS.get(`${sessionId}:clientSecret`);

	const params = new URLSearchParams({
		code,
		redirect_uri: c.env.SPOTIFY_REDIRECT_URI,
		grant_type: 'authorization_code',
	});

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});

	const json = await response.json<{
		refresh_token: string;
	}>();

	setCookie(c, 'refresh-token', json.refresh_token, {
		path: '/',
		expires: new Date(Date.now() + 1000 * 60 * 30),
	});

	return c.redirect(`/refresh`);
});

async function parse(c: Context, form: FormData) {
	const clientId = form.get('clientId');
	const clientSecret = form.get('clientSecret');
	const scope = form.getAll('scope');

	if (!clientId || !clientSecret) {
		redirectError(c, { code: 'invalid_credentials' });
	}

	if (!scope.length) {
		redirectError(c, { code: 'at_least_scope' });
	}

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'client_credentials',
		}),
	});

	const { error } = await response.json<{ error: string }>();

	if (error) {
		redirectError(c, { code: 'invalid_credentials' });
	}

	return { clientId, clientSecret, scope };
}

export default app;
