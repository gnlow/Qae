import {
    SyntaxNodeRef,
    SyntaxNode,
} from "https://esm.sh/@lezer/common@1.2.3"
import { parser } from "./parser.js"
import { ExpressionStatement, Statement } from "./parser.terms.js";

const getVarName =
(n: number) => {
    if (n == 0) return "vva"
    let res = ""
    while (n > 0) {
        res = String.fromCharCode(97 + (n % 26)) + res
        n = Math.floor(n / 26)
    }
    return "vv"+res
}

const init =
`	LDA	#myst
    JSUB	stinit
    JSUB	stinitr`

const std = await Deno.readTextFile("./src/std.sic.asm")

export const compile =
(code: string) => {
    const tree = parser.parse(code)
    
    const stack: string[] = []
    const table: string[] = []

    const pushInst =
    (label: string, op: string, param: string) => {
        stack.push(label+"\t"+op+"\t"+param)
    }

    const addSymbol =
    (str: string) => {
        table.push(`${getVarName(table.length)}\t${str}`)
    }

    const walk =
    (node: SyntaxNodeRef | SyntaxNode): string | undefined => {
        return ({
            FunctionCall() {
                const funcName = walk(node.node.getChild("Identifier")!)!
                const params = node.node.getChildren("Expression").map(walk)

                params.forEach(param => {
                    if (param) {
                        pushInst("", "LDA", param)
                        pushInst("", "JSUB", "push")
                    }
                })
                pushInst("", "JSUB", "pushr")
                pushInst("", "JSUB", funcName)

                return ""
            },
            Identifier() {
                const content = code.slice(node.from, node.to)
                if (node.node.parent?.name == "Expression") {
                    stack.push(content)
                }
                return content
            },
            String() {
                const content = code.slice(node.from+1, node.to-1)
                const varName = getVarName(table.length)
                if (node.node.parent?.name == "Expression") {
                    addSymbol(`BYTE\tC'${content};'`)
                }
                return "#"+varName
            },
            Expression() {
                return walk(node.node.firstChild!)
            }
        } as Record<string, () => string | undefined>)[node.name]?.()
        || walk(node.node.firstChild!)
    }

    walk(tree.topNode)

    return [
        "prog\tSTART\t0",
        init,
        "\n... main ...",
        ...stack,
        "halt\tJ\thalt",
        "\n... table ...",
        ...table,
        std,
        "\tEND\tprog",
    ].join("\n")
}
