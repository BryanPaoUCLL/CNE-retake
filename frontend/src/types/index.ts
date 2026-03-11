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
	thumbnailUrl?: string;
	price: number;
	views: number;
	createdAt: string;
	creator: AccountSummaryDto;
	images: ArtworkImageDto[];
	tags?: string[];
}

export interface ArtworkSummaryDto {
	id: number;
	title: string;
	imageUrl?: string;
	thumbnailUrl?: string;
	price: number;
	views: number;
	createdAt: string;
	creator: AccountSummaryDto;
	tags?: string[];
}

export interface ArtworkImageDto {
	id: number;
	artworkId: number;
	blobName: string;
	originalFileName: string;
	mimeType: string;
	fileSizeBytes: number;
	width: number;
	height: number;
	thumbnailBlobName: string;
	sortOrder: number;
	isMainImage: boolean;
	createdAt: string;
	url: string;
	thumbnailUrl: string;
}

export interface ArtworkCreateDto {
	title: string;
	description?: string;
	price: number;
	tags?: string[];
}

export interface ArtworkUpdateDto {
	title?: string;
	description?: string;
	price?: number;
	tags?: string[];
}

export interface ArtworkImageReorderRequestDto {
	orderedImageIds: number[];
}

export interface TagSuggestionDto {
	id: number;
	name: string;
	description?: string;
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
