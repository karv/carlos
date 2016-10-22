const BANDO_JUGADOR='blue';
const BANDO_OPONENTE='red';
const CARTAS_POR_COLUMNA=13;
const CELL_BORDER_COLOR='black';
const CELL_BORDER_WIDTH=1;
const DIAMETRO_MINIMO_UNIDAD=18;
const HEIGHT=480;
const HEIGHT_MANO=480;
const HEIGHT_TABLERO=480;
const PADDING=2;
const STYLESHEET=document.createElement('style');
const STYLESHEET_UNIDADES_DISPONIBLES=document.createElement('style');
const TAMAÑO_MANO=5;
const TAMAÑO_MINIMO_CELL=DIAMETRO_MINIMO_UNIDAD+(PADDING+CELL_BORDER_WIDTH)*2
const TIPOS_DE_UNIDADES=[
	{
		nombre:'vacio'
	},
	{
		nombre:'Farmer',
		ataque:3,
		movimiento:4,
		vida:12,
		lealtad:2,
		rango:1,
		curar:0,
		cantidadTotal:parseInt(window.localStorage.carlosFarmersTotales)||0,
		cantidadUsada:parseInt(window.localStorage.carlosFarmersUsados)||0,
		image:'images/unit1.png',
		descripcion:''
	},
	{
		nombre:'Warrior',
		ataque:14,
		movimiento:4,
		vida:24,
		lealtad:6,
		rango:1,
		curar:0,
		image:'images/unit2.png',
		descripcion:''
	},
	{
		nombre:'Preacher',
		ataque:3,
		movimiento:4,
		vida:16,
		lealtad:3,
		rango:Math.SQRT2,
		curar:0,
		image:'images/unit3.png',
		descripcion:'Immune to preach.'
	},
	{
		nombre:'Archer',
		ataque:3,
		ataqueDeRango:14,
		movimiento:4,
		vida:8,
		lealtad:4,
		rango:3,
		curar:0,
		image:'images/unit4.png'
	}
];
const HEROES=[
	{
		nombre:'Klatu',
		ataque:3,
		movimiento:4,
		vida:28,
		lealtad:Infinity,
		rango:1,
		curar:0,
		image:'images/hero1.png'
	}
]
const WIDTH=320;
const WIDTH_MANO=54;
const WIDTH_TABLERO=WIDTH-WIDTH_MANO;


const NIVELES=[
	{
		height:7,
		width:3,
		enemigos:[
			new Unidad(TIPOS_DE_UNIDADES[1], 1, 0, BANDO_OPONENTE)
		],
		mazo:[]
	}
]
const MAX_WIDTH=Math.floor(WIDTH_TABLERO/(TAMAÑO_MINIMO_CELL));
const MAX_HEIGHT=Math.floor(HEIGHT_TABLERO/(TAMAÑO_MINIMO_CELL));
const PROPIEDADES_CARTAS={
	BACKSIDE:'https://rfclipart.com/image/big/ce-7c-03/pattern-on-backside-of-playing-card-Download-Royalty-free-Vector-File-EPS-89501.jpg',
	HEIGHT:(WIDTH_MANO-PADDING*2)*1.5,
	VISIBILIDAD:HEIGHT_MANO/24,
	WIDTH:WIDTH_MANO-PADDING*2
}

const CARTAS_POR_FILA=Math.floor((WIDTH-PADDING)/(PROPIEDADES_CARTAS.WIDTH+PADDING));

