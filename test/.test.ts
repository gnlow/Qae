import { assertEquals } from "https://esm.sh/jsr/@std/assert@1.0.12"
import { run } from "./util/run.ts"

Deno.test("print", async () => {
    assertEquals(
        await run(`
            print("Hello, World!")
        `),
        "Hello, World!",
    )
    assertEquals(
        await run(`
            print("Hello, World!")
            print("Wow!")
        `),
        "Hello, World!Wow!",
    )
})

Deno.test("func call", async () => {
    assertEquals(
        await run(`
            fun hi() {
                "Hello, World!"
            }
            print(hi())
        `),
        "Hello, World!",
    )
    assertEquals(
        await run(`
            fun hi() {
                "Hello, World!"
                "Hello, World!"
            }
            fun myprint(str) {
                print(str)
            }
            myprint(hi())
        `),
        "Hello, World!",
    )
})

Deno.test("assign variable", async () => {
    assertEquals(
        await run(`
            hi = "Hello, World!"
            print(hi)
        `),
        "Hello, World!",
    )
})
