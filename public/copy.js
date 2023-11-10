window.onload = () => {
	const copyBtn = document.querySelector('[data-copy]');
	const copyText = document.querySelector('[data-copy-text]');

	copyBtn.addEventListener('click', async () => {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(copyText.value);

			return;
		}

		copyText.focus();
		copyText.select();
		document.execCommand('copy');
	});
};
