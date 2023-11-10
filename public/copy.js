window.onload = () => {
	const copyBtn = document.querySelector('[data-copy]');
	const copyText = document.querySelector('[data-copy-text]');

	copyBtn.addEventListener('click', () => {
		copyToClipboard(copyText.value);
	});
};

async function copyToClipboard(textToCopy) {
	if (navigator.clipboard && window.isSecureContext) {
		await navigator.clipboard.writeText(textToCopy);
	} else {
		const textarea = document.createElement('textarea');
		textarea.value = textToCopy;

		textarea.style.position = 'fixed';
		textarea.style.left = '-99999999px';

		document.body.prepend(textarea);

		textarea.select();

		try {
			document.execCommand('copy');
		} catch (err) {
			console.log(err);
		} finally {
			textarea.remove();
		}
	}
}
