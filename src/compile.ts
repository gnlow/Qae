import {
    SyntaxNodeRef,
    SyntaxNode,
} from "https://esm.sh/@lezer/common@1.2.3"
import { parser } from "./parser.js"
import { Stack } from "https://esm.sh/@lezer/lr@1.4.2/dist/index.d.ts";

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
`	+LDA	#qqmyst
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
    (label: string, op: string, param: string, comment = "") => {
        main.push(label+"\t"+op+"\t"+param+
            (comment ? ("\t. "+comment) : ""))
    }

    const pushRef =
    (ref: string | undefined) => {
        if (ref) {
            pushInst("", "LDA", ref)
            pushInst("", "JSUB", "qqpush")
        }
    }

    const popRef =
    (ref: string) => {
        pushInst("", "JSUB", "qqpop")
        pushInst("", "STA", ref)
    }

    const addSymbol =
    (str: string) => {
        table.push(`${getVarName(table.length)}\t${str}`)
    }

    const defSymbol =
    (id: string) => {
        if (!table.find(x => x.startsWith(`${id}\t`))) {
            table.push(`${id}\tRESW\t1`)
        }
    }

    const comment =
    (node: SyntaxNodeRef | SyntaxNode) => {
        main.push("\n\t. "+code.slice(node.from, node.to).trim().replaceAll("\n", "\n\t. "))
    }

    let anonFuncs = 0
    let labels = 0

    const walk =
    (node: SyntaxNodeRef | SyntaxNode): string | undefined => {
        return (({
            Assignment() {
                comment(node)
                const id = walk(node.node.getChild("Identifier")!)!
                const atNode = node.node.getChild("At")
                if (atNode) {
                    pushRef(id)
                    pushRef(walk(atNode))
                    pushInst("", "JSUB", "qqpushr")
                    pushInst("", "JSUB", "qadd")
                    popRef("qqtemp")
                }
                const value = walk(node.node.getChild("Expression")!)
                defSymbol(id)
                pushRef(value)
                if (atNode) {
                    popRef("@qqtemp")
                } else {
                    popRef(id)
                }
            },
            WhileStatement() {
                comment(node)
                const loopName = "loop"+getVarName(labels++)
                main.push(loopName)
                const cond = walk(node.node.getChild("Expression")!)
                pushRef(cond)
                pushInst("", "JSUB", "qqpop")
                pushInst("", "COMP", "#1")
                pushInst("", "JLT", loopName+"end")
                
                walk(node.node.getChild("Block")!)

                pushInst("", "J", loopName)
                pushInst(loopName+"end", "FLOAT", "")
            },
            IfStatement() {
                comment(node)
                const ifName = "block"+getVarName(labels++)

                const [ifBlock, elseBlock] = node.node.getChildren("Block")!
                main.push(ifName)
                const cond = walk(node.node.getChild("Expression")!)
                pushRef(cond)
                pushInst("", "JSUB", "qqpop")
                pushInst("", "COMP", "#1")
                pushInst("", "JLT", ifName+"else")

                walk(ifBlock!)

                if (elseBlock) {
                    pushInst("", "J", ifName+"end")
                    pushInst(ifName+"else", "FLOAT", "")
                    walk(elseBlock)
                    pushInst(ifName+"end", "FLOAT", "")
                } else {
                    pushInst(ifName+"else", "FLOAT", "")
                }
            },
            FunctionDef() {
                comment(node)
                const funcName = "fn"+getVarName(anonFuncs++)

                const funcNameNode = node.node.getChild("FuncName")
                if (funcNameNode) {
                    const alias = walk(funcNameNode)!
                    defSymbol(alias)
                    pushInst("", "LDA", "#"+funcName)
                    pushInst("", "STA", alias)
                }
                const params = node.node.getChildren("Identifier").map(walk)

                pushInst("", "J", funcName+"end")

                main.push(funcName!)

                params.forEach(param => {
                    popRef(param!)

                    defSymbol(param!)
                })
                walk(node.node.getChild("Block")!)

                pushInst("", "JSUB", "qqpopr")
                main.push(funcName+"end")

                return "#"+funcName
            },
            FunctionCall() {
                comment(node)
                const [funcNode, ...children] = node.node.getChildren("Expression")
                const funcName = walk(funcNode!)
                children.map(param => {
                    pushRef(walk(param))
                })

                if (funcName == "resw" || funcName == "resb") {
                    const child = children[0]!
                    const size = Number(code.slice(child.from, child.to))
                    const varName = getVarName(table.length)
                    addSymbol(`${funcName.toUpperCase()}\t${size}`)

                    return "#"+varName
                }
                pushInst("", "JSUB", "qqpushr")
                if ([
                    "print",
                    "printchar",
                    "readchar",
                ].includes(funcName!)) {
                    pushInst("", "JSUB", funcName!)
                } else {
                    pushInst("", "JSUB", ("@"+funcName!).replace("@#", ""))
                }
            },
            BinaryExpression() {
                const opNode = node.node.getChild("Op")!
                const op = code.slice(opNode.from, opNode.to)
                const funcName = {
                    "+": "qadd",
                    "-": "qsub",
                    "*": "qmul",
                    "/": "qdiv",
                    "==": "qeq",
                    "!=": "qneq",
                    "<": "qlt",
                    "<=": "qlte",
                    ">": "qgt",
                    ">=": "qgte",
                    "&&": "qand",
                    "||": "qor",
                }[op]!

                node.node.getChildren("Expression").map(param => {
                    pushRef(walk(param))
                })
                pushInst("", "JSUB", "qqpushr")
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
                    pushInst("", "JSUB", "qqpushr")
                    pushInst("", "JSUB", "qadd")
                    popRef("qqtemp")
                    return "@qqtemp"
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
            Char() {
                const content = code.slice(node.from+1, node.to-1)[0]

                return "#"+content.charCodeAt(0)
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