const TIPOS_DE_CARTAS=new Set().
	add({
		nombre:'Move',
		funcion:mover,
		tipo:'accion',
		title:'Moves a unit a number of cells equal to the unit\'s movement stat, in a vertical or horizontal line.',
		backgroundImage:'url(images/move.png)',
		numeroEnMazo:parseInt(window.localStorage.carlosMoveEnMazo)||4,
		funcionAgregar:function(){
			var cant=0;
			for(var tipo of TIPOS_DE_CARTAS) cant+=tipo.numeroEnMazo;
			return cant<CARTAS_POR_COLUMNA*CARTAS_POR_FILA;
		},
		funcionSacar:funcionSacar
	}).
	add({
		nombre:'Attack',
		funcion:atacar,
		tipo:'accion',
		title:'Attacks an enemy with one of your units. The damage done is equal to your unit\'s attack stat. The enemy must be in your unit\'s range.',
		backgroundImage:'url(images/attack.png)',
		numeroEnMazo:parseInt(window.localStorage.carlosAttackEnMazo)||4,
		funcionAgregar:function(){
			var cant=0;
			for(var tipo of TIPOS_DE_CARTAS) cant+=tipo.numeroEnMazo;
			return cant<CARTAS_POR_COLUMNA*CARTAS_POR_FILA;
		},
		funcionSacar:funcionSacar
	}).
	add({
		nombre:'Preach',
		funcion:preach,
		tipo:'accion',
		title:'Tries to convert all enemies in range to your faction, lowering their loyalty by 1 and making them unable to use cards for one turn. Heroes and preachers are immune to Preach. Can only be used by preachers.',
		backgroundImage:'url(images/preach.png)',
		numeroEnMazo:parseInt(window.localStorage.carlosPreachEnMazo)||0,
		funcionAgregar:function(){
			var cant=0;
			for(var tipo of TIPOS_DE_CARTAS) cant+=tipo.numeroEnMazo;
			return cant<CARTAS_POR_COLUMNA*CARTAS_POR_FILA;
		},
		funcionSacar:funcionSacar
	});

var accion;
var en;
var ladoCelda;
var manos;
var mazo;
var mazosTemporales;
var nivelActual;
var turno;
var unidades;
var formacion;
var unidadSeleccionada;

