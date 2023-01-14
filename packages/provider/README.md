# TheatreX Provider

Provider exposes an API to connect TheatreX to other services.

You can start to build your own provider by using the `Provider` class.

```ts
import { Provider } from "@theatrex/provider";

type YourAuthCreds = {
    username: string;
    password: string;
};

export class MyProvider extends Provider<YourAuthCreds> {
    constructor(config?: { dev?: boolean; store?: Store }) {
        super({ name: "theatrex:my-provider", ...config });

        super.info(async () => {
            return {
                name: "My Provider",
                auth: {
                    username: "Service Username",
                    password: "Service Password",
                },
                tabs: [{ name: "MyTab", lists: ["recommended", "specials"] }],
            };
        });

        super.search(async ({ query }) => {
            // ... how to perform search in your service
        });

        super.item(async ({ id }) => {
            // ... how to get item info in your service
        });

        super.resource(async ({ id }) => {
            // ... how to get resource in your service
        });

        super.list(async ({ id }) => {
            if (id === "recommended") {
                // ... how to get recommended list in your service
            }

            if (id === "specials") {
                // ... how to get specials list in your service
            }

            return [];
        });
    }
}

export default MyProvider;
```
