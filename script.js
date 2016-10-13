const CELL_BORDER_COLOR='black';
const CELL_BORDER_WIDTH=1;
const PADDING=2;
const DIAMETRO_MINIMO_UNIDAD=8;
const HEIGHT=480;
const HEIGHT_MANO=480;
const HEIGHT_TABLERO=480;
const STYLESHEET=document.createElement('style');
const TAMAÑO_MINIMO_CELL=DIAMETRO_MINIMO_UNIDAD+(PADDING+CELL_BORDER_WIDTH)*2
const TIPOS_DE_UNIDADES=[
	{nombre:'vacio'},
	{nombre:'test', ataque:1, movimiento:1, vida:10, lealtad:10, image:'http://vignette2.wikia.nocookie.net/about-stick-war-game/images/a/a9/Stick_Swordwrath.jpg/revision/latest/scale-to-width-down/440?cb=20130402214823'}
];
const WIDTH=320;
const WIDTH_MANO=54;
const WIDTH_TABLERO=WIDTH-WIDTH_MANO;

const PROPIEDADES_CARTAS={
	BACKSIDE:'https://rfclipart.com/image/big/ce-7c-03/pattern-on-backside-of-playing-card-Download-Royalty-free-Vector-File-EPS-89501.jpg',
	HEIGHT:(WIDTH_MANO-PADDING*2)*1.5,
	WIDTH:WIDTH_MANO-PADDING*2
}
const MAX_WIDTH=Math.floor(WIDTH_TABLERO/(TAMAÑO_MINIMO_CELL));
const MAX_HEIGHT=Math.floor(HEIGHT_TABLERO/(TAMAÑO_MINIMO_CELL));

var ladoCelda;
var unidades;

function onload(){
	document.body.style.width=WIDTH+'px';
	document.body.style.height=HEIGHT+'px';
	document.head.appendChild(STYLESHEET);
	for(var i=1; i<=MAX_WIDTH; i+=2){
		var option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectColumnas').appendChild(option);
	}
	for(i=2; i<=MAX_HEIGHT; i++){
		option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectFilas').appendChild(option);
	}
	document.getElementById('botonJugar').addEventListener('click', function(){mostrar(document.getElementById('opcionesPreviasAlJuego'))});
	document.getElementById('botonComenzarPartida').addEventListener('click', comenzarPartida);
	STYLESHEET.innerHTML=
		'#mano{'+
		'	height:'+HEIGHT_MANO+'px;'+
		'	width:'+WIDTH_MANO+'px;'+
		'}'+
		'.mazo{'+
		'	background-image: url('+PROPIEDADES_CARTAS.BACKSIDE+');'+
		'	height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	left:'+PADDING+'px;'+
		'	line-height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	width:'+PROPIEDADES_CARTAS.WIDTH+'px;'+
		'}';
	for(var i=0; i<=1; i++){
		var mazo=document.createElement('div');
		mazo.className='mazo';
		mazo.style.top=HEIGHT_MANO/2+(i?-PROPIEDADES_CARTAS.HEIGHT-PADDING:PADDING)+'px';
		mazo.innerHTML='<span class="cantidadDeCartas">20</span>';
		document.getElementById('mano').appendChild(mazo);
	}
}

function mostrar(elementoDelBody){
	for(var i=document.body.children.length-1; i>=0; i--) document.body.children[i].style.display='none';
	elementoDelBody.style.display='';
}

function Unidad(tipo, bando){
	this.nombre=tipo.nombre;
	this.vidaMax=tipo.vida;
	this.vida=tipo.vida;
	this.lealtad=tipo.lealtad;
	this.ataque=tipo.ataque;
	this.movimiento=tipo.movimiento;
	this.image=tipo.image;
	this.bando=bando;
}

function redimensionarTablero(width, height){
	const TABLERO=document.getElementById('tablero');
	const CTX=TABLERO.getContext('2d');
	ladoCelda=Math.min(Math.floor(WIDTH_TABLERO/width), Math.floor(HEIGHT_TABLERO/height));
	TABLERO.width=ladoCelda*width;
	TABLERO.height=ladoCelda*height;
	unidades=[]
	for(var i=0; i<height; i++){
		unidades.push([])
		for(var j=0; j<width; j++){
			unidades[i].push(0);
			CTX.strokeStyle=CELL_BORDER_COLOR;
			CTX.strokeRect(j*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
		}
	}
	unidades[0][Math.floor(width/2)]=new Unidad(TIPOS_DE_UNIDADES[1], 'red');
	unidades[unidades.length-1][Math.floor(width/2)]=new Unidad(TIPOS_DE_UNIDADES[1], 'blue');
}

function comenzarPartida(){
	redimensionarTablero(document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
	mostrar(document.getElementById('juego'));
	for(var i=unidades.length-1; i>=0; i--){
		for(var j=unidades[i].length-1; j>=0; j--){
			var unidad=unidades[i][j];
			if(unidad.image){
				var div=document.createElement('div');
				div.className='unidad';
				div.style.left=j*ladoCelda+CELL_BORDER_WIDTH+'px';
				div.style.top=i*ladoCelda+CELL_BORDER_WIDTH-document.getElementById('tablero').height/2+'px';
				div.style.width=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
				div.style.height=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
				div.style.border=PADDING+'px solid '+unidad.bando;
				div.style.backgroundImage='url('+unidad.image+')';
				document.getElementById('container').appendChild(div);
			}
		}
	}
	mazos={
		blue:[mover, mover, mover, mover, mover, atacar, atacar, atacar, atacar, atacar, curar, curar, curar, curar, curar],
		red:[mover, mover, mover, mover, mover, atacar, atacar, atacar, atacar, atacar, curar, curar, curar, curar, curar]
	}
}

window.addEventListener('load', onload);