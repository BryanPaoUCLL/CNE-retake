import { LoginDto, AccountDto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const login = (credentials: LoginDto, remember: boolean = false) => {
	return fetch(`${API_URL}/auth/login?remember=${remember}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(credentials),
	});
};

const logout = (hard: boolean = false) => {
	return fetch(`${API_URL}/auth/logout?hard=${hard}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
};

const status = async () => {
	return fetch(`${API_URL}/auth/status`, {
		method: "GET",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
	});
};

const AuthService = {
	login,
	logout,
	status,
};

export default AuthService;
