import type { BaseAuthenticationCredentials } from "./provider";

export interface TheatrexConfig {
	providers: {
		use: string;
		auth: BaseAuthenticationCredentials & { [key: string]: string };
	}[];
}
