import { compile } from "../../src/compile.ts"

export const run =
async (code: string) => {
    const command = new Deno.Command("bash", {
        args: [ "eval.sh" ],
        stdin: "piped",
        stdout: "piped",
        stderr: "piped",
    })

    const child = command.spawn()
    const writer = child.stdin.getWriter()
    await writer.write(new TextEncoder().encode(compile(code)))
    writer.close()

    const { stdout, stderr } = await child.output()
    if (stderr.length > 0) {
        console.log(new TextDecoder().decode(stderr))
    }
    return new TextDecoder().decode(stdout)
}
