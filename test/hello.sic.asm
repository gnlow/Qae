. Program
. . Statement
. . . ExpressionStatement
. . . . Expression
. . . . . FunctionCall
. . . . . . Identifier
. . . . . . Expression
. . . . . . . String
. . Statement
. . . ExpressionStatement
. . . . Expression
. . . . . FunctionCall
. . . . . . Identifier
. . . . . . Expression
. . . . . . . String


prog	START	0
	LDA	#myst
	JSUB	stinit
	JSUB	stinitr

... main ...
	LDA	#vva
	JSUB	push
	JSUB	pushr
	JSUB	print
	LDA	#vvb
	JSUB	push
	JSUB	pushr
	JSUB	print
halt	J	halt

... table ...
vva	BYTE	C'Hello, World!;'
vvb	BYTE	C'Wow!;'

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

	END	prog
