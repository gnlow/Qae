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

printchar
	JSUB	pop
pcloop	TD	#1
	JEQ	pcloop
	WD	#1
	J	popr

... stdlib ...
qtemp	RESW	1

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
qadd	JSUB	pop
	STA	qqqb
	JSUB	pop
	ADD	qqqb
	JSUB	push
	J	popr

qsub	JSUB	pop
	STA	qqqb
	JSUB	pop
	SUB	qqqb
	JSUB	push
	J	popr

qmul	JSUB	pop
	STA	qqqb
	JSUB	pop
	MUL	qqqb
	JSUB	push
	J	popr

qo	LDA	#1
	JSUB	push
	J	popr

qx	LDA	#0
	JSUB	push
	J	popr

qeq	JSUB	pop
	STA	qqqb
	JSUB	pop
	COMP	qqqb
	JEQ	qo
	J	qx

qlt	JSUB	pop
	STA	qqqb
	JSUB	pop
	COMP	qqqb
	JLT	qo
	J	qx

qlte	JSUB	pop
	STA	qqqb
	JSUB	pop
	COMP	qqqb
	JLT	qo
	JEQ	qo
	J	qx

qgt	JSUB	pop
	STA	qqqb
	JSUB	pop
	COMP	qqqb
	JGT	qo
	J	qx

qgte	JSUB	pop
	STA	qqqb
	JSUB	pop
	COMP	qqqb
	JGT	qo
	JEQ	qo
	J	qx

qqqb	RESW	1

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
retadr	RESW	20
myst	RESW	20
