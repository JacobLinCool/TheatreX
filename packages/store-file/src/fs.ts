import { z, File, serializer, mount } from "controlled-fs";

const structure = z.object({
	data: z.record(z.string(), File(z.instanceof(Buffer), ...serializer.buffer)),
	spaces: z.record(z.string(), z.any()),
});

export const store = (dir: string) => mount(dir, structure);
