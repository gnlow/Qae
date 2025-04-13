import { compile } from "../../src/compile.ts"

export const debug =
async (code: string, input = "") => {
    const command = new Deno.Command("bash", {
        args: [ "debug.sh", input ],
        stdin: "piped",
    })

    const child = command.spawn()
    const writer = child.stdin.getWriter()
    await writer.write(new TextEncoder().encode(compile(code)))
    writer.close()
}
