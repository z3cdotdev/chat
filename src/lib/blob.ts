import {
	list,
	PutBlobResult,
	put as putVercel
} from "@vercel/blob";

// (alias) putVercel(pathname: string, body: PutBody, optionsInput: PutCommandOptions): Promise<PutBlobResult>

export const put = async (folder: string, ...rest: Parameters<typeof putVercel>): Promise<PutBlobResult> => {
	const [filename, ...props] = rest;
	const blob = await putVercel(folder + "/" + filename, ...props);

	if (+process.env.MASK_VERCEL_BLOB_STORAGE_URL! === 1) {
		blob.url = blob.url.replace(process.env.VERCEL_BLOB_STORAGE_URL!, '/storage/public');
		blob.downloadUrl = blob.downloadUrl.replace(process.env.VERCEL_BLOB_STORAGE_URL!, '/storage/public');;
	}

	return blob;
}

export const get = async (folder: string, filename: string): Promise<string | false> => {
	const { blobs } = await list({ prefix: `${folder}/${filename}` });
	if (blobs.length === 0) return false;
	let url = blobs.at(0)?.url;
	if (!url) return false;
	if (+process.env.MASK_VERCEL_BLOB_STORAGE_URL! === 1) {
		url = url.replace(process.env.VERCEL_BLOB_STORAGE_URL!, '/storage/public');
	}

	return url;
};