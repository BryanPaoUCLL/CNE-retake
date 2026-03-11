import { ArtworkCreateDto, ArtworkImageReorderRequestDto, ArtworkUpdateDto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const list = (page: number = 0, size: number = 20, sort?: string) => {
	const params = new URLSearchParams({ page: String(page), size: String(size) });
	if (sort) params.append("sort", sort);

	return fetch(`${API_URL}/artworks?${params}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const getById = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const search = (query: string) => {
	return fetch(`${API_URL}/artworks/search?query=${encodeURIComponent(query)}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const trending = () => {
	return fetch(`${API_URL}/artworks/trending`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const create = (data: ArtworkCreateDto) => {
	return fetch(`${API_URL}/artworks`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
};

const update = (id: number, data: ArtworkUpdateDto) => {
	return fetch(`${API_URL}/artworks/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
};

const remove = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
};

const listImages = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}/images`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const uploadImages = (id: number, files: File[]) => {
	const formData = new FormData();
	files.forEach((file) => formData.append("files", file));

	return fetch(`${API_URL}/artworks/${id}/images`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});
};

const setMainImage = (id: number, imageId: number) => {
	return fetch(`${API_URL}/artworks/${id}/images/${imageId}/main`, {
		method: "PUT",
		credentials: "include",
	});
};

const reorderImages = (id: number, data: ArtworkImageReorderRequestDto) => {
	return fetch(`${API_URL}/artworks/${id}/images/order`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
};

const deleteImage = (id: number, imageId: number) => {
	return fetch(`${API_URL}/artworks/${id}/images/${imageId}`, {
		method: "DELETE",
		credentials: "include",
	});
};

const like = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}/like`, {
		method: "POST",
		credentials: "include",
	});
};

const unlike = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}/like`, {
		method: "DELETE",
		credentials: "include",
	});
};

const getLikeCount = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}/likes`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const searchByTag = (tag: string) => {
	return fetch(`${API_URL}/artworks/search/tag?tag=${encodeURIComponent(tag)}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const tagSuggestions = (query: string = "") => {
	const params = new URLSearchParams();
	if (query.trim()) params.append("query", query.trim());
	return fetch(`${API_URL}/tags/suggestions?${params.toString()}`, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
	});
};

const ArtworkService = {
	list,
	getById,
	search,
	searchByTag,
	tagSuggestions,
	trending,
	create,
	update,
	remove,
	listImages,
	uploadImages,
	setMainImage,
	reorderImages,
	deleteImage,
	like,
	unlike,
	getLikeCount,
};

export default ArtworkService;
