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
    assertEquals(
        await run(`
            print(fun() {
                "Hello, World!"
            } ())
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

Deno.test("number", async () => {
    assertEquals(
        await run(`
            printchar(75)
        `),
        "K",
    )
})

Deno.test("arithmetic", async () => {
    assertEquals(
        await run(`
            printchar(30+45)
        `),
        "K",
    )
    assertEquals(
        await run(`
            printchar('0'+3*2)
        `),
        "6",
    )
    assertEquals(
        await run(`
            printchar('0'+8/3)
        `),
        "2",
    )
    assertEquals(
        await run(`
            printchar('5'+3-2*2)
        `),
        "4",
    )
    assertEquals(
        await run(`
            printchar(1*6/3-2+4/3+'0')
        `),
        "1",
    )
})

Deno.test("at", async () => {
    assertEquals(
        await run(`
            hi = resw(10)
            hi[0] = 75
            hi[3] = 76
            hi[6] = 77
            printchar(hi[0])
            printchar(hi[3])
            printchar(hi[6])
        `),
        "KLM",
    )
})

Deno.test("lambda", async () => {
    assertEquals(
        await run(`
            f = fun() {"ABC"}
            f = fun() {"KLM"}
            print(f())
        `),
        "KLM",
    )
})

Deno.test("comp", async () => {
    assertEquals(
        await run(`
            printchar(65 + (2 > 3))
            printchar(65 + (2 < 3))
        `),
        "AB",
    )
})

Deno.test("logic", async () => {
    assertEquals(
        await run(`
            printchar(65 + (1 > 2 && 2 > 1))
            printchar(65 + (1 > 2 || 2 > 1))
        `),
        "AB",
    )
})

Deno.test("while", async () => {
    assertEquals(
        await run(`
            i = 0
            while (i < 4) {
                printchar(65+i)
                i = i + 1
            }
        `),
        "ABCD",
    )
})

Deno.test("if", async () => {
    assertEquals(
        await run(`
            a = 12
            if (a == 12) {
                print("yes")
            } else {
                print("no")
            }
            if (a == 13) {
                print("ooo")
            } else {
                print("xxx")
            }
        `),
        "yesxxx",
    )
})

Deno.test("read", async () => {
    assertEquals(
        await run(`
            printchar(readchar())
            printchar(readchar())
        `, "hi"),
        "hi",
    )
})

Deno.test("char", async () => {
    assertEquals(
        await run(`
            printchar('h')
            printchar('i')
        `),
        "hi",
    )
})
