// ==================== Account Types ====================

export interface AccountDto {
	id: number;
	username: string;
	email: string;
}

export interface AccountSummaryDto {
	id: number;
	username: string;
}

export interface AccountCreateDto {
	username: string;
	email: string;
	password: string;
}

export interface AccountUpdateDto {
	username?: string;
	email?: string;
}

// ==================== Auth Types ====================

export interface LoginDto {
	identifier: string;
	password: string;
}

// ==================== Artwork Types ====================

export interface ArtworkDto {
	id: number;
	title: string;
	description?: string;
	imageUrl?: string;
	price: number;
	views: number;
	createdAt: string;
	creator: AccountSummaryDto;
}

export interface ArtworkSummaryDto {
	id: number;
	title: string;
	imageUrl?: string;
	price: number;
	views: number;
	createdAt: string;
	creator: AccountSummaryDto;
}

export interface ArtworkCreateDto {
	title: string;
	description?: string;
	price: number;
	imageUrl?: string;
}

export interface ArtworkUpdateDto {
	title?: string;
	description?: string;
	price?: number;
	imageUrl?: string;
}

// ==================== Like Types ====================

export interface LikeCountDto {
	count: number;
}

// ==================== Purchase Types ====================

export interface PurchaseDto {
	id: number;
	purchasePrice: number;
	purchaseDate: string;
	artwork: ArtworkSummaryDto;
	buyer: AccountSummaryDto;
}

// ==================== Pagination ====================

export interface Page<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
	first: boolean;
	last: boolean;
}

// ==================== API Error ====================

export interface ApiError {
	code: string;
	message: string;
}
