/**
 * Compresse / redimensionne une image côté client via un canvas, pour rester
 * sous le quota Storage. Les non-images sont renvoyées telles quelles.
 * Sortie : un Blob JPEG (ou le fichier d'origine si non-image / échec).
 */
export async function compressImage(
	file: File,
	maxDim = 1600,
	quality = 0.8
): Promise<Blob> {
	if (!file.type.startsWith('image/')) return file;

	try {
		const dataUrl = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = reject;
			image.src = dataUrl;
		});

		let { width, height } = img;
		if (width > maxDim || height > maxDim) {
			const scale = Math.min(maxDim / width, maxDim / height);
			width = Math.round(width * scale);
			height = Math.round(height * scale);
		}

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return file;
		ctx.drawImage(img, 0, 0, width, height);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', quality)
		);
		return blob ?? file;
	} catch {
		// En cas d'échec de compression, on uploade l'original.
		return file;
	}
}
