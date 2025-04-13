... stdio ...
print	JSUB	qqpop
	STA	qqprp
ploop	TD	#1
	JEQ	ploop
	LDCH	@qqprp
	COMP	#0x3B
	JEQ	qqpopr
	WD	#1
	LDA	qqprp
	ADD	#1
	STA	qqprp
	J	ploop

qqprp	RESW	1

printchar
	JSUB	qqpop
pcloop	TD	#1
	JEQ	pcloop
	WD	#1
	J	qqpopr

readchar
	TD	#0
	JEQ	readchar
	RD	#0
	JSUB	qqpush
	J	qqpopr

... stdlib ...
qqtemp	RESW	1

...
stinit	STA	qqsp
	RSUB

qqpush	STA	@qqsp
	LDA	qqsp
	ADD	#3
	STA	qqsp
	RSUB

qqpop	LDA	qqsp
	SUB	#3
	STA	qqsp
	LDA	@qqsp
	RSUB

qqsp	RESW	1

...
qadd	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	ADD	qqqb
	JSUB	qqpush
	J	qqpopr

qsub	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	SUB	qqqb
	JSUB	qqpush
	J	qqpopr

qmul	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	MUL	qqqb
	JSUB	qqpush
	J	qqpopr

qo	LDA	#1
	JSUB	qqpush
	J	qqpopr

qx	LDA	#0
	JSUB	qqpush
	J	qqpopr

qeq	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JEQ	qo
	J	qx

qneq	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JEQ	qx
	J	qo

qlt	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JLT	qo
	J	qx

qlte	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JLT	qo
	JEQ	qo
	J	qx

qgt	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JGT	qo
	J	qx

qgte	JSUB	qqpop
	STA	qqqb
	JSUB	qqpop
	COMP	qqqb
	JGT	qo
	JEQ	qo
	J	qx

qqqb	RESW	1

...
stinitr	LDA	#retadr
	STA	qqspr
	RSUB

qqpushr	STL	@qqspr
	LDA	@qqspr
	ADD	#3
	STA	@qqspr

	LDA	qqspr
	ADD	#3
	STA	qqspr
	RSUB

qqpopr	LDA	qqspr
	SUB	#3
	STA	qqspr
	LDL	@qqspr
	RSUB

qqspr	RESW	1
retadr	RESW	20
qqmyst	RESW	20
