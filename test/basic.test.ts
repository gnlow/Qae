import { assertEquals } from "https://esm.sh/jsr/@std/assert@1.0.12"
import { run } from "./util/run.ts"

Deno.test("echo", async () => {
    assertEquals(
        await run(`
            c = readchar()

            while (c != 10) {
                printchar(c)
                c = readchar()
            }
        `, "Hello, World!\n"),
        "Hello, World!",
    )
})

Deno.test("prec", async () => {
    assertEquals(
        await run(`
            fun prec(op) {
                if (op == '+') { 1 }
                if (op == '-') { 1 }
                if (op == '*') { 2 }
            }
            printchar(65+prec('-'))
        `),
        "B",
    )
})
