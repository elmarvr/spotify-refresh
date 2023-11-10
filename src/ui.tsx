import { type FC } from 'hono/jsx';
import { useRequestContext } from 'hono/jsx-renderer';
import { twMerge } from 'tailwind-merge';
import { errors } from './lib';

export const Input: FC<Hono.InputHTMLAttributes> = (props) => {
	return <input {...props} class={twMerge('h-10 px-3 rounded-md bg-transparent border border-neutral-300', props.class)} />;
};

export const Field: FC<Hono.HTMLAttributes> = (props) => {
	return <div {...props} class={twMerge('flex flex-col gap-1', props.class)} />;
};

export const Button: FC<Hono.ButtonHTMLAttributes> = (props) => {
	return (
		<button
			{...props}
			class={twMerge(
				'h-10 px-3 rounded-md bg-neutral-900 text-neutral-50 hover:bg-neutral-800 active:bg-neutral-700 transition',
				props.class
			)}
		/>
	);
};

export const Label: FC<Hono.HTMLAttributes> = (props) => {
	return <label {...props} class={twMerge('text-sm text-neutral-700 font-medium', props.class)} />;
};

export const Checkbox: FC<Hono.InputHTMLAttributes> = (props) => {
	return (
		<input
			{...props}
			type="checkbox"
			data-content="✓"
			class={twMerge(
				'h-4 w-4 hover:cursor-pointer rounded checked:bg-neutral-900 after:text-xs flex items-center justify-center after:text-neutral-50 checked:after:content-[attr(data-content)] checked:border-neutral-900 appearance-none bg-transparent border border-neutral-300',
				props.class
			)}
		/>
	);
};

export const Link: FC<Hono.AnchorHTMLAttributes & { color?: 'spotify' | 'default' }> = ({ color = 'default', ...props }) => {
	return (
		<a
			{...props}
			class={twMerge(
				'font-bold hover:underline transition cursor-pointer',
				color === 'spotify' ? 'text-emerald-500 hover:text-emerald-600' : 'text-neutral-900 hover:text-neutral-800',
				props.class
			)}
		/>
	);
};

export const Title: FC<Hono.HTMLAttributes> = (props) => {
	return <h1 {...props} class={twMerge('text-2xl font-bold pb-2', props.class)} />;
};

export const Subtitle: FC<Hono.HTMLAttributes> = (props) => {
	return <h2 {...props} class={twMerge('text-neutral-700 pb-10 text-center max-w-2xl', props.class)} />;
};

export const Strong: FC<Hono.HTMLAttributes> = (props) => {
	return <strong {...props} class={twMerge('font-bold', props.class)} />;
};

export const ErrorMessage: FC = () => {
	const c = useRequestContext();
	const error = c.req.query('error');

	if (!error || !(error in errors)) return <></>;

	const message = errors[error as keyof typeof errors];

	return (
		<div class="fixed left-1/2 -translate-x-1/2 bottom-8">
			<div class="rounded-md border animate-slide-up flex items-center shadow-sm text-sm text-red-500 bg-neutral-50 border-neutral-300 py-2 px-4">
				<iconify-icon icon="lucide:alert-circle" class="mr-2" />
				{message}
			</div>
		</div>
	);
};
