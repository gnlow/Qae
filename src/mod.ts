import {
    SyntaxNodeRef,
    SyntaxNode,
} from "https://esm.sh/@lezer/common@1.2.3"
import { parser } from "./parser.js"

const code = `
print("Hello, World!")
print("Wow!")
`

const tree = parser.parse(code)

let depth = 0
tree.iterate({
    enter(node) {
        console.log(". ".repeat(depth+++1) + node.name)
    },
    leave(node) {
        depth--
    }
})

console.log("\n")

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

const terminal =
(node: SyntaxNodeRef | SyntaxNode) => {
    return ({
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
            return terminal(node.node.firstChild!)
        }
    } as Record<string, () => string>)[node.name]?.()
}

tree.iterate({
    enter(node) {
        ({
            FunctionCall() {
                const funcName = terminal(node.node.getChild("Identifier")!)
                const params = node.node.getChildren("Expression").map(terminal)

                params.forEach(param => {
                    pushInst("", "LDA", param)
                    pushInst("", "JSUB", "push")
                })
                pushInst("", "JSUB", "pushr")
                pushInst("", "JSUB", funcName)
            }
        } as Record<string, () => void>)[node.name]?.()
    },
})

const init =
`	LDA	#myst
	JSUB	stinit
	JSUB	stinitr`

const std =
`
... stdio ...
print	JSUB	pop
	STA	prp
ploop	TD	#1
	JEQ	ploop
	LDCH	@prp
	COMP	#0x3B
	JEQ	popr
	WD	#1
	LDA	prp
	ADD	#1
	STA	prp
	J	ploop

prp	RESW	1

... stdlib ...
myst	RESW	100
...
stinit	STA	sp
	RSUB

push	STA	@sp
	LDA	sp
	ADD	#3
	STA	sp
	RSUB

pop	LDA	sp
	SUB	#3
	STA	sp
	LDA	@sp
	RSUB

sp	RESW	1

...
stinitr	LDA	#retadr
	STA	spr
	RSUB

pushr	STL	@spr
	LDA	@spr
	ADD	#3
	STA	@spr

	LDA	spr
	ADD	#3
	STA	spr
	RSUB

popr	LDA	spr
	SUB	#3
	STA	spr
	LDL	@spr
	RSUB

spr	RESW	1
retadr	RESW	100
`

console.log([
    "prog\tSTART\t0",
    init,
    "\n... main ...",
    ...stack,
    "halt\tJ\thalt",
    "\n... table ...",
    ...table,
    std,
    "\tEND\tprog",
].join("\n"))