function activarSeleccionDeTerreno(){
	const TABLERO=document.getElementById('tablero');
	const CTX=TABLERO.getContext('2d');
	redimensionarTablero(TABLERO, document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
	var row;
	var unidad;
	if(accion===mover){
		var celdas=new Set();
		CTX.fillStyle='rgba(255, 255, 255, 0.5)';
		for(var i=unidadSeleccionada.x+1; i<=unidadSeleccionada.x+unidadSeleccionada.movimiento; i++){
			unidad=unidades[unidadSeleccionada.y][i];
			if(!unidad||unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(i*ladoCelda, unidadSeleccionada.y*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(i=unidadSeleccionada.x-1; unidadSeleccionada.x-unidadSeleccionada.movimiento<=i; i--){
			unidad=unidades[unidadSeleccionada.y][i];
			if(!unidad||unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(i*ladoCelda, unidadSeleccionada.y*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(i=unidadSeleccionada.y+1; i<=unidadSeleccionada.y+unidadSeleccionada.movimiento; i++){
			if(row=unidades[i]) unidad=row[unidadSeleccionada.x];
			else break;
			if(unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(unidadSeleccionada.x*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(var i=unidadSeleccionada.y-1; unidadSeleccionada.y-unidadSeleccionada.movimiento<=i; i--){
			if(row=unidades[i]) unidad=row[unidadSeleccionada.x];
			else break;
			if(unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(unidadSeleccionada.x*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		TABLERO.onclick=function(event){
			const x=Math.floor((event.clientX-this.offsetLeft)/ladoCelda);
			const y=Math.floor((event.clientY-this.offsetTop)/ladoCelda);
			if(celdas.has(unidades[y][x])) moverA(x, y);
		}
	}
}

function activarSeleccionDeUnidades(funcion){
	for(var i=unidades.length-1; i>=0; i--){
		for(var j=unidades[i].length-1; j>=0; j--){
			var unidad=unidades[i][j];
			if(funcion(unidad)&&unidad.nombre!=='vacio'){
				unidad.div.style.animation=unidad.bando+' 2s infinite linear';
				unidad.div.onclick=function(){
					for(var i=unidades.length-1; i>=0; i--){
						for(var j=unidades[i].length-1; j>=0; j--){
							var unidad=unidades[i][j];
							if(unidad.nombre!=='vacio'){
								unidad.div.style.animation=null;
								unidad.div.onclick=null;
							}
						}
					}
					document.getElementById('tablero').onclick=null;
					if(unidadSeleccionada===null){
						unidadSeleccionada=this.unidad; //esto lo tengo que arreglar, pero por ahora sirve
						if(accion===mover) activarSeleccionDeTerreno();
						else if(accion===atacar) activarSeleccionDeUnidades(function(unidad){return unidad.bando!==BANDO_JUGADOR&&distancia(unidad, unidadSeleccionada)<=unidadSeleccionada.rango;});
						else if(accion===preach){
							remove(cartaSeleccionada);
							for(var i=unidades.length-1; i>=0; i--){
								for(var j=unidades[i].length-1; j>=0; j--){
									var unidad=unidades[i][j];
									if(unidad.nombre!=='vacio'&&unidad.nombre!=='preacher'&&unidad.bando!==unidadSeleccionada.bando&&distancia(unidad, unidadSeleccionada)<=unidadSeleccionada.rango){
										unidad.preach=true;
										bajarLoyalty(unidad, 1);
										actualizarTitle(unidad);
									}
								}
							}
						}
					}
					else{
						unidad=this.unidad;
						if(accion===atacar){
							remove(cartaSeleccionada);
							daño=Math.pow(unidad.x-unidadSeleccionada.x, 2)+Math.pow(unidad.y-unidadSeleccionada.y, 2)<4?unidadSeleccionada.ataque:unidadSeleccionada.ataqueDeRango;
							unidad.vida-=daño;
							if(unidad.vida<=0){
								unidad.div.remove();
								unidades[unidad.y][unidad.x]=new Unidad(TIPOS_DE_UNIDADES[0], unidad.x, unidad.y);
							}
							else actualizarTitle(unidad);
						}
					}
				}
			}
		}
	}
}

function actualizarBotonesEditor(){
	for(var tipo of TIPOS_DE_CARTAS){
		if(tipo.funcionAgregar()) enable(tipo.botonAgregar);
		else disable(tipo.botonAgregar);
		if(tipo.funcionSacar()) enable(tipo.botonSacar);
		else disable(tipo.botonSacar);
	}
	actualizarMazo();
}

function actualizarMazo(){
	for(var i=mazo.length-1; i>=0; i--){
		mazo[i].div.remove();
	}
	mazo=[];
	for(var tipo of TIPOS_DE_CARTAS) for(var i=0; i<tipo.numeroEnMazo; i++) mazo.push(new Carta(tipo, BANDO_JUGADOR));
	for(i=0; i<mazo.length; i++) document.getElementsByClassName('cartaDelMazo')[i].appendChild(mazo[i].div);
}

function actualizarTitle(unidad){
	unidad.div.title=
		unidad.nombre+'\n'+
		'Life: '+unidad.vida+'/'+unidad.vidaMax+'\n'+
		'Loyalty: '+unidad.lealtad+'\n'+
		'Attack: '+unidad.ataque+'\n'+
		(unidad.ataqueDeRango?'Attack: '+unidad.ataqueDeRango+'\n':'')+
		'Range: '+unidad.rango+'\n'+
		'Movement: '+unidad.movimiento+'\n'+
		unidad.tipo.descripcion+
		(unidad.preach?'\nThis unit cannot use cards.':'');
}

function allowDrop(event){
	event.preventDefault();
}

function atacar(){
	activarSeleccionDeUnidades(function(unidad){return unidad.ataque>0&&unidad.bando===BANDO_JUGADOR;});
}

function bajarLoyalty(unidad, x){
	unidad.lealtad-=x;
	if(unidad.lealtad<0){
		unidad.bando=unidad.bando===BANDO_JUGADOR?BANDO_OPONENTE:BANDO_JUGADOR;
		unidad.div.style.borderColor=unidad.bando;
		unidad.lealtad*=-1;
	}
}

function Carta(tipo, bando){
	var onclick=tipo.funcion;
	this.div=document.createElement('div');
	this.div.onclick=function(){
		if(turno===BANDO_JUGADOR&&en==='juego'){
			accion=onclick;
			cartaSeleccionada=this;
			unidadSeleccionada=null; //esto lo tengo que arreglar, pero por ahora sirve
			for(var i=unidades.length-1; i>=0; i--){
				for(var j=unidades[i].length-1; j>=0; j--){
					var unidad=unidades[i][j];
					if(unidad.nombre!=='vacio'){
						unidad.div.style.animation=null;
						unidad.div.onclick=null;
					}
				}
			}
			document.getElementById('tablero').onclick=null;
			var temp=unidades;
			redimensionarTablero(document.getElementById('tablero'), document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
			unidades=temp;
			onclick()
		}
	};
	this.div.className='carta';
	this.div.objeto=this;
	this.div.style.backgroundImage=tipo.backgroundImage;
	this.div.title=tipo.title;
	if(bando!==BANDO_JUGADOR){
		this.div.style.backgroundImage='url('+PROPIEDADES_CARTAS.BACKSIDE+')';
		this.div.title='';
		this.div.onclick=null;
	}
	this.bando=bando;
}

function comenzarPartida(){
	const WIDTH=parseInt(document.getElementById('selectColumnas').value);
	const HEIGHT=parseInt(document.getElementById('selectFilas').value);
	eliminarUnidadesPrevias();
	const DIVS_MAZOS=document.getElementsByClassName('mazo');
	redimensionarTablero(document.getElementById('tablero'), WIDTH, HEIGHT);
	for(var i=0; i<HEIGHT; i++){
		unidades.push([])
		for(var j=0; j<WIDTH; j++) unidades[i].push(new Unidad(TIPOS_DE_UNIDADES[0], j, i));
	}
	if(typeof nivelActual==='number') for(var template of NIVELES[nivelActual].enemigos){
		var unidad=new Unidad(template.tipo, template.x, template.y, template.bando);
		var div=crearDivDeUnidad(unidad, '');
		document.getElementById('container').appendChild(div);
		unidades[template.y][template.x]=unidad
	}
	for(var template of formacion){
		var unidad=new Unidad(template.tipo, template.x, template.y+HEIGHT-2, template.bando);
		var div=crearDivDeUnidad(unidad, '');
		document.getElementById('container').appendChild(div);
		console.log(template.y+HEIGHT-2, template.y, HEIGHT)
		unidades[template.y+HEIGHT-2][template.x]=unidad
	}
	mostrar('juego');
	mazosTemporales[BANDO_JUGADOR]=mazo.slice(0);
	mazosTemporales[BANDO_OPONENTE]=NIVELES[0].mazo.slice(0);
	shuffle(mazosTemporales[BANDO_JUGADOR]);
	shuffle(mazosTemporales[BANDO_OPONENTE]);
	manos={[BANDO_JUGADOR]:[], [BANDO_OPONENTE]:[]};
	DIVS_MAZOS[0].innerHTML='<span class="cantidadDeCartas">'+mazosTemporales[BANDO_JUGADOR].length+'</span>';
	DIVS_MAZOS[1].innerHTML='<span class="cantidadDeCartas">'+mazosTemporales[BANDO_OPONENTE].length+'</span>';
	for(i=0; i<TAMAÑO_MANO; i++){
		levantarCarta(BANDO_JUGADOR);
		levantarCarta(BANDO_OPONENTE);
	}
	turno=BANDO_JUGADOR;
}

function crearDivDeUnidad(unidad, tablero){
	const DIV=document.createElement('DIV');
	unidad.div=DIV;
	DIV.unidad=unidad;
	DIV.className='unidad';
	DIV.style.left=unidad.x*ladoCelda+CELL_BORDER_WIDTH+'px';
	DIV.style.top=unidad.y*ladoCelda+CELL_BORDER_WIDTH-document.getElementById('tablero'+tablero).height/2+'px';
	DIV.style.width=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
	DIV.style.height=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
	DIV.style.border=PADDING+'px solid '+unidad.bando;
	DIV.style.backgroundImage='url('+unidad.tipo.image+')';
	actualizarTitle(unidad);
	return DIV;
}

function descartarMano(bando){
	for(var carta of manos[bando]) remove(carta);
	pasarTurno();
}

function disable(elemento){
	elemento.enabled=false;
	elemento.style.opacity=0.5;
}

function distancia(a, b){
	return Math.sqrt(Math.pow(a.x-b.x, 2)+Math.pow(a.y-b.y, 2));
}

function drag(event){
	event.dataTransfer.setData("tipo", TIPOS_DE_UNIDADES.indexOf(event.target.tipo));
}

function drop(event){
	event.preventDefault();
	const x=Math.floor((event.clientX-document.getElementById('tableroDeEditor').offsetLeft)/ladoCelda);
	const y=Math.floor((event.clientY-document.getElementById('tableroDeEditor').offsetTop)/ladoCelda);
	var tipo=event.dataTransfer.getData("tipo");
	var unidad=new Unidad(TIPOS_DE_UNIDADES[parseInt(tipo)], x, y, BANDO_JUGADOR);
	const DIV=crearDivDeUnidad(unidad, 'DeEditor')
	DIV.ondrop=function(event){
		formacion.splice(formacion.indexOf(this.unidad), 1);
		this.remove();
		drop(event);
	}
	DIV.ondragover=allowDrop;
	document.getElementById('containerDeEditor').appendChild(DIV);
	formacion.push(unidad);
}

function editarFormacion(){
	eliminarUnidadesDeEditorPrevias();
	mostrar('editorDeFormaciones');
	redimensionarTablero(document.getElementById('tableroDeEditor'), document.getElementById('selectColumnas').value, 2);
	unidadesDisponibles.innerHTML='';
	for(var i=1; i<TIPOS_DE_UNIDADES.length; i++){
		var tipo=TIPOS_DE_UNIDADES[i];
		//borrar desde acá...
		tipo.cantidadTotal=parseInt(document.getElementById('selectColumnas').value);
		tipo.cantidadUsada=0;
		//hasta acá
		if(tipo.cantidadTotal){
			var div=document.createElement('div');
			var span=document.createElement('span');
			span.className='cantidadDeCartas';
			span.style.position='absolute';
			span.style.right=span.style.bottom=0;
			span.innerText=tipo.cantidadTotal-tipo.cantidadUsada;
			span.tipo=tipo;
			div.style.backgroundImage='url('+tipo.image+')';
			div.appendChild(span);
			div.draggable=true;
			div.ondragstart=drag;
			div.tipo=tipo;
			document.getElementById('unidadesDisponibles').appendChild(div);
		}
	}
	i=0;
	do{
		i++;
		STYLESHEET_UNIDADES_DISPONIBLES.innerHTML=
			'#unidadesDisponibles>div{'+
			'	height:'+i+'px;'+
			'	width:'+i+'px;'+
			'}';
	} while(document.getElementById('editorDeFormaciones').offsetHeight<HEIGHT)
	i--;
	STYLESHEET_UNIDADES_DISPONIBLES.innerHTML=
			'#unidadesDisponibles>div{'+
			'	height:'+i+'px;'+
			'	width:'+i+'px;'+
			'}';
}

function eliminarUnidadesDeEditorPrevias(){
	for(var unidad of formacion) unidad.div.remove();
	formacion=[];
}

function eliminarUnidadesPrevias(){
	for(var i=unidades.length-1; i>=0; i--) for(var j=unidades[i].length-1; j>=0; j--) if(unidades[i][j].div) unidades[i][j].div.remove();
	unidades=[];
}

function enable(elemento){
	elemento.enabled=true;
	elemento.style.opacity=1;
}

function filtrarCartas(funcion){
	const cartas=document.getElementsByClassName('cartaEnEditor');
	for(var i=cartas.length-1; i>=0; i--){
		var carta=cartas[i];
		if(funcion(carta.objeto)) carta.style.display='';
		else carta.style.display='none';
	}
}

function funcionSacar(){
	return this.numeroEnMazo&&mazo.length;
}

function levantarCarta(bando){
	const DIV_MAZO=document.getElementsByClassName('mazo')[bando===BANDO_JUGADOR?0:1];
	if(DIV_MAZO.innerText>0){
		const mazo=mazosTemporales[bando];
		if(mazo.length){
			const carta=mazo.pop().div;
			document.getElementById('mano').appendChild(carta);
			manos[bando].push(carta);
		}
		DIV_MAZO.innerHTML='<span class="cantidadDeCartas">'+mazosTemporales[bando].length+'</span>';
	}
	ordenarMano(bando);
}

function mostrar(id){
	for(var i=document.body.children.length-1; i>=0; i--) document.body.children[i].style.display='none';
	document.getElementById(id).style.display=null;
	en=id;
}

function mover(){
	activarSeleccionDeUnidades(function(unidad){return unidad.movimiento>0&&unidad.bando===BANDO_JUGADOR;});
}

function moverA(x, y){
	//borro los cosos blancos que marcan a donde te podés mover
	var temp=unidades;
	redimensionarTablero(document.getElementById('tablero'), document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
	unidades=temp;
	//muevo el elemento
	unidadSeleccionada.div.style.left=x*ladoCelda+CELL_BORDER_WIDTH+'px';
	unidadSeleccionada.div.style.top=y*ladoCelda+CELL_BORDER_WIDTH-document.getElementById('tablero').height/2+'px';
	//actualizo el array unidades
	unidades[unidadSeleccionada.y][unidadSeleccionada.x]=new Unidad(TIPOS_DE_UNIDADES[0], unidadSeleccionada.x, unidadSeleccionada.y);
	unidades[y][x]=unidadSeleccionada;
	//actualizo la unidadSeleccionada
	unidadSeleccionada.x=x;
	unidadSeleccionada.y=y;
	remove(cartaSeleccionada);
}

function onkeydown(event){
	key=event.keyCode?event.keyCode:event.charCode;
	console.log('Se presionó la tecla con keyCode: '+key);
	//si presionás la D mientras estás jugando...
	if(key===68&&en==='juego') descartarMano(BANDO_JUGADOR);
	//si presionás ESC...
	if(key===27) mostrar('menuPrincipal');
}

function onload(){
	const HEIGHT_MAZO=PROPIEDADES_CARTAS.VISIBILIDAD*(CARTAS_POR_COLUMNA-1)+PROPIEDADES_CARTAS.HEIGHT+PADDING*2;
	nivelActual=0;
	document.getElementById('mazo').style.height=HEIGHT_MAZO+'px';
	document.getElementById('cartas').style.height=HEIGHT-HEIGHT_MAZO+'px';
	for(var tipo of TIPOS_DE_CARTAS){
		var div=document.createElement('div');
		div.objeto=tipo;
		div.className='cartaEnEditor';
		var descripcion=document.createElement('div');
		descripcion.innerHTML='<h3>'+tipo.nombre+'</h3>'+tipo.title;
		div.appendChild(descripcion);
		var botones=document.createElement('div');
		var agregar=document.createElement('div');
		agregar.className='btn btn_action botonEditor';
		agregar.innerText='Add';
		tipo.botonAgregar=agregar;
		agregar.onclick=function(){
			if(this.enabled){
				var tipo=arguments.callee.tipo;
				tipo.numeroEnMazo++;
				window.localStorage['carlos'+tipo.nombre+'EnMazo']=tipo.numeroEnMazo;
				actualizarBotonesEditor();
			}
		}
		agregar.onclick.tipo=tipo;
		var sacar=document.createElement('div');
		sacar.className='btn btn_action botonEditor';
		sacar.innerText='Take out';
		tipo.botonSacar=sacar;
		sacar.onclick=function(){
			if(this.enabled){
				var tipo=arguments.callee.tipo;
				tipo.numeroEnMazo--;
				window.localStorage['carlos'+tipo.nombre+'EnMazo']=tipo.numeroEnMazo;
				actualizarBotonesEditor();
			}
		}
		sacar.onclick.tipo=tipo;
		botones.appendChild(agregar);
		botones.appendChild(sacar);
		div.appendChild(botones);
		document.getElementById('bodyCartas').appendChild(div);
	}
	mazo=[];
	mazosTemporales={};
	for(i=0; i<CARTAS_POR_FILA; i++){
		for(j=0; j<CARTAS_POR_COLUMNA; j++){
			var div=document.createElement('div');
			div.className='cartaDelMazo';
			div.style.left=PADDING+i*(PADDING+PROPIEDADES_CARTAS.WIDTH)+'px'
			div.style.top=PADDING+j*(PROPIEDADES_CARTAS.VISIBILIDAD)+'px'
			document.getElementById('mazo').appendChild(div);
		}
	}
	actualizarMazo();
	actualizarBotonesEditor();
	document.body.style.width=WIDTH+'px';
	document.body.style.height=HEIGHT+'px';
	document.head.appendChild(STYLESHEET);
	document.head.appendChild(STYLESHEET_UNIDADES_DISPONIBLES);
	for(var i=1; i<=MAX_WIDTH; i+=2){
		var option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectColumnas').appendChild(option);
	}
	for(i=4; i<=MAX_HEIGHT; i++){
		option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectFilas').appendChild(option);
	}
	document.getElementById('selectColumnas').value=window.localStorage.carlosWidth;
	document.getElementById('selectFilas').value=window.localStorage.carlosHeight;
	document.getElementById('botonJugar').addEventListener('click', function(){mostrar('opcionesPreviasAlJuego')});
	document.getElementById('botonEditarMazo').addEventListener('click', function(){mostrar('feature')});
	document.getElementById('botonEditarFormacion').addEventListener('click', editarFormacion);
	document.getElementById('botonComenzarPartida').addEventListener('click', comenzarPartida);
	STYLESHEET.innerHTML=
		'#mano{'+
		'	height:'+HEIGHT_MANO+'px;'+
		'	width:'+WIDTH_MANO+'px;'+
		'}'+
		'.mazo, .carta{'+
		'	background-image: url('+PROPIEDADES_CARTAS.BACKSIDE+');'+
		'	height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	left:'+PADDING+'px;'+
		'	line-height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	width:'+PROPIEDADES_CARTAS.WIDTH+'px;'+
		'}'+
		'@keyframes '+BANDO_OPONENTE+'{'+
		'	0%   {border: '+PADDING+'px solid '+BANDO_OPONENTE+';}'+
		'	50%  {border: '+PADDING+'px solid #ffffff;}'+
		'	100% {border: '+PADDING+'px solid '+BANDO_OPONENTE+';}'+
		'}'+
		'@keyframes '+BANDO_JUGADOR+'{'+
		'	0%   {border: '+PADDING+'px solid '+BANDO_JUGADOR+';}'+
		'	50%  {border: '+PADDING+'px solid #ffffff;}'+
		'	100% {border: '+PADDING+'px solid '+BANDO_JUGADOR+';}'+
		'}';
	for(i=0; i<=1; i++){
		var div=document.createElement('div');
		div.className='mazo';
		div.style.top=HEIGHT_MANO/2+(i?-PROPIEDADES_CARTAS.HEIGHT-PADDING:PADDING)+'px';
		document.getElementById('mano').appendChild(div);
	}
	for(i=0; i<TAMAÑO_MANO; i++){
		var divEnemigo=document.createElement('div');
		var divJugador=document.createElement('div');
		divEnemigo.className=BANDO_OPONENTE+' absolute';
		divEnemigo.style.top=PADDING+i*PROPIEDADES_CARTAS.VISIBILIDAD+'px';
		divEnemigo.style.zIndex=divEnemigo.baseZIndex=i;
		divJugador.className=BANDO_JUGADOR+' absolute';
		divJugador.onmouseout=onmouseoutCarta;
		divJugador.onmouseover=onmouseoverCarta;
		divJugador.style.bottom=PROPIEDADES_CARTAS.HEIGHT+PADDING+i*20+'px';
		divJugador.style.zIndex=divJugador.baseZIndex=8-i;
		document.getElementById('mano').appendChild(divEnemigo);
		document.getElementById('mano').appendChild(divJugador);
	}
	unidades=[];
	formacion=[];
}

function onmouseoutCarta(){
	this.style.zIndex=this.baseZIndex;
}

function onmouseoverCarta(){
	this.style.zIndex=9;
}

function ordenarMano(bando){
	for(var i=0; i<manos[bando].length; i++) document.getElementsByClassName(bando)[i].appendChild(manos[bando][i]);
}

function pasarTurno(){
	turno=turno===BANDO_JUGADOR?BANDO_JUGADOR:BANDO_OPONENTE; //dar vuelta;
}

function preach(){
	activarSeleccionDeUnidades(function(unidad){return unidad.nombre==='Preacher'&&unidad.bando===BANDO_JUGADOR;});
}

function redimensionarTablero(tablero, width, height){
	const CTX=tablero.getContext('2d');
	CTX.strokeStyle=CELL_BORDER_COLOR;
	ladoCelda=Math.min(Math.floor(WIDTH_TABLERO/width), Math.floor(HEIGHT_TABLERO/height));
	tablero.width=ladoCelda*width;
	tablero.height=ladoCelda*height;
	for(var i=0; i<height; i++) for(var j=0; j<width; j++) CTX.strokeRect(j*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
	if(tablero===document.getElementById('tablero')){
		window.localStorage.carlosWidth=width;
		window.localStorage.carlosHeight=height;
	}
}

function remove(carta){
	console.log(mazosTemporales[BANDO_JUGADOR], manos[BANDO_JUGADOR])
	manos[BANDO_JUGADOR].splice(manos[BANDO_JUGADOR].indexOf(carta), 1);
	manos[BANDO_OPONENTE].splice(manos[BANDO_OPONENTE].indexOf(carta), 1);
	carta.remove();
	levantarCarta(turno);
	pasarTurno();
}

function shuffle(array) {
	let counter=array.length;
	//while there are elements in the array
	while(counter>0){
		//pick a random index...
		let index=Math.floor(Math.random()*counter);
		//decrease counter by 1
		counter--;
		//and swap the last element with it
		let temp=array[counter];
		array[counter]=array[index];
		array[index]=temp;
	}
	return array;
}

function Unidad(tipo, x, y, bando){
	this.ataque=tipo.ataque;
	this.ataqueDeRango=tipo.ataqueDeRango;
	this.bando=bando;
	this.lealtad=tipo.lealtad;
	this.movimiento=tipo.movimiento;
	this.nombre=tipo.nombre;
	this.rango=tipo.rango
	this.tipo=tipo;
	this.vida=tipo.vida;
	this.vidaMax=tipo.vida;
	this.x=x;
	this.y=y;
}

window.addEventListener('load', onload);
window.addEventListener('keydown', onkeydown);