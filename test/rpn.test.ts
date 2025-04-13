import { assertEquals } from "https://esm.sh/jsr/@std/assert@1.0.12"
import { run } from "./util/run.ts"

const f =
async (a: string, b: string, c: number) => {
    assertEquals(
        await run(
            await Deno.readTextFile("example/rpn.qae"),
            a+"\n",
        ),
        b+"\n"+c,
    )
}

Deno.test("calc", async () => {
    await f("2+3*5", "235*+", 17)
    await f("6+2*3-1", "623*+1-", 11)
    await f("8*3-5+6", "83*5-6+", 25)
})
