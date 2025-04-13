import { assertEquals } from "https://esm.sh/jsr/@std/assert@1.0.12"
import { run } from "./util/run.ts"

Deno.test("print", async () => {
    assertEquals(
        await run(`
            print("Hello, World!")
        `),
        "Hello, World!",
    )
})
