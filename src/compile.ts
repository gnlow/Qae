import {
    SyntaxNodeRef,
    SyntaxNode,
} from "https://esm.sh/@lezer/common@1.2.3"
import { parser } from "./parser.js"

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
    
    const main: string[] = []
    const funcs: string[] = []
    const table: string[] = []

    const pushInst =
    (label: string, op: string, param: string) => {
        main.push(label+"\t"+op+"\t"+param)
    }

    const pushRef =
    (ref: string | undefined) => {
        if (ref) {
            pushInst("", "LDA", ref)
            pushInst("", "JSUB", "push")
        }
    }

    const popRef =
    (ref: string) => {
        pushInst("", "JSUB", "pop")
        pushInst("", "STA", ref)
    }

    const addSymbol =
    (str: string) => {
        table.push(`${getVarName(table.length)}\t${str}`)
    }

    let anonFuncs = 0

    const walk =
    (node: SyntaxNodeRef | SyntaxNode): string | undefined => {
        return (({
            Assignment() {
                const id = walk(node.node.getChild("Identifier")!)!
                const atNode = node.node.getChild("At")
                if (atNode) {
                    pushRef(id)
                    pushRef(walk(atNode))
                    pushInst("", "JSUB", "pushr")
                    pushInst("", "JSUB", "qadd")
                    popRef("qtemp")
                }
                const value = walk(node.node.getChild("Expression")!)
                if (!table.find(x => x.startsWith(`${id}\t`))) {
                    table.push(`${id}\tRESW\t1`)
                }
                pushRef(value)
                if (atNode) {
                    popRef("@qtemp")
                } else {
                    popRef(id)
                }
            },
            FunctionDef() {
                const funcNameNode = node.node.getChild("FuncName")
                const funcName = funcNameNode
                    ? walk(funcNameNode)
                    : "fn"+getVarName(anonFuncs++)
                const params = node.node.getChildren("Identifier").map(walk)

                pushInst("", "J", funcName+"end")

                main.push(funcName!)

                params.forEach(param => {
                    popRef(param!)

                    table.push(`${param!}\tRESW\t1`)
                })
                walk(node.node.getChild("Block")!)

                pushInst("", "JSUB", "popr")
                main.push(funcName+"end")

                return "#"+funcName
            },
            FunctionCall() {
                const [funcNode, ...children] = node.node.getChildren("Expression")
                const funcName = walk(funcNode!)
                const params = children.map(walk)

                if (funcName == "resw" || funcName == "resb") {
                    const child = children[0]!
                    const size = Number(code.slice(child.from, child.to))
                    const varName = getVarName(table.length)
                    addSymbol(`${funcName.toUpperCase()}\t${size}`)

                    return "#"+varName
                }

                params.forEach(pushRef)
                pushInst("", "JSUB", "pushr")
                pushInst("", "JSUB", funcName!)
            },
            BinaryExpression() {
                const opNode = node.node.getChild("Op")!
                const op = code.slice(opNode.from, opNode.to)
                const funcName = {
                    "+": "qadd",
                    "-": "qsub",
                    "*": "qmul",
                    "==": "qeq",
                }[op]!

                const params = node.node.getChildren("Expression").map(walk)

                params.forEach(pushRef)
                pushInst("", "JSUB", "pushr")
                pushInst("", "JSUB", funcName)
            },
            ExpressionStatement() {
                pushRef(walk(node.node.firstChild!))
            },
            IdentifierExpression() {
                const id = code.slice(node.from, node.to)
                const atNode = node.node.getChild("At")
                if (atNode) {
                    pushRef(id)
                    pushRef(walk(atNode))
                    pushInst("", "JSUB", "pushr")
                    pushInst("", "JSUB", "qadd")
                    popRef("qtemp")
                    return "@qtemp"
                }
                return id
            },
            Identifier() {
                const id = code.slice(node.from, node.to)
                return id
            },
            Number() {
                const content = code.slice(node.from, node.to)
                return "#"+content
            },
            String() {
                const content = code.slice(node.from+1, node.to-1)
                const varName = getVarName(table.length)
                if (node.node.parent?.name == "Expression") {
                    addSymbol(`BYTE\tC'${content};'`)
                }
                return "#"+varName
            },
            Block() {
                node.node.getChildren("Statement").forEach(walk)
            },
            Program() {
                node.node.getChildren("Statement").forEach(walk)
            }
        } as Record<string, () => string | undefined>)[node.name]
        || (() => {
            return walk(node.node.firstChild!)
        }))()
    }

    walk(tree.topNode)

    return [
        "prog\tSTART\t0",
        init,
        "\n... main ...",
        ...main,
        "halt\tJ\thalt",
        "\n... table ...",
        ...table,
        std,
        "\tEND\tprog",
    ].join("\n")
}
