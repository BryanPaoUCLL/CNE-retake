import { ArtworkCreateDto, ArtworkUpdateDto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const list = (page: number = 0, size: number = 20, sort?: string) => {
	const params = new URLSearchParams({ page: String(page), size: String(size) });
	if (sort) params.append("sort", sort);

	return fetch(`${API_URL}/artworks?${params}`, {
		method: "GET",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
	});
};

const getById = (id: number) => {
	return fetch(`${API_URL}/artworks/${id}`, {
		method: "GET",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
	});
};

const search = (query: string) => {
	return fetch(`${API_URL}/artworks/search?query=${encodeURIComponent(query)}`, {
		method: "GET",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
	});
};

const trending = () => {
	return fetch(`${API_URL}/artworks/trending`, {
		method: "GET",
		credentials: "include",
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
		headers: { "Content-Type": "application/json" },
	});
};

const ArtworkService = {
	list,
	getById,
	search,
	trending,
	create,
	update,
	remove,
	like,
	unlike,
	getLikeCount,
};

export default ArtworkService;
