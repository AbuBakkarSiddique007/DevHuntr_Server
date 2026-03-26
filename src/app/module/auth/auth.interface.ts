import { type Role } from "@prisma/client";

export type RegisterInput = {
	name: string;
	email: string;
	password: string;
	photoUrl?: string;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type AuthTokenPayload = {
	userId: string;
	role: Role;
};

export type AuthResponse = {
	token: string;
	refreshToken: string;
	user: {
		id: string;
		name: string;
		email: string;
		photoUrl: string | null;
		role: Role;
		isSubscribed: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
};

