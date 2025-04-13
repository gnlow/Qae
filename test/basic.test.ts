import { assertEquals } from "https://esm.sh/jsr/@std/assert@1.0.12"
import { run } from "./util/run.ts"

Deno.test("echo", async () => {
    assertEquals(
        await run(`
            c = readchar()

            while (c != ';') {
                printchar(c)
                c = readchar()
            }
        `, "Hello, World!;"),
        "Hello, World!",
    )
})
